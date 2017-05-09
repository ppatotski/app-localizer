(function() {
	'use strict';

	const appLocalizer = (function() {
		'use strict';
		const mapping = {
			" ": "\u2003",
			"!": "\u00a1",
			"\"": "\u2033",
			"$": "\u20ac",
			"%": "\u2030",
			"&": "\u214b",
			"'": "\u00b4",
			"(": "\u2768",
			")": "\u2769",
			"*": "\u204e",
			"+": "\u207a",
			",": "\u060c",
			"-": "\u2010",
			".": "\u00b7",
			"/": "\u2044",
			"0": "\u24ea",
			"1": "\u2460",
			"2": "\u2461",
			"3": "\u2462",
			"4": "\u2463",
			"5": "\u2464",
			"6": "\u2465",
			"7": "\u2466",
			"8": "\u2467",
			"9": "\u2468",
			":": "\u2236",
			";": "\u204f",
			"<": "\u2264",
			"=": "\u2242",
			">": "\u2265",
			"?": "\u00bf",
			"@": "\u055e",
			"A": "\u00c5",
			"B": "\u0181",
			"C": "\u00c7",
			"D": "\u00d0",
			"E": "\u00c9",
			"F": "\u0191",
			"G": "\u011c",
			"H": "\u0124",
			"I": "\u00ce",
			"J": "\u0134",
			"K": "\u0136",
			"L": "\u013b",
			"M": "\u1e40",
			"N": "\u00d1",
			"O": "\u00d6",
			"P": "\u00de",
			"Q": "\u01ea",
			"R": "\u0154",
			"S": "\u0160",
			"T": "\u0162",
			"U": "\u00db",
			"V": "\u1e7c",
			"W": "\u0174",
			"X": "\u1e8a",
			"Y": "\u00dd",
			"Z": "\u017d",
			"[": "\u2045",
			"\\": "\u2216",
			"]": "\u2046",
			"^": "\u02c4",
			"_": "\u203f",
			"`": "\u2035",
			"a": "\u00e5",
			"b": "\u0180",
			"c": "\u00e7",
			"d": "\u00f0",
			"e": "\u00e9",
			"f": "\u0192",
			"g": "\u011d",
			"h": "\u0125",
			"i": "\u00ee",
			"j": "\u0135",
			"k": "\u0137",
			"l": "\u013c",
			"m": "\u0271",
			"n": "\u00f1",
			"o": "\u00f6",
			"p": "\u00fe",
			"q": "\u01eb",
			"r": "\u0155",
			"s": "\u0161",
			"t": "\u0163",
			"u": "\u00fb",
			"v": "\u1e7d",
			"w": "\u0175",
			"x": "\u1e8b",
			"y": "\u00fd",
			"z": "\u017e",
			"|": "\u00a6",
			"~": "\u02de"
		}
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
		function toPseudoText(text, options, messageParser) {
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
		return {
			toPseudoText: toPseudoText
		};
	})();

	this['AppLocalizer'] = appLocalizer;
}).call(this);