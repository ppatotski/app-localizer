const localizer = require('../');
const assert = require('assert');
const File = require('vinyl');

describe('app-localizer', function() {
	describe('toPseudoText', function() {

		it('mapping', function(done) {
			const input = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz|~\"";
			const output = " ¡″#€‰⅋´❨❩⁎⁺،‐·⁄⓪①②③④⑤⑥⑦⑧⑨∶⁏≤≂≥¿՞ÅƁÇÐÉƑĜĤÎĴĶĻṀÑÖÞǪŔŠŢÛṼŴẊÝŽ⁅∖⁆˄‿‵åƀçðéƒĝĥîĵķļɱñöþǫŕšţûṽŵẋýž¦˞″";
			assert.equal( localizer.toPseudoText(input, { accents: true }), output);
			done();
		});

		it('without options', function(done) {
			assert.equal(localizer.toPseudoText('some text'), 'some text');
			done();
		});

		it('with expander', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.2 }), 'some text');
			done();
		});

		it('with expander (long)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 0.6 }), 'some some text');
			done();
		});

		it('with expander (longest)', function(done) {
			assert.equal(localizer.toPseudoText('some text', { expander: 3 }), 'some some some some text text text text');
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

		it('with rightToLeft token', function(done) {
			assert.equal(localizer.toPseudoText('some {token} text', { rightToLeft: true }), '\u200F\u202e' + 'some {token} text' + '\u202c\u200F');
			done();
		});

		it('with missing close token', function(done) {
			assert.equal(localizer.toPseudoText('some text {token and {{token}}', { expander: 0.5, accents: true, wordexpander: 0.2 }), 'ššöɱé ššöɱé ţţéẋţ ţţéẋţ {{ţöķéñ ååñð ååñð {{{ţöķķéñ}}');
			done();
		});

		it('with missing open token', function(done) {
			assert.equal(localizer.toPseudoText('some text token} and {{token}} end', { expander: 0.5, accents: true, wordexpander: 0.2 }), 'ššöɱé ššöɱé ţţéẋţ ţţöķéñ} ţţöķéñ} ååñð ååñð {{{ţöķķéñ}} ééñð');
			done();
		});

		it('with missing token exception', function(done) {
			try {
				localizer.toPseudoText('some text token} and {{token}} end', { expander: 0.5, accents: true, wordexpander: 0.2, forceException: true });
			} catch(err) {
				assert.equal(err.name, 'SyntaxError');
				done();
			}
		});

		it('all with tokens Formatted Argument', function(done) {
			const input = 'On {takenDate, date, YYYY} {name} took {pctBlack, number, percent} for {takenDate, time, full}';
			const output = 'Öñ Öñ {takenDate, date, YYYY} {name} ţţööķ ţţööķ {pctBlack, number, percent} ƒƒöŕ ƒƒöŕ {takenDate, time, full}';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			done();
		});

		it('all with tokens {plural} Format', function(done) {
			const input = 'You have {itemCount, plural, =0 {no items} one {1 item} other {{itemCount} items}}.';
			const output = 'ÝÝöû ÝÝöû ĥĥåṽé {itemCount, plural, =0 {ñö ñö îîţéɱš} one {① ① îîţéɱ} other {{itemCount} îîţéɱš îîţéɱš}}· ·';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			done();
		});

		it('all with tokens {select} Format', function(done) {
			const input = '{gender, select, male {He {taxRate, number, percent}} female {She} other {They}} will respond shortly.';
			const output = '{gender, select, male {Ĥé Ĥé {taxRate, number, percent}} female {ŠŠĥé ŠŠĥé} other {ŢŢĥéý ŢŢĥéý}} ŵŵîļļ ŵŵîļļ ŕŕéšþöñð ŕŕéšþöñð ššĥöŕţţļý·';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
			done();
		});

		it('all with tokens {selectordinal} Format', function(done) {
			const input = 'It\'s my cat\'s {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!';
			const output = 'ÎÎţ´š ÎÎţ´š ɱý ɱý ççåţ´š {year, selectordinal, one {##šţ ##šţ} two {##ñð ##ñð} few {##ŕð ##ŕð} other {##ţĥ ##ţĥ}} ƀƀîŕţĥĥðåý¡ ƀƀîŕţĥĥðåý¡';
			assert.equal(localizer.toPseudoText(input, { expander: 0.5, accents: true, wordexpander: 0.2 }), output);
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

	// describe('validateLocales', function() {
	// 	it('validate path', function(done) {
	// 		const result = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
	// 		assert.deepEqual(localizer.validateLocalesContent(JSON.parse('{ "en-us": { "label1": "some {token1} text {{token2}}" }, "de-de": { "label2": "some {token1} text {{token2}}" } }')), result);
	// 		done();
	// 	});

	// 	it('validate path (single file)', function(done) {
	// 		const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
	// 		localizer.validateLocales('locales/test1/en-us.json', { multiFile: false }, undefined, (result) => {
	// 			assert.deepEqual(result, expectedResult);
	// 			done();
	// 		});
	// 	});

	// 	it('validate path (polymer multi-file)', function(done) {
	// 		const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
	// 		localizer.validateLocales('locales/test2/', { multiFile: true }, undefined, (result) => {
	// 			assert.deepEqual(result, expectedResult);
	// 			done();
	// 		});
	// 	});

	// 	it('validate path with base (polymer multi-file)', function(done) {
	// 		const expectedResult = { "en-us": { "label1": [ "de-de" ] } };
	// 		localizer.validateLocales('locales/test2/', { multiFile: true }, { "en-us": { "label1": "some text" } }, (result) => {
	// 			assert.deepEqual(result, expectedResult);
	// 			done();
	// 		});
	// 	});

	// 	it('validate path (angular.flat multi-file)', function(done) {
	// 		const expectedResult = { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } };
	// 		localizer.validateLocales('locales/test3/', { multiFile: true, fileStructure: 'angular.flat' }, undefined, (result) => {
	// 			assert.deepEqual(result, expectedResult);
	// 			done();
	// 		});
	// 	});

	// 	it('validate path multi path (angular.flat multi-file)', function(done) {
	// 		const expectedResult = { "locales/test3/": { "en-us": { "label1": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } }, "locales/test4/": { "en-us": { "label3": [ "de-de" ] }, "de-de": { "label2": [ "en-us" ] } } };
	// 		localizer.validateMultipleLocales([ 'locales/test3/', 'locales/test4/' ], { multiFile: true, fileStructure: 'angular.flat' }, undefined, (result) => {
	// 			assert.deepEqual(result, expectedResult);
	// 			done();
	// 		});
	// 	});
	// });
});