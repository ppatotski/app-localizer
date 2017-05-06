const Transform = require( 'stream' ).Transform;
const fs = require( 'fs' );
const path = require( 'path' );
const mapping = require( './mapping.json' );
const messageParser = require( 'intl-messageformat-parser' );

/**
 * @typedef GeneratorOptions
 * @type {Object}
 * @property {number} expander Sentance expanding factor (0.3 = 30%).
 * @property {number} wordexpander Word expanding factor (0.5 = 50%).
 * @property {boolean} accents Convert letter to its accent version.
 * @property {boolean} exclamations Enclose in exclamations.
 * @property {boolean} brackets Enclose in brackets.
 * @property {boolean} rightToLeft Left-to-Right.
 * @property {boolean} forceException throw syntax exception if any.
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

/**
 * Transform sentences into expanded sentences with accents.
 *
 * @param {string} text Sentences.
 * @param {GeneratorOptions} options Generator options.
 * @returns {string} Pseudo generated sentences.
 */
function transformSentences(text, options) {
	if(options && text && text !== ' ') {
		let words = text.split(' ');
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
				let expandedWord = word;
				expand(word, options.wordexpander, (position, item) => {
					expandedWord = `${expandedWord.substring(0, position)}${item}${expandedWord.substring(position)}`;
				});
				expandedWords.push(expandedWord);
			});
			words = expandedWords;
		}

		if(options.accents) {
			const accentedWords = [];
			words.forEach((word) => {
				word = [...word].map(char => mapping[char] ? mapping[char] : char).join('');
				accentedWords.push(word);
			});
			words = accentedWords;
		}

		text = words.join(' ');
	}
	return text;
};

/**
 * Walk through parsed AST.
 *
 * @param {Object} node parsed AST.
 * @param {Object[]} parts List of text parts.
 */
function walkAST(node, parts) {
	switch(node.type) {
		case 'messageTextElement':
			// Hashtag is a key word
			const hash = node.value.split('#');
			if(hash.length > 1) {
				hash.forEach((part) => {
					parts.push({ token: false, text: part });
					parts.push({ token: true, text: '#' });
				});
				parts.pop();
			} else {
				parts.push({ token: false, text: node.value });
			}
			break;
		case 'messageFormatPattern':
			node.elements.forEach((subnode) => walkAST(subnode, parts));
			break;
		case 'argumentElement':
			parts.push({ token: true, text: `{${node.id}` });
			if(node.format) {
				walkAST(node.format, parts);
			}
			parts.push({ token: true, text: '}' });
			break;
		case 'pluralFormat':
			parts.push({ token: true, text: `, ${node.ordinal ? 'selectordinal' : 'plural'},` });
			if(node.options) {
				node.options.forEach((subnode) => walkAST(subnode, parts));
			}
			break;
		case 'selectFormat':
			parts.push({ token: true, text: `, select,` });
			if(node.options) {
				node.options.forEach((subnode) => walkAST(subnode, parts));
			}
			break;
		case 'optionalFormatPattern':
			parts.push({ token: true, text: ` ${node.selector} {` });
			walkAST(node.value, parts);
			parts.push({ token: true, text: '}' });
			break;
		case 'dateFormat':
		case 'numberFormat':
		case 'timeFormat':
			parts.push({ token: true, text: `, ${node.type.substring(0, node.type.length - 'Format'.length)}, ${node.style}${node.offset ? `, offset:${node.offset}`: ''}` });
			break;
	}
};

/**
 * Generates pseudo text.
 *
 * @param {string} text Input text.
 * @param {GeneratorOptions} options Generator options
 * @returns {string} Pseudo generated text
 */
function toPseudoText(text, options) {
	let result = text;
	if(options) {
		let message = undefined;
		try {
			message = messageParser.parse(text);
		} catch(err) {
			if(options.forceException) {
				throw err;
			}
		}

		const parts = [];
		if(message) {
			walkAST(message, parts, options);
		} else {
			parts.push({ text });
		}

		for (let index = 0; index < parts.length; index++) {
			if(!parts[index].token && parts[index].text !== ' ') {
				// Text part can start or end with space
				const startsFromSpace = parts[index].text[0] === ' ';
				const endsWithSpace = parts[index].text[parts[index].text.length - 1] === ' ';

				parts[index].text = `${startsFromSpace ? ' ': ''}${transformSentences(parts[index].text.trim(), options)}${endsWithSpace ? ' ': ''}`;
			}
		}

		if(options.exclamations) {
			parts.splice(0, 0, { text: '!!! ' });
			parts.push({ text: ' !!!' });
		}

		if(options.brackets) {
			parts.splice(0, 0, { text: '[ ' });
			parts.push({ text: ' ]' });
		}

		result = parts.map((part) => part.text).join('');

		if(options.rightToLeft) {
			const RLO = '\u202e';
			const PDF = '\u202c';
			const RLM = '\u200F';
			result = RLM + RLO + result + PDF + RLM;
		}
	}
	return result;
};

exports.toPseudoText = toPseudoText;

/**
 * Generates pseudo locale.
 *
 * @param {PseudoLocalizerOptions} options Generator options.
 * @param {string} text Input json file content.
 * @returns {string} Pseudo generated json content.
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
 * @returns {Object} Validation result.
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
