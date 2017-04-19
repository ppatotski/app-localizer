const mapping = require( './mapping.json' );
const numbers = require( './numbers.json' );

exports.toPseudoText = function toPseudoText(text, options) {
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
	if(options.accents) {
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
			if(preIgnoreMode || ignoreMode) {
				pseudo += letter;
			} else {
				pseudo += mapping[letter];
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
	if(options.rightToLeft) {
		const RLO = '\u202e';
		const PDF = '\u202c';
		const RLM = '\u200F';
		text = RLM + RLO + text + PDF + RLM;
	}
	if(options.exclamations) {
		text = `!!! ${text} !!!`;
	}
	if(options.brackets) {
		text = options.exclamations ? `[${text}]` : `[ ${text} ]`;
	}
	return text;
}