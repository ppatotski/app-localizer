const Transform = require( 'stream' ).Transform;
const fs = require( 'fs' );
const path = require( 'path' );
const mapping = require( './mapping.json' );

/**
 * @typedef GeneratorOptions
 * @type {Object}
 * @property {number} expander Sentance expanding factor (0.3 = 30%).
 * @property {number} wordexpander Word expanding factor (0.5 = 50%).
 * @property {boolean} accents Convert letter to its accent version.
 * @property {boolean} exclamations Enclose in exclamations.
 * @property {boolean} brackets Enclose in brackets.
 * @property {boolean} rightToLeft Left-to-Right.
 *
 * @typedef PseudoLocalizerOptions
 * @property {number} expander Sentance expanding factor (0.3 = 30%).
 * @property {number} wordexpander Word expanding factor (0.5 = 50%).
 * @property {boolean} accents Convert letter to its accent version.
 * @property {boolean} exclamations Enclose in exclamations.
 * @property {boolean} brackets Enclose in brackets.
 * @property {boolean} rightToLeft Left-to-Right.
 * @property {string} format Structure of locale file content (polymer, angular.flat).
 *
 * @typedef ValidateOptions
 * @property {boolean} multiFile Locale is localed in separate file.
 * @property {string} fileStructure Structure of locale file content (polymer, angular.flat).
*/

function splitIntoWords(text) {
	let result = [];
	let tokenIndex = 0;
	let word = '';
	[...text].forEach((char) => {
		if(char === '{') {
			if(!tokenIndex && word) {
				result.push(word);
				word = '';
			}
			tokenIndex++;
			word += char;
		} else if(char === '}') {
			tokenIndex--;
			word += char;
			if(!tokenIndex) {
				result.push(word);
				word = '';
			}
		} else if (char === ' ' && !tokenIndex) {
			if (word !== '') {
				result.push(word);
			}
			word = '';
		} else {
			word += char;
		}
	});
	if (word !== '') {
		result.push(word);
	}
	return result;
}

/**
 * Generates pseudo text.
 *
 * @param {string} text Input text.
 * @param {GeneratorOptions} options Generator options:
 * @returns {string} Pseudo generated text
 */
function toPseudoText(text, options) {
	if(options && text) {
		let words = splitIntoWords(text);
		const isToken = function isToken(word) {
			return word[0] === '{' && word[word.length - 1] === '}';
		};
		const expand = function expand(items, factor, callback) {
			const extraCount = Math.round(items.length * factor);
			let extraPosition = 0;
			for (let i = 0; i < extraCount; i += 1) {
				const position = Math.round(extraPosition);
				const expandedPosition = Math.round((items.length + extraCount - 1) / (items.length - 1) * extraPosition) + 1;
				callback(expandedPosition, items[position]);
				extraPosition += (items.length - 1) / extraCount;
			}
		};

		if(options.expander) {
			const extendedWords = words.slice(0);
			expand(words, options.expander, (position, item) => {
				extendedWords.splice(position, 0, item);
			});
			words = extendedWords;
		}

		if(options.wordexpander) {
			const expandedWords = [];
			words.forEach((word) => {
				if(!isToken(word)) {
					let expandedWord = word;
					expand(word, options.wordexpander, (position, item) => {
						expandedWord = `${expandedWord.substring(0, position)}${item}${expandedWord.substring(position)}`;
					});
					word = expandedWord;
				}

				expandedWords.push(word);
			});
			words = expandedWords;
		}

		if(options.accents) {
			const accentedWords = [];
			words.forEach((word) => {
				if(!isToken(word)) {
					word = [...word].map(char => mapping[char] ? mapping[char] : char).join('');
				}

				accentedWords.push(word);
			});
			words = accentedWords;
		}

		if(options.exclamations) {
			words.splice(0, 0, '!!!');
			words.push('!!!');
		}

		if(options.brackets) {
			if(options.exclamations) {
				words[0] = '[!!!';
				words[words.length - 1] = '!!!]';
			} else {
				words.splice(0, 0, '[');
				words.push(']');
			}
		}

		text = words.join(' ');
		// let wasToken = false;
		// words.forEach((word, index) => {
		// 	if(isToken(word)) {
		// 		text += word;
		// 		wasToken = true;
		// 	} else {
		// 		if(wasToken || index === 0 || (index === (words.length - 1) && word === '')) {
		// 			text += word;
		// 		} else {
		// 			text += ` ${word}`;
		// 		}
		// 		wasToken = false;
		// 	}
		// });

		if(options.rightToLeft) {
			const RLO = '\u202e';
			const PDF = '\u202c';
			const RLM = '\u200F';
			text = RLM + RLO + text + PDF + RLM;
		}
	}
	return text;
};

exports.toPseudoText = toPseudoText;

/**
 * Generates pseudo locale.
 *
 * @param {PseudoLocalizerOptions} options Generator options.
 * @param {string} text Input json file content.
 * @returns {string} Pseudo generated json content
 */
function pseudoLocalizeContent(options, text) {
	let locale = JSON.parse(text);
	const localename = options.format === 'angular.flat' ? '' : Object.keys(locale)[ 0 ];
	const result = {};

	if (localename) {
		locale = locale[localename];
	}

	Object.keys(locale).forEach((key) => {
		result[key] = toPseudoText(locale[key], options);
	} );

	return JSON.stringify( localename ? { pseudo: result } : result, null, '\t' );
};

exports.pseudoLocalizeContent = pseudoLocalizeContent;

/**
 * Generates pseudo locale (gulp).
 *
 * @param {PseudoLocalizerOptions} options Generator options.
 * @returns {Transform}
 */
function pseudoLocalize(options) {
	return new Transform({
		objectMode: true,
		transform: function(file, enc, callback) {
			if (file.isNull()) {
				return callback(null, file);
			}
			file.contents = new Buffer(pseudoLocalizeContent(options, file.contents));
			return callback(null, file);
		}
	});
};

exports.pseudoLocalize = pseudoLocalize;

/**
 * Validates locales for missing labels.
 *
 * @param {Object} locales Object with all locales.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @returns {Object} Validation result
 */
function validateLocalesContent(locales, baseLocale) {
	let result = undefined;
	if(!baseLocale) {
		baseLocale = locales;
	}
	Object.keys(baseLocale).forEach((localeName) => {
		Object.keys(baseLocale[localeName]).forEach((label) => {
			Object.keys(locales).filter(key => key !== localeName).forEach((otherLocaleName) => {
				if(!Object.keys(locales[otherLocaleName]).some(otherLabel => otherLabel === label)) {
					if(!result) {
						result = {};
					}
					if(!result[localeName]) {
						result[localeName] = {};
					}
					if(!result[localeName][label]) {
						result[localeName][label] = [];
					}
					result[localeName][label].push(otherLocaleName);
				}
			});
		});
	});
	return result;
};

exports.validateLocalesContent = validateLocalesContent;

/**
 * Validates locales for missing labels.
 *
 * @param {string} filePath Path to locale files.
 * @param {ValidateOptions} options Validate options.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @param {function} callback Function callback with result of errors as a first parameter (result is undefined in case of success).
 */
function validateLocales(filePath, options, baseLocale, callback) {
	if(options.multiFile) {
		fs.readdir(filePath, (err, files) => {
			if(err) {
				throw err;
			}
			const noLocaleKey = options.fileStructure === 'angular.flat';
			const locales = {};
			let fileCount = files.length;
			files.forEach(file => {
				fs.readFile(path.join(filePath, file), (err, buffer) => {
					if(err) {
						throw err;
					}
					fileCount -= 1;
					const locale = JSON.parse(buffer);
					const localeName = noLocaleKey? file.substring(0, file.lastIndexOf('.')) : Object.keys(locale)[0];
					locales[localeName] = noLocaleKey? locale : locale[localeName];
					if(!fileCount) {
						const result = validateLocalesContent(locales, baseLocale);
						callback(result);
					}
				});
			});
		});
	} else {
		fs.readFile(filePath, (err, buffer) => {
			if(err) {
				throw err;
			}
			const result = validateLocalesContent(JSON.parse(buffer));
			callback(result);
		});
	}
};

exports.validateLocales = validateLocales;

/**
 * Validates locales for missing labels in multiple folders.
 *
 * @param {string[]} paths Paths to locale files.
 * @param {ValidateOptions} options Validate options.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @param {function} callback Function callback with result of errors as a first parameter (result is undefined in case of success).
 */
function validateMultipleLocales(paths, options, baseLocale, callback) {
	let overallResult = undefined;
	let pathCount = 0;
	paths.forEach((path) => {
		validateLocales(path, options, baseLocale, (result) => {
			pathCount += 1;
			if(result) {
				if(!overallResult) {
					overallResult = {};
				}
				overallResult[path] = result;
			}
			if(pathCount === paths.length) {
				callback(overallResult);
			}
		});
	});
};

exports.validateMultipleLocales = validateMultipleLocales;
