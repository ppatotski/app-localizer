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
 });
});