const chai = require('chai').should();
const users = require('../seed-data');

module.exports = (client, seed) => context('(accesstokens)', () => {

  describe('seeding database', function() {
    this.timeout(5000);
    it('works', (done) => {
      seed().catch((err) => done(err)).then(() => done());
    });
  });

  describe('creating an access token', function() {
    context('when account is a validated admin', () => {
      it('should send token', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.admin.email, password: users.admin.password })
          .then((data) => {
            data.should.have.property('token');
            data.token.should.be.an('string');

            data.should.have.property('user');
            data.user.should.be.an('object')
            data.user.should.have.property('id');
            done();
          })
          .catch(err => done(err));
      });
    });

    context('when account is a validated user', () => {
      it('should send token', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.validated.email, password: users.validated.password })
          .then((data) => {
            data.should.have.property('token');
            data.token.should.be.an('string');

            data.should.have.property('user');
            data.user.should.be.an('object')
            data.user.should.have.property('id');
            done();
          })
          .catch(err => done(err));
      });
    });

    context('when account is not validated', () => {
      it('should send 403 error', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.notvalidated.email, password: users.notvalidated.password })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getSource().should.be.equal('createAccessToken');

            response.getError().should.have.property('code', 403);
            done()
          })
          .catch(err => done(err));
      });
    });

    context('when no email nor password is provided', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.createAccessToken({ email: '', password: '' })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getSource().should.be.equal('createAccessToken');

            response.getError().should.have.property('code', 481);

            response.hasErrorDetails().should.be.equal(true);
            response.getErrorDetails().should.be.an('object');
            response.getErrorDetails().should.have.property('email');
            response.getErrorDetails().should.have.property('password');

            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetail('email').should.have.property('kind', 'required');

            response.hasErrorDetail('password').should.be.equal(true);
            response.getErrorDetail('password').should.have.property('kind', 'required');
            done();
          })
          .catch(err => done(err));;
      });
    });
  });

  describe('getting identity from access token', function() {

    context('when token is not valid', () => {
      it('should send false', (done) => {
        client.resetToken();
        client.getCurrentUser()
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 401);
            done();
          })
          .catch(err => done(err));;
      });
    });

    context('when token is valid', () => {
      it('should send user infos', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.admin.email, password: users.admin.password })
          .then((data) => {
            client.setToken(data.token);
            return client.getCurrentUser();
          })
          .then((user) => {
            user.should.have.property('id', users.admin.id);
            done();
          })
          .catch(err => done(err));;
      });
    });
  });
});
