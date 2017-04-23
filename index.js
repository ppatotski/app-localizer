const Transform = require( 'stream' ).Transform;
const fs = require( 'fs' );
const mapping = require( './mapping.json' );
const numbers = require( './numbers.json' );

exports.toPseudoText = function toPseudoText(text, options) {
	if(options && text) {
		let words = text.split(' ');
		const isToken = function isToken(word) {
			return word[0] === '{' && word[word.length - 1] === '}';
		};

		if(options.expander) {
			const extraWordCount = Math.round(words.length * options.expander);
			let extraWordPosition = 0;
			for (let i = 0; i < extraWordCount; i += 1) {
				const expandedPosition = Math.round((words.length + extraWordCount - 1) / (words.length - 1) * extraWordPosition) + 1;
				const word = numbers.words[i % numbers.words.length];
				words.splice(expandedPosition, 0, word);
				extraWordPosition += (words.length - 1) / extraWordCount;
			}
		}

		if(options.wordexpander) {
			const expandedWords = [];
			words.forEach((word) => {
				if(!isToken(word)) {
					const extraChartCount = Math.round(word.length * options.wordexpander);
					let extraChartPosition = 0;
					let expandedWord = word;
					for (let i = 0; i < extraChartCount; i += 1) {
						const position = Math.round(extraChartPosition);
						const expandedPosition = Math.round((word.length + extraChartCount - 1) / (word.length - 1) * extraChartPosition) + 1;
						const char = word[position];
						expandedWord = `${expandedWord.substring(0, expandedPosition)}${char}${expandedWord.substring(expandedPosition)}`;
						extraChartPosition += (word.length - 1) / extraChartCount;
					}
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
					word = [...word].map(char => mapping[char]).join('');
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

		if(options.rightToLeft) {
			const RLO = '\u202e';
			const PDF = '\u202c';
			const RLM = '\u200F';
			text = RLM + RLO + text + PDF + RLM;
		}
	}
	return text;
};

exports.pseudoLocalizeContent = function pseudoLocalizeContent(options, text) {
	let locale = JSON.parse( text );
	const localename = options.format === 'angular.flat' ? '' : Object.keys(locale)[ 0 ];
	const result = {};

	if (localename) {
		locale = locale[localename];
	}

	Object.keys(locale).forEach((key) => {
		result[key] = exports.toPseudoText(locale[key], options);
	} );

	return JSON.stringify( localename ? { pseudo: result } : result, null, '\t' );
};

exports.pseudoLocalize = function pseudoLocalize(options) {
	return new Transform({
		objectMode: true,
		transform: function(file, enc, callback) {
			if (file.isNull()) {
				return callback(null, file);
			}
			file.contents = new Buffer(exports.pseudoLocalizeContent(options, file.contents));
			return callback(null, file);
		}
	});
};

exports.validateLocalesContent = function validateLocalesContent(locales, baseLocales) {
	let result = undefined;
	if(!baseLocales) {
		baseLocales = locales;
	}
	Object.keys(baseLocales).forEach((localeName) => {
		Object.keys(baseLocales[localeName]).forEach((label) => {
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

exports.validateLocales = function validateLocales(path, options, callback) {
	if(options.multiFile) {
		fs.readdir(path, (err, files) => {
			if(err) {
				throw err;
			}
			const noLocaleKey = options.fileStructure === 'angular.flat';
			const locales = {};
			let fileCount = files.length;
			files.forEach(file => {
				fs.readFile(`${path}\\${file}`, (err, buffer) => {
					if(err) {
						throw err;
					}
					fileCount -= 1;
					const locale = JSON.parse(buffer);
					const localeName = noLocaleKey? file.substring(0, file.lastIndexOf('.')) : Object.keys(locale)[0];
					locales[localeName] = noLocaleKey? locale : locale[localeName];
					if(!fileCount) {
						const result = exports.validateLocalesContent(locales);
						callback(result);
					}
				});
			});
		});
	} else {
		fs.readFile(path, (err, buffer) => {
			if(err) {
				throw err;
			}
			const result = exports.validateLocalesContent(JSON.parse(buffer));
			callback(result);
		});
	}
};
