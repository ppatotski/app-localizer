# Application Localizer

Application Localizer to help with localizing applications.

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

Generate pseudo locale file (`gulp`)

```javascript
var localizer = require('app-localizer');

gulp.task('locales', function() {
  gulp.src('app/locales/*.json')
      .pipe(localizer.pseudoLocalize( {
		  expander: 0.6,
		  accents: true,
		  rightToLeft: false,
		  exclamations: true,
		  brackets: true,
		  wordexpander: 1 } ))
      .pipe(gulp.dest('dist/locales/'));
});
```

Generate pseudo locale text

```javascript
{
	const pseudoText = localizer.toPseudoText(text, {
		expander: 0.3,
		exclamations: true,
		brackets: true,
		accents: true,
		rightToLeft: false,
		wordexpander: 1
	});
}
```

## License

[MIT](LICENSE.md)
