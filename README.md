# Application Localizer

Application Localizer that helps with localizing applications.

[![NPM version](https://img.shields.io/npm/v/app-localizer.svg)](https://www.npmjs.com/package/app-localizer)

>used by vscode-app-localizer vscode extension
>
>[![VSCode Extension Release](http://vsmarketplacebadge.apphb.com/version/gsppvo.vscode-app-localizer.svg)](https://marketplace.visualstudio.com/items?itemName=gsppvo.vscode-app-localizer)

## Features

* Pseudo locale generator (char mapping/words is taken from [pseudolocalization-tool](https://code.google.com/archive/p/pseudolocalization-tool/))
    - Accents on letters
    - Longer sentence
    - Longer word
    - Right-to-Left
    - Enclose in exclamations
    - Enclose in brackets

## Install

```shell
npm install --save-dev app-localizer
```

## Usage

Generate pseudo locale json file from source (`gulp`)

```javascript
const localizer = require('app-localizer');
const rename = require('gulp-rename');

gulp.task('locales', function generatePseudoLocale() {
	gulp.src('app/locales/en-us.json')
		.pipe(rename('pseudo.json'))
		.pipe(localizer.pseudoLocalize({
			expander: 0.2,
			accents: true,
			rightToLeft: false,
			exclamations: true,
			brackets: true,
			wordexpander: 0.5 }))
		.pipe(gulp.dest('dist/locales/'));
});
```

Generate pseudo locale text ([try it](https://runkit.com/58fc19cf15bef7001293bfb4/58fc19cf15bef7001293bfb5))

```javascript
const localizer = require('app-localizer');

const pseudoText = localizer.toPseudoText(text, {
	expander: 0.2,
	exclamations: true,
	brackets: true,
	accents: true,
	rightToLeft: false,
	wordexpander: 0.5
});
```

## License

[MIT](LICENSE.md)
