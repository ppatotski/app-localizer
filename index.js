const through = require( 'through2' );
const mapping = require( './mapping.json' );
const numbers = require( './numbers.json' );

exports.toPseudoText = function toPseudoText(text, options) {
	if(options) {
		if(options.expander) {
			let charCount = Math.round(text.length * options.expander);
			let wordIndex = 0;
			let expansion = charCount;
			while (expansion > 0) {
				const word = numbers.words[wordIndex % numbers.words.length];
				text += ` ${word}`;
				expansion -= word.length + 1;
				wordIndex += 1;
			}
		}
		if(options.accents || options.wordexpander) {
			let ignoreMode = false;
			let preIgnoreMode = false;
			let pseudo = '';

			[...text].forEach(letter => {
				if(letter === '{') {
					if(preIgnoreMode) {
						ignoreMode = true;
						pseudo = `${pseudo.substring(0, pseudo.length - 1)}{`;
					}
					preIgnoreMode = true;
				}
				if(preIgnoreMode || ignoreMode || !options.accents) {
					pseudo += letter;
				} else {
					pseudo += mapping[letter];
				}
				if(!(preIgnoreMode || ignoreMode) && options.wordexpander && letter !== ' ') {
					for (let i = 0; i < options.wordexpander; i += 1) {
						pseudo += pseudo[pseudo.length - 1];
					}
				}
				if(letter === '}') {
					if(!preIgnoreMode) {
						ignoreMode = false;
					}
					preIgnoreMode = false;
				}
			});
			text = pseudo;
		}
		if(options.exclamations) {
			text = `!!! ${text} !!!`;
		}
		if(options.brackets) {
			text = options.exclamations ? `[${text}]` : `[ ${text} ]`;
		}
		if(options.rightToLeft) {
			const RLO = '\u202e';
			const PDF = '\u202c';
			const RLM = '\u200F';
			text = RLM + RLO + text + PDF + RLM;
		}
	}
	return text;
}

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
}

exports.pseudoLocalize = function pseudoLocalize(options) {
	return through.obj( function process( file, enc, cb ) {
		file.contents = new Buffer(exports.pseudoLocalizeContent(options, file.contents));
		setImmediate(cb, null, file);
	} );
};

