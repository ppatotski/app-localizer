# Application Localizer

Application Localizer.

## Features

* Locale validator
	- Check for missing labels
	- Multi-file locale support (see [example](#multi-file-locale-example) below)
		* Polymer file structure
		* Angular flat file structure
* Pseudo localizer (char mapping/words is taken from [pseudolocalization-tool](https://code.google.com/archive/p/pseudolocalization-tool/))
    - Accents on letters
    - Longer sentence
    - Right-to-Left
    - Enclose in exclamations
    - Enclose in brackets
* Create default settings

## Usage example
```javascript
{
	localizer.toPseudoText(text, {
		expander: 0.3,
		exclamations: true,
		brackets: true,
		accents: true,
		rightToLeft: false
	});
}
```

## License

[MIT](LICENSE.md)
