# Application Localizer

Application Localizer that helps with localizing applications.

[![NPM version](https://img.shields.io/npm/v/app-localizer.svg)](https://www.npmjs.com/package/app-localizer)

>used by vscode-app-localizer vscode extension
>
>[![VSCode Extension Release](http://vsmarketplacebadge.apphb.com/version/gsppvo.vscode-app-localizer.svg)](https://marketplace.visualstudio.com/items?itemName=gsppvo.vscode-app-localizer)

## Features

* Locale validator
	- Check for missing labels
	- Multi-file locale support (see [example](#multi-file-locale-example) below)
		* Polymer file structure
		* Angular flat file structure
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

### Locale validator

Validate locale file(s) (e.g. `gulp`)

```javascript
const gulp = require('gulp');
const localizer = require('app-localizer');

gulp.task('validateLocales', function validateLocales(callback) {
	localizer.validateLocales('locales/test2/', { multiFile: true }, (result) => {
		callback(result);
	});
});
```

### Pseudo locale generator

Generate pseudo locale json file from source (`gulp`)

```javascript
const gulp = require('gulp');
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

## Single-File locale example

### file with locales `/locales/locale.json`
```json
{
	"en-us": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	},
	"de-de": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	}
}
```

## Multi-File locale example
> locale files should be in the same folder

### file with en-us locale `/locales/en-us.json` (polymer file structure)
```json
{
	"en-us": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	}
}
```

### file with fr locale `/locales/fr.locale.json` (angular flat file structure)
```json
{
	"label1": "blah1 {{token}}",
	"label2": "blah2",
	"label5": "blah3",
	"label3": "blah4"
}
```

## License

[MIT](LICENSE.md)
