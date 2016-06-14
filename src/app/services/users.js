import ModelService from '../../core/class/service-model';
import { ValidationError } from '../../core/errors';

module.exports = class UsersService extends ModelService {
  constructor() {
    super({ defaultModelName: 'users' });
  }

  async createOne(params) {
    this.assertContextUserCan('users.create');
    return await super.createOne(params);
  }

  async getById(id) {
    this.assertContextUserCan('users.list');
    return await super.getById(id);
  }

  async updateById(id, newData) {
    this.assertContextUserCan('users.update');
    return await super.updateById(id, newData);
  }

  async getPaginated(params) {
    this.assertContextUserCan('users.list');
    return await super.getPaginated(params);
  }

  async deleteById(id) {
    this.assertContextUserCan('users.delete');
    return await super.deleteById(id);
  }

  async validateByIdAndToken(id, token) {
    if (!id || !token) {
      const err = new ValidationError('Some params are missing');
      if (!id) err.addDetail({ property: 'id', kind: 'required', message: 'id is required' });
      if (!token) err.addDetail({ property: 'token', kind: 'required', message: 'token is required' });
    }

    const error = new ValidationError('token validation failed: user not found or unvalid token');

    const user = await super.getById(id);
    this.assert(user, error);
    if (user.validationToken !== token) {
      this.emit('validation-failed', user);
      throw error;
    }
    let res = await super.updateById(user.id, { validationToken: null, validated_at: new Date() });
    this.emit('validated', user);
    return res.updated;
  }

  async generateRecoverToken(email) {
    if (!email) {
      throw new ValidationError('email is required', {
        property: 'email',
        kind: 'required',
        message: 'email is required',
      });
    }

    const account = await super.getModel().findOne({ email });
    if (!account) {
      return false;
    }

    await account.generateRecoveryPasswordToken();
    await account.save();

    this.emit('new-recovery-password-token', account);

    return true;
  }

  async setNewPassword(email, token, newPassword) {
    const account = await super.getModel().findOne({ email, newPasswordToken: token });
    this.assert(account, new ValidationError('token validation failed: user not found or unvalid token'));

    await account.setPassword(newPassword);
    account.newPasswordToken = null;
    await account.save();

    this.emit('new-password-set', account);

    return account;
  }
};
