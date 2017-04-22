const localizer = require('../');
const gulp = require('gulp');
const expect = require( 'chai' ).expect;

describe('app-localizer', function() {
	describe('toPseudoText', function() {
		it('without options', function(done) {
			expect( localizer.toPseudoText('some text')).to.be.equal('some text');
			done();
		});

		it('with expander', function(done) {
			expect( localizer.toPseudoText('some text', { expander: 0.2 })).to.be.equal('some text');
			done();
		});

		it('with expander (long)', function(done) {
			expect( localizer.toPseudoText('some text', { expander: 0.6 })).to.be.equal('some one text');
			done();
		});

		it('with expander (longest)', function(done) {
			expect( localizer.toPseudoText('some text', { expander: 3 })).to.be.equal('some one two text three four five six');
			done();
		});

		it('with wordexpander', function(done) {
			expect( localizer.toPseudoText('me', { wordexpander: 0.2 })).to.be.equal('me');
			done();
		});

		it('with wordexpander (long)', function(done) {
			expect( localizer.toPseudoText('some text', { wordexpander: 0.7 })).to.be.equal('ssoomme tteexxt');
			done();
		});

		it('with wordexpander (longest)', function(done) {
			expect( localizer.toPseudoText('some text sometext', { wordexpander: 3 })).to.be.equal('sssooooommmmmeee ttteeeeexxxxxttt sssooooommmmeeeeetttteeeexxxxxtt');
			done();
		});

		it('with accents', function(done) {
			expect( localizer.toPseudoText('some text', { accents: true })).to.be.equal('šöɱé ţéẋţ');
			done();
		});

		it('with exclamations', function(done) {
			expect( localizer.toPseudoText('some text', { exclamations: true })).to.be.equal('!!! some text !!!');
			done();
		});

		it('with brackets', function(done) {
			expect( localizer.toPseudoText('some text', { brackets: true })).to.be.equal('[ some text ]');
			done();
		});

		it('with rightToLeft', function(done) {
			expect( localizer.toPseudoText('some {token} text', { rightToLeft: true })).to.be.equal('\u200F\u202e' + 'some {token} text' + '\u202c\u200F');
			done();
		});

		it('all with tokens', function(done) {
			expect( localizer.toPseudoText('some text {0} and {{p}}', { expander: 0.5, accents: true, rightToLeft: true, exclamations: true, brackets: true, wordexpander: 0.2 })).to.be.equal('\u200F\u202e' + '[!!! ššöɱé ööñé ţţéẋţ {0} ţţŵö ååñð {{p}} ţţĥŕéé !!!]' + '\u202c\u200F');
			done();
		});
	});

	describe('pseudoLocalize', function() {
		it('pseudo localize polymer', function(done) {
			const result = `{
	"pseudo": {
		"label1": "sssooommmmee {token1} ttteeexxxxtt {{token2}}"
	}
}`;
			expect( localizer.pseudoLocalizeContent({ wordexpander: 2 }, '{ "us-en": { "label1": "some {token1} text {{token2}}" } }')).to.be.equal(result);
			done();
		});

		it('pseudo localize angular.flat', function(done) {
			const result = `{
	"label1": "sssooommmmee {token1} ttteeexxxxtt {{token2}}"
}`;
			expect( localizer.pseudoLocalizeContent({ wordexpander: 2, format: 'angular.flat' }, '{ "label1": "some {token1} text {{token2}}" }')).to.be.equal(result);
			done();
		});
	});
});