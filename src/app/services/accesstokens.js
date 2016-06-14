import jwt from 'jsonwebtoken';
import ContextService from '../../core/class/service-context';
import { ValidationError, ForbiddenError } from '../../core/errors';

const jwtSecret = require('../config/server').jwt.secret;
const tokenVersion = require('../config/parameters').tokens.version;

module.exports = class AccesstokenService extends ContextService {

  async getTokenFromEmailPassword(email = '', password = '') {
    if (!email || !password) {
      const err = new ValidationError('Some data are missing');
      if (!email) err.addDetail({ property: 'email', kind: 'required', message: 'email is required' });
      if (!password) err.addDetail({ property: 'password', kind: 'required', message: 'password is required' });
      throw err;
    }

    const user = await this.getService('users').getOne({ email });
    if (!user || await user.matchCryptPassword(password) === false) {
      const err = new ValidationError('email / password dont match');
      err.addDetail({ property: 'email', kind: 'mismatch', message: '', name: 'ValidatorError', value: email });
      err.addDetail({ property: 'password', kind: 'mismatch', message: '', name: 'ValidatorError' });
      throw err;
    }

    this.assert(user.validated_at != null, new ForbiddenError('The account has not been validated yet'));
    const tokenStr = this._encodeUserToken(user, 'password');
    return { user, token: tokenStr };
  }

  async getUserFromToken(token) {
    const tokenData = this._verifyUserToken(token);
    if (!tokenData) {
      return null;
    }
    const user = await this.getService('users').getById(tokenData.id);
    return user || null;
  }

  _encodeUserToken(user, auth = 'unknown') {
    const token = jwt.sign({ id: user.id, auth }, jwtSecret, { audience: tokenVersion });
    return token;
  }

  _verifyUserToken(token) {
    try {
      if (token.constructor !== String) return null;
      return jwt.verify(token, jwtSecret, { audience: tokenVersion });
    } catch (err) {
      this.logger.warn(`Bad token verification "${token}`);
      return null;
    }
  }
};
