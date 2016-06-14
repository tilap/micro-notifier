const chai = require('chai').should();
const users = require('../seed-data');

module.exports = (client, seed) => context('(users)', () => {

  describe('seeding database', function() {
    this.timeout(5000);
    it('works', (done) => {
      seed().catch((err) => done(err)).then(() => done());
    });
  });

  describe('list users', () => {
    context('when current user is not connected', () => {
      it('should send a 403 error', (done) => {
        client.resetToken();
        client.getUsers()
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is connected as a "user"', () => {
      it('should send a 403 error', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.validated.email, password: users.validated.password })
          .then((data) => {
            client.setToken(data.token);
            return client.getUsers();
          })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            client.setToken('');
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is an "admin"', () => {
      it('should send user list with paging infos', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.admin.email, password: users.admin.password })
          .then((data) => {
            client.setToken(data.token);
            return client.getUsers();
          })
          .then((response) => {
            client.setToken('');
            response.should.be.instanceOf(Object);
            response.should.have.property('dataset').and.be.instanceOf(Array);
            response.should.have.property('paging').and.be.instanceOf(Object);
            response.paging.should.have.all.keys(['total', 'limit', 'page', 'pages']);
            done();
          })
          .catch((err) => done(err));
      });

      it('should send user list and enable filter by profile', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.admin.email, password: users.admin.password })
          .then((data) => {
            client.setToken(data.token);
            return client.getUsers({ profile: 'admin' });
          })
          .then((response) => {
            client.setToken('');
            response.should.be.instanceOf(Object);

            response.should.have.property('dataset').and.be.instanceOf(Array);
            response.dataset.forEach((user) => {
              if (!user.profile || user.profile != 'admin') {
                throw new Error('Should only get user with admin profile');
              }
            })

            response.should.have.property('paging').and.be.instanceOf(Object)
            response.paging.should.have.all.keys(['total', 'limit', 'page', 'pages']);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('create a new user', function() {
    context('when no email nor password are provided', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.createUser()
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);

            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetail('email').should.be.an('object').and.have.property('kind', 'required');

            response.hasErrorDetail('password').should.be.equal(true);
            response.getErrorDetail('password').should.be.an('object').and.have.property('kind', 'required');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email is not valid and password is too short', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.createUser({ email: 'toto', password : 'a'})
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);
            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetail('email').should.be.an('object').and.have.property('kind', 'invalid-email');

            response.hasErrorDetail('password').should.be.equal(true);
            response.getErrorDetail('password').should.be.an('object').and.have.property('kind', 'length');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email and password are valid but email already use', () => {
      it('should send 481 error with details', (done) => {
        client.resetToken();
        client.createUser({ email: users.admin.email, password : 'supercalifragilistic'})
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 481);
            response.hasErrorDetails().should.be.equal(true);

            response.hasErrorDetail('email').should.be.equal(true);
            response.getErrorDetail('email').should.be.an('object').and.have.property('kind', 'duplicated');
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when email and password are ok', () => {
      it('should respond true', (done) => {
        client.resetToken();
        client.createUser({ email: 'some-good@email.com', password : 'supercalifragilistic'})
          .then((user) => {
            user.should.be.an('object');
            user.should.have.property('id');
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('update a user', function() {
    context('when current user is not connected', () => {
      it('should send 403 error', (done) => {
        client.resetToken();
        client.updateUserById(1, {})
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is connected as a "user"', () => {
      it('should send 403 error', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.validated.email, password: users.validated.password })
          .then((data) => {
            client.setToken(data.token);
            return client.updateUserById(1, { email: 'john@doe.com' });
          })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is connected as an "admin"', () => {
      context('and edit a document corectly', () => {
        it('should send valid doc update response', (done) => {
          client.resetToken();
          client.createAccessToken({ email: users.admin.email, password: users.admin.password })
            .then((data) => {
              client.setToken(data.token);
              return client.updateUserById(4, { profile: 'admin' });
            })
            .then((response) => {
              response.should.have.property('document');
              response.should.have.property('updated');
              response.should.have.property('error', null);
              response.document.should.have.property('id', 4);
              response.updated.should.have.property('id', 4);
              response.updated.should.have.property('profile', 'admin');
              done();
            })
            .catch((err) => done(err));
        });
      });

      context('and edit a document that does not exists', () => {
        it('should send a 404 error', (done) => {
          client.resetToken();
          client.createAccessToken({ email: users.admin.email, password: users.admin.password })
            .then((data) => {
              client.setToken(data.token);
              return client.updateUserById(12, { profile: 'admin' });
            })
            .then((data) => done(new Error('request should not be resolved')))
            .catch((response) => {
              response.hasRequestError().should.be.equal(false);
              response.isError().should.be.equal(true);
              response.getError().should.have.property('code', 404);
              done();
            })
            .catch((err) => done(err));
        });
      });
    });
  });

  describe('delete a user', function() {
    context('when current user is not connected', () => {
      it('should send 403 error', (done) => {
        client.resetToken();
        client.deleteUserById(5)
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is connected as a "user"', () => {
      it('should send 403 error', (done) => {
        client.resetToken();
        client.createAccessToken({ email: users.validated.email, password: users.validated.password })
          .then((data) => {
            client.setToken(data.token);
            return client.deleteUserById(5);
          })
          .then((data) => done(new Error('request should not be resolved')))
          .catch((response) => {
            response.hasRequestError().should.be.equal(false);
            response.isError().should.be.equal(true);
            response.getError().should.have.property('code', 403);
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('when current user is connected as a "admin"', () => {
      context('and delete a document', () => {
        it('should send valid deleted doc', (done) => {
          client.resetToken();
          client.createAccessToken({ email: users.admin.email, password: users.admin.password })
            .then((data) => {
              client.setToken(data.token);
              return client.deleteUserById(4);
            })
            .then((response) => {
              response.should.be.an('object').and.have.property('id').and.be.equal(4);
              done();
            })
            .catch((err) => done(err));
        });
      });

      context('and delete a document that does not exists', () => {
        it('should send a 404 error', (done) => {
          client.resetToken();
          client.createAccessToken({ email: users.admin.email, password: users.admin.password })
            .then((data) => {
              client.setToken(data.token);
              return client.deleteUserById(5);
            })
            .then((res) => console.log('res', res))
            .catch((response) => {
              response.hasRequestError().should.be.equal(false);
              response.isError().should.be.equal(true);
              response.getError().should.have.property('code', 404);
              done();
            })
            .catch((err) => done(err));
        });
      });
    });

  });
});
