const chai = require('chai').should();
const users = require('../seed-data');

module.exports = (client, seed) => context('(accounts)', () => {

  describe('seeding database', function() {
    this.timeout(5000);
    it('works', (done) => {
      seed().catch((err) => done(err)).then(() => done());
    });
  });

  describe('recovering password', function() {
    context('when no email is provided', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.requestNewPassword({ email: '' })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.getSource().should.be.equal('requestNewPassword');
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);
            response.hasErrorDetails().should.be.equal(true);
            response.getErrorDetails().should.be.an('object');
            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetails().should.have.property('email');
            response.getErrorDetail('email').should.have.property('kind', 'required');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email is not valid', () => {
      it('should send a quiet response', (done) => {
        client.resetToken();
        client.requestNewPassword({ email: 'notanemail' })
          .then((response) => {
            response.should.be.an('array').and.to.have.lengthOf(0);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email is valid but does not exist', () => {
      it('should send a quiet response', (done) => {
        client.resetToken();
        client.requestNewPassword({ email: 'avalidemail@domain.tld' })
          .then((response) => {
            response.should.be.an('array').and.to.have.lengthOf(0);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email is valid and exist', () => {
      it('should send a quiet response', (done) => {
        client.resetToken();
        client.resetToken();
        client.requestNewPassword({ email: users.admin.email })
          .then((response) => {
            response.should.be.an('array').and.to.have.lengthOf(0);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('registering an account', function() {
    context('when no email nor password are provided', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.registerAccount()
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.getSource().should.be.equal('registerAccount');
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);

            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.hasErrorDetail('password').should.be.equal(true);

            response.getErrorDetail('email').should.have.property('kind', 'required');
            response.getErrorDetail('password').should.have.property('kind', 'required');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email is not valid and password is too short', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.registerAccount({ email: 'toto', password : 'a'})
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.getSource().should.be.equal('registerAccount');
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);

            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.hasErrorDetail('password').should.be.equal(true);

            response.getErrorDetail('email').should.have.property('kind', 'invalid-email');
            response.getErrorDetail('password').should.have.property('kind', 'length');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email and password are valid but email already use', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.registerAccount({ email: users.admin.email, password : 'supercalifragilistic'})
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.getSource().should.be.equal('registerAccount');
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);

            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetail('email').should.have.property('kind', 'duplicated');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email and password are ok', () => {
      it('should respond true', (done) => {
        client.resetToken();
        client.registerAccount({ email: 'somegood@email.com', password : 'supercalifragilistic'})
          .then((user) => {
            user.should.be.an('object');
            user.should.have.property('id');
            done();
          })
          .catch((err) => done(err));
      });
    });
  })

});
