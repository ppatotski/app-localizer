const localizer = require('../');
const assert = require('assert');
const File = require('vinyl');
const IntlMessageFormat = require( 'intl-messageformat' );

describe('localizer', function() {
	describe('toPseudoText method with', function() {

		it('mapping', function(done) {
			const input = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz|~";
			const output = " ¡″#€‰⅋´❨❩⁎⁺،‐·⁄⓪①②③④⑤⑥⑦⑧⑨∶⁏≤≂≥¿՞ÅƁÇÐÉƑĜĤÎĴĶĻṀÑÖÞǪŔŠŢÛṼŴẊÝŽ⁅∖⁆˄‿‵åƀçðéƒĝĥîĵķļɱñöþǫŕšţûṽŵẋýž¦˞";
			assert.equal( localizer.toPseudoText(input, { accents: true }), output);
			done();
		});

		it('no options', function(done) {
			assert.equal(localizer.toPseudoText('some text'), 'some text');
			done();
		});

		it('expander', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.2 }), 'some text');
			done();
		});

		it('expander (long)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.6 }), 'some some text');
			done();
		});

		it('expander (longest)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 3 }), 'some some some some text text text text');
			done();
		});

		it('wordexpander', function(done) {
			assert.equal(localizer.toPseudoText('me', { wordexpander: 0.2 }), 'me');
			done();
		});

		it('wordexpander (long)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { wordexpander: 0.7 }), 'ssoomme tteexxt');
			done();
		});

		it('wordexpander (longest)', function(done) {
			assert.equal(localizer.toPseudoText('some text sometext', { wordexpander: 3 }), 'sssooooommmmmeee ttteeeeexxxxxttt sssooooommmmeeeeetttteeeexxxxxtt');
			done();
		});

		it('accents', function(done) {
			assert.equal(localizer.toPseudoText('some text', { accents: true }), 'šöɱé ţéẋţ');
			done();
		});

		it('exclamations', function(done) {
			assert.equal(localizer.toPseudoText('some text', { exclamations: true }), '!!! some text !!!');
			done();
		});

		it('brackets', function(done) {
			assert.equal(localizer.toPseudoText('some text', { brackets: true }), '[ some text ]');
			done();
		});

		it('rightToLeft token', function(done) {
			assert.equal(localizer.toPseudoText('some {token} text', { rightToLeft: true }), '\u200F\u202e' + 'some {token} text' + '\u202c\u200F');
			done();
		});

		it('missing close token', function(done) {
			assert.equal(localizer.toPseudoText('some text {token and {{token}}', { expander: 0.5, accents: true, wordexpander: 0.2 }), 'ššöɱé ššöɱé ţţéẋţ ţţéẋţ {{ţöķéñ ååñð ååñð {{{ţöķķéñ}}');
			done();
		});

		it('missing open token', function(done) {
			assert.equal(localizer.toPseudoText('some text token} and {{token}} end', { expander: 0.5, accents: true, wordexpander: 0.2 }), 'ššöɱé ššöɱé ţţéẋţ ţţöķéñ} ţţöķéñ} ååñð ååñð {{{ţöķķéñ}} ééñð');
			done();
		});

		it('missing token exception', function(done) {
			try {
				localizer.toPseudoText('some text token} and {{token}} end', { expander: 0.5, accents: true, wordexpander: 0.2, forceException: true });
			} catch(err) {
				assert.equal(err.name, 'SyntaxError');
				done();
			}
		});

		it('tokens Formatted Argument', function(done) {
			const input = 'On {takenDate, date, YYYY} {name} took {pctBlack, number, percent} for {takenDate, time, full} and {pctBlack, number}';
			const output = 'Öñ Öñ {takenDate, date, YYYY} {name} ţţööķ ţţööķ {pctBlack, number, percent} ƒƒöŕ ƒƒöŕ {takenDate, time, full} ååñð ååñð {pctBlack, number}';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			var msg = new IntlMessageFormat(output);
			assert.equal(msg.format({ takenDate: new Date('5/6/2017'), name: 'petr', pctBlack: 0.33 }).replace('GMT', 'EDT'), 'Öñ Öñ 5/6/2017 petr ţţööķ ţţööķ 33% ƒƒöŕ ƒƒöŕ 12:00:00 AM EDT ååñð ååñð 0.33');
			done();
		});

		it('tokens {plural} Format', function(done) {
			const input = 'You have {itemCount, plural, =0 {no items} one {1 item} other {{itemCount} items}}.';
			const output = 'ÝÝöû ÝÝöû ĥĥåṽé {itemCount, plural, =0 {ñö ñö îîţéɱš} one {① ① îîţéɱ} other {{itemCount} îîţéɱš îîţéɱš}}· ·';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			var msg = new IntlMessageFormat(output);
			assert.equal(msg.format({ itemCount: 0 }), 'ÝÝöû ÝÝöû ĥĥåṽé ñö ñö îîţéɱš· ·');
			done();
		});

		it('tokens {select} Format', function(done) {
			const input = '{gender, select, male {He {taxRate, number, percent}} female {She} other {They}} will respond shortly.';
			const output = '{gender, select, male {Ĥé Ĥé {taxRate, number, percent}} female {ŠŠĥé ŠŠĥé} other {ŢŢĥéý ŢŢĥéý}} ŵŵîļļ ŵŵîļļ ŕŕéšþöñð ŕŕéšþöñð ššĥöŕţţļý·';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			var msg = new IntlMessageFormat(output);
			assert.equal(msg.format({ gender: 'female' }), 'ŠŠĥé ŠŠĥé ŵŵîļļ ŵŵîļļ ŕŕéšþöñð ŕŕéšþöñð ššĥöŕţţļý·');
			done();
		});

		it('tokens {selectordinal} Format', function(done) {
			const input = 'It\'s my cat\'s {year, selectordinal, offset:1 one {#st} two {#nd} few {#rd} other {#th}} birthday!';
			const output = 'ÎÎţ´š ÎÎţ´š ɱý ɱý ççåţ´š {year, selectordinal, offset:1 one {#šţ šţ} two {#ñð ñð} few {#ŕð ŕð} other {#ţĥ ţĥ}} ƀƀîŕţĥĥðåý¡ ƀƀîŕţĥĥðåý¡';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			var msg = new IntlMessageFormat(output);
			assert.equal(msg.format({ year: 2 }), 'ÎÎţ´š ÎÎţ´š ɱý ɱý ççåţ´š 1šţ šţ ƀƀîŕţĥĥðåý¡ ƀƀîŕţĥĥðåý¡');
			done();
		});
	});

	describe('pseudoLocalize method with', function() {
		it('pseudo localize polymer', function(done) {
			const result = '{\n	"fr-be": {\n		"label1": "sssooommmmee {token1} ttteeexxxxtt {token2}"\n	}\n}';
			assert.equal(localizer.pseudoLocalizeContent({ wordexpander: 2, pseudoLocaleName: 'fr-be' }, '{ "en-us": { "label1": "some {token1} text {token2}" } }'), result);
			done();
		});

		it('pseudo localize angular.flat', function(done) {
			const result = '{\n	"label1": "sssooommmmee {token1} ttteeexxxxtt {token2}"\n}';
			assert.equal(localizer.pseudoLocalizeContent({ wordexpander: 2, format: 'angular.flat' }, '{ "label1": "some {token1} text {token2}" }'), result);
			done();
		});

		it('pseudo localize gulp', function(done) {
			const result = '{\n	"pseudo": {\n		"label1": "sssooommmmee {token1} ttteeexxxxtt {token2}"\n	}\n}';
			const localeFile = new File({
				contents: new Buffer('{ "en-us": { "label1": "some {token1} text {token2}" } }')
			});
			const localizerPlugin = localizer.pseudoLocalize({ wordexpander: 2 });
			localizerPlugin.write(localeFile);
			localizerPlugin.once('data', function(file) {
				assert(file.isBuffer());
				assert.equal(file.contents, result);
				done();
			});
		});

		it('empty pseudo localize gulp', function(done) {
			const localeFile = new File();
			const localizerPlugin = localizer.pseudoLocalize({ wordexpander: 2 });
			localizerPlugin.write(localeFile);
			localizerPlugin.once('data', function(file) {
				assert.ifError(file.isBuffer());
				done();
			});
		});
	});

	describe('validateLocales method with', function() {
		it('validate path', function(done) {
			const result = { "en-us": { "label1": [ "de-de", "be-by" ], "label3": [ "de-de", "be-by" ] }, "be-by": { "label2": [ "en-us" ] }, "de-de": { "label2": [ "en-us" ] } };
			const input = '{ "en-us": { "label1": "some {token1} text {{token2}}", "label3": "some {token1} text {{token2}}" }, "de-de": { "label2": "some {token1} text {{token2}}" }, "be-by": { "label2": "some {token1} text {{token2}}" } }';
			assert.deepEqual(localizer.validateLocalesContent(JSON.parse(input)), result);
			done();
		});

		it('single file', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test1/en-us.json', { multiFile: false }, undefined, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('missing file', function(done) {
			assert.doesNotThrow( () => {
				localizer.validateLocales('locales/test1/en-us_missing.json', { multiFile: false }, undefined, () => {
				});
				localizer.validateLocales('locales/test_missing/', { multiFile: true }, undefined, () => {
				});
			});
			done();
		});

		it('polymer multi-file', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test2/', { multiFile: true }, undefined, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('base (polymer multi-file)', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] } };
			localizer.validateLocales('locales/test2/', { multiFile: true }, { "en-us": { "label1": "some text" } }, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('angular.flat multi-file', function(done) {
			const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
			localizer.validateLocales('locales/test3/', { multiFile: true, fileStructure: 'angular.flat' }, undefined, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('multi path (angular.flat multi-file)', function(done) {
			const expectedResult = { "locales/test3/": { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } }, "locales/test4/": { "en-us": { "label3": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } } };
			localizer.validateMultipleLocales([ 'locales/test3/', 'locales/test4/' ], { multiFile: true, fileStructure: 'angular.flat' }, undefined, (result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('promise multi path (angular.flat multi-file)', function(done) {
			const expectedResult = { "locales/test3/": { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } }, "locales/test4/": { "en-us": { "label3": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } } };
			const promise = localizer.validateMultipleLocales([ 'locales/test3/', 'locales/test4/' ], { multiFile: true, fileStructure: 'angular.flat' });
			promise.catch((result) => {
				assert.deepEqual(result, expectedResult);
				done();
			});
		});

		it('promise multi path valid (angular.flat multi-file)', function(done) {
			const promise = localizer.validateMultipleLocales([ 'locales/test5/', 'locales/test5/' ], { multiFile: true, fileStructure: 'angular.flat' });
			promise.then(() => {
				done();
			});
		});
	});
});