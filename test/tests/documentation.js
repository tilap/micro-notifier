const chai = require('chai').should();

module.exports = (client, seed) => describe('(documentation)', () => {

  describe('main page', () => {
    it('should provide main data and links', (done) => {
      client.resetToken();
      client.getDocumentationMain().then((response) => {
        response.should.be.an('object').and.have.all.keys(['name', 'description', 'version', 'links']);
        response.links.should.have.any.keys(['methods', 'errors']);
        done();
      }).catch(err => done(err));
    });
  });

  describe('method page', () => {
    it('should provide all methods data', (done) => {
      client
        .resetToken()
        .getDocumentationMethods()
        .then((response) => {
          response.should.be.an('array');
          response.forEach((method) => {
            method.should.have.all.keys(['name', 'method', 'path', 'description', 'args', 'results']);
          })
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('error page', () => {
    it('should provide all errors data', (done) => {
      client
        .resetToken()
        .getDocumentationErrors()
        .then((response) => {
          response.forEach((err) => {
            err.should.have.all.keys(['name', 'code', 'message', 'description']);
          });
          done();
        })
        .catch(err => done(err));
    });
  });
});
