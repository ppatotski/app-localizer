# Application Localizer

Application Localizer package that helps with localizing applications

[Pseudo Locale Generator Web Site](https://ppatotski.github.io/app-localizer/)

[![NPM version](https://img.shields.io/npm/v/app-localizer.svg)](https://www.npmjs.com/package/app-localizer)
[![Build Status](https://travis-ci.org/ppatotski/app-localizer.svg?branch=master)](https://travis-ci.org/ppatotski/app-localizer)
[![Coverage Status](https://coveralls.io/repos/github/ppatotski/app-localizer/badge.svg?branch=master)](https://coveralls.io/github/ppatotski/app-localizer?branch=master)

> uses [Intl MessageFormat Parser](https://github.com/yahoo/intl-messageformat-parser) that parses ICU Message strings into an AST.
>
> tested with [Intl MessageFormat](https://github.com/yahoo/intl-messageformat) that formats ICU Message strings with number, date, plural, and select placeholders to create localized messages.
>
> used by [vscode-app-localizer](https://github.com/ppatotski/vscode-app-localizer) vscode extension
>
> [![VSCode Extension Release](http://vsmarketplacebadge.apphb.com/version/gsppvo.vscode-app-localizer.svg)](https://marketplace.visualstudio.com/items?itemName=gsppvo.vscode-app-localizer)

## Features

* Locale validator - Check for missing labels - Multi-file locale support (see [example](#multi-file-locale-example) below)
  _ Polymer file structure
  _ Angular flat file structure
* Pseudo locale generator (char mapping is taken from [pseudolocalization-tool](https://code.google.com/archive/p/pseudolocalization-tool/))
  * Accents on letters
  * Longer sentence
  * Longer word
  * Right-to-Left
  * Enclose in exclamations
  * Enclose in brackets - Support [ICU Message syntax](https://formatjs.io/guides/message-syntax/)
* Cross-platform

## Install

```shell
npm install app-localizer
```

## API Reference

Pseudo locale generator options

* **expander** Sentence expand factor 0.3 = 30%
* **wordexpander** Word expand factor 0.5 = 50%
* **brackets** Enclose sentence in brackets
* **exclamations** Enclose sentence in exclamations
* **accents** Convert letter to its accent version
* **rightToLeft** RTL writing systems
* **forceException** Force throwing syntax exception if any

Locale validator options

* **filePathPattern** Locale files path (supports node glob pattern)
* **multiFile** Each locale is in separate file in the same folder
* **fileStructure** Structure of locale file content (`polymer` or `angular.flat` file structure)

## Usage

### Locale validator

Validate locale file(s) (e.g. `gulp`)

```javascript
const gulp = require("gulp");
const localizer = require("app-localizer");

gulp.task("validateLocales", function validateLocales(callback) {
  localizer.validateLocales(
    "locales/app1/",
    { multiFile: true, fileStructure: "polymer" },
    undefined,
    result => {
      // result contains missing labels if any
      callback(result);
    }
  );
});

gulp.task("validateMultipleLocales", function validateMultipleLocales(
  callback
) {
  localizer.validateMultipleLocales(
    ["locales/app1/", "locales/app2/"],
    { multiFile: true, fileStructure: "polymer" },
    undefined,
    result => {
      // result contains missing labels if any
      callback(result);
    }
  );
});
```

### Pseudo locale generator

Generate pseudo locale json file from source (`gulp`)

```javascript
const gulp = require("gulp");
const localizer = require("app-localizer");
const rename = require("gulp-rename");

gulp.task("locales", function generatePseudoLocale() {
  gulp
    .src("app/locales/en-us.json")
    .pipe(rename("pseudo.json"))
    .pipe(
      localizer.pseudoLocalize({
        expander: 0.2,
        accents: true,
        rightToLeft: false,
        exclamations: true,
        brackets: true,
        wordexpander: 0.5,
        forceException: false,
        pseudoLocaleName: "en-us"
      })
    )
    .pipe(gulp.dest("dist/locales/"));
});
```

Generate pseudo locale json file from source (`grunt`)

```javascript
const localizer = require("app-localizer");

module.exports = function gruntEntry(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    pseudo: {
      options: {
        expander: 0.2,
        exclamations: true,
        brackets: true,
        accents: true,
        rightToLeft: false,
        wordexpander: 0.5,
        forceException: false,
        pseudoLocaleName: "en-us"
      },
      dist: {
        files: {
          "app/locales/pseudo.json": ["app/locales/en-us.json"]
        }
      }
    }
  });

  grunt.registerMultiTask("pseudo", "Pseudolocalize locale", function() {
    const options = this.options();
    this.files.forEach(file => {
      if (file.dest) {
        file.src.forEach(source => {
          const text = grunt.file.read(source);
          const result = localizer.pseudoLocalizeContent(options, text);

          grunt.file.write(file.dest, result);
        });
      }
    });
  });
};
```

Generate pseudo pseudo text (`browser`)

```shell
npm install intl-messageformat-parser
npm install app-localizer
```

```html
	<script type="text/javascript" src="/node_modules/intl-messageformat-parser/dist/parser.js" defer></script>
	<script type="text/javascript" src="/node_modules/app-localizer/localizer.js" defer></script>
	<script type="text/javascript">
		function transform() {
			'use strict';
			const text = AppLocalizer.toPseudoText('some text', { expander: 0.5, accents: true, wordexpander: 0.2 }, IntlMessageFormatParser);
			console.log(text);
		}
	</script>
```

Generate pseudo locale text ([try it](https://runkit.com/58fc19cf15bef7001293bfb4/58fc19cf15bef7001293bfb5))

> transforms
>
> `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz|~`
>
> into
>
> `¡″♯€‰⅋´{}⁎⁺،‐·⁄⓪①②③④⑤⑥⑦⑧⑨∶⁏≤≂≥¿՞ÅƁÇÐÉƑĜĤÎĴĶĻṀÑÖÞǪŔŠŢÛṼŴẊÝŽ⁅∖⁆˄‿‵åƀçðéƒĝĥîĵķļɱñöþǫŕšţûṽŵẋýž¦˞`

```javascript
const localizer = require("app-localizer");

const pseudoText = localizer.toPseudoText(text, {
  expander: 0.2,
  exclamations: true,
  brackets: true,
  accents: true,
  rightToLeft: false,
  wordexpander: 0.5,
  forceException: false
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

## Change Log

[Change Log](CHANGELOG.md)

## License

[MIT](LICENSE.md)
