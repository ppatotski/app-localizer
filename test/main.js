const localizer = require('../');
const assert = require('assert');
const File = require('vinyl');

describe('app-localizer', function() {
	describe('toPseudoText', function() {
		it('without options', function(done) {
			assert.equal( localizer.toPseudoText('some text'), 'some text');
			done();
		});

		it('with expander', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.2 }), 'some text');
			done();
		});

		it('with expander (long)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.6 }), 'some one text');
			done();
		});

		it('with expander (longest)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 3 }), 'some one two text three four five six');
			done();
		});

		it('with wordexpander', function(done) {
			assert.equal(localizer.toPseudoText('me', { wordexpander: 0.2 }), 'me');
			done();
		});

		it('with wordexpander (long)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { wordexpander: 0.7 }), 'ssoomme tteexxt');
			done();
		});

		it('with wordexpander (longest)', function(done) {
			assert.equal(localizer.toPseudoText('some text sometext', { wordexpander: 3 }), 'sssooooommmmmeee ttteeeeexxxxxttt sssooooommmmeeeeetttteeeexxxxxtt');
			done();
		});

		it('with accents', function(done) {
			assert.equal(localizer.toPseudoText('some text', { accents: true }), 'šöɱé ţéẋţ');
			done();
		});

		it('with exclamations', function(done) {
			assert.equal(localizer.toPseudoText('some text', { exclamations: true }), '!!! some text !!!');
			done();
		});

		it('with brackets', function(done) {
			assert.equal(localizer.toPseudoText('some text', { brackets: true }), '[ some text ]');
			done();
		});

		it('with rightToLeft', function(done) {
			assert.equal(localizer.toPseudoText('some {token} text', { rightToLeft: true }), '\u200F\u202e' + 'some {token} text' + '\u202c\u200F');
			done();
		});

		it('with rightToLeft token', function(done) {
			const localized = localizer.toPseudoText('some {token} text', { rightToLeft: true });
			assert.equal(localized.replace('{token}', 'simple') , '\u200F\u202e' + 'some simple text' + '\u202c\u200F');
			done();
		});

		it('all with tokens', function(done) {
			assert.equal(localizer.toPseudoText('some text {0} and {{p}}', { expander: 0.5, accents: true, rightToLeft: true, exclamations: true, brackets: true, wordexpander: 0.2 }), '\u200F\u202e' + '[!!! ššöɱé ööñé ţţéẋţ {0} ţţŵö ååñð {{p}} ţţĥŕéé !!!]' + '\u202c\u200F');
			done();
		});
	});

	describe('pseudoLocalize', function() {
		it('pseudo localize polymer', function(done) {
			const result = '{\n	"pseudo": {\n		"label1": "sssooommmmee {token1} ttteeexxxxtt {{token2}}"\n	}\n}';
			assert.equal(localizer.pseudoLocalizeContent({ wordexpander: 2 }, '{ "en-us": { "label1": "some {token1} text {{token2}}" } }'), result);
			done();
		});

		it('pseudo localize angular.flat', function(done) {
			const result = '{\n	"label1": "sssooommmmee {token1} ttteeexxxxtt {{token2}}"\n}';
			assert.equal(localizer.pseudoLocalizeContent({ wordexpander: 2, format: 'angular.flat' }, '{ "label1": "some {token1} text {{token2}}" }'), result);
			done();
		});

		it('pseudo localize gulp', function(done) {
			const result = '{\n	"pseudo": {\n		"label1": "sssooommmmee {token1} ttteeexxxxtt {{token2}}"\n	}\n}';
			const localeFile = new File({
				contents: new Buffer('{ "en-us": { "label1": "some {token1} text {{token2}}" } }')
			});
			const localizerPlugin = localizer.pseudoLocalize({ wordexpander: 2 });
			localizerPlugin.write(localeFile);
			localizerPlugin.once('data', function(file) {
				assert(file.isBuffer());
				assert.equal(file.contents, result);
				done();
			});
		});
	});

	describe('validateLocales', function() {
		it('validate path', function(done) {
			const result = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			assert.deepEqual(localizer.validateLocalesContent(JSON.parse('{ "en-us": { "label1": "some {token1} text {{token2}}" }, "de-de": { "label2": "some {token1} text {{token2}}" } }')), result);
			done();
		});

		it('validate path gulp (single file)', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test1/en-us.json', { multiFile: false }, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('validate path gulp (polymer multi-file)', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test2/', { multiFile: true }, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('validate path gulp (angular.flat multi-file)', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test3/', { multiFile: true, fileStructure: 'angular.flat' }, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});
	});
});