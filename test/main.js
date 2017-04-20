const localizer = require('../');
const expect = require( 'chai' ).expect;

describe('app-localizer', function() {
	describe('toPseudoText', function() {
		it('without options', function(done) {
			expect( localizer.toPseudoText('some text')).to.be.equal('some text');
			done();
		});

		it('with expander', function(done) {
			expect( localizer.toPseudoText('some text', { expander: 0.6 })).to.be.equal('some text one two');
			done();
		});

		it('with accents', function(done) {
			expect( localizer.toPseudoText('some text', { accents: true })).to.be.equal('šöɱé ţéẋţ');
			done();
		});

		it('with rightToLeft', function(done) {
			expect( localizer.toPseudoText('some text', { rightToLeft: true })).to.be.equal('\u200F\u202e' + 'some text' + '\u202c\u200F');
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

		it('with wordexpander', function(done) {
			expect( localizer.toPseudoText('some text', { wordexpander: 2 })).to.be.equal('sssooommmeee ttteeexxxttt');
			done();
		});

		it('all with tokens', function(done) {
			expect( localizer.toPseudoText('some text {0} and {{p}}', { expander: 0.6, accents: true, rightToLeft: true, exclamations: true, brackets: true, wordexpander: 2 })).to.be.equal('\u200F\u202e' + '[!!! šššöööɱɱɱééé ţţţéééẋẋẋţţţ {0} åååñññððð {{p}} öööñññééé ţţţŵŵŵööö ţţţĥĥĥŕŕŕéééééé !!!]' + '\u202c\u200F');
			done();
		});
	});

	describe('pseudoLocalize', function() {
		it('pseudo localize polymer', function(done) {
			const result = `{
	"pseudo": {
		"label1": "sssooommmeee {token1} ttteeexxxttt {{token2}}"
	}
}`;
			expect( localizer.pseudoLocalizeContent({ wordexpander: 2 }, '{ "us-en": { "label1": "some {token1} text {{token2}}" } }')).to.be.equal(result);
			done();
		});

		it('pseudo localize angular.flat', function(done) {
			const result = `{
	"label1": "sssooommmeee {token1} ttteeexxxttt {{token2}}"
}`;
			expect( localizer.pseudoLocalizeContent({ wordexpander: 2, format: 'angular.flat' }, '{ "label1": "some {token1} text {{token2}}" }')).to.be.equal(result);
			done();
		});
	});
});