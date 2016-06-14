import { KoaContextHelper } from 'nippy-core-lib';
import ServiceController from '../../core/class/controller-service';
import loggerFactory from '../../core/factory/logger';
import { UnauthorizedError, ValidationError, NotImplementedError } from '../../core/errors';

module.exports = class AccountsController extends ServiceController {
  constructor() {
    super({
      defaultServiceId: 'users',
      logger: loggerFactory('controller', { message_prefix: 'controller account' }),
    });
  }

  async register(ctx, next) {
    return await super.createOne(ctx);
  }

  async validate(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const service = ctx.getService('users');

    const { id = '', token = '', redirect } = h.getQueries();

    this.logger.verbose(`Validate user account #${id} with token ${token}`);

    let updatedUser = await service.validateByIdAndToken(id, token);
    ctx.apiResponse.setData(updatedUser);
    ctx.setState('user', updatedUser);

    if (redirect) return ctx.redirect(redirect);
    if (next) await next();
  }

  async requestNewPassword(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const service = ctx.getService('users');
    const email = h.getQuery('email', '');

    this.logger.verbose(`New password request for email "${email}"`);

    await service.generateRecoverToken(email);
    if (next) await next();
  }

  async setNewPassword(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const service = ctx.getService('users');

    const token = h.getQuery('token', '');
    const email = h.getRequestBody('email', '');
    const newPassword = h.getRequestBody('password', '');

    let updatedUser = await service.setNewPassword(email, token, newPassword);
    ctx.apiResponse.setData(updatedUser);
    ctx.setState('user', updatedUser);
    if (next) await next();
  }

  async get(ctx, next) {
    const user = ctx.getState('user');
    ctx.assert(user, new UnauthorizedError());
    ctx.apiResponse.addData(user);
    if (next) await next();
  }

  async createAccessToken(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const type = h.getRequestBody('type', 'password');
    ctx.assert(type, new ValidationError('type is required', {
      property: 'type',
      type: 'required',
      message: 'type is required and must match "password"',
    }));

    switch (type) {
      case 'password': {
        const service = ctx.getService('accesstoken');

        const { email, password } = h.getDefaultRequestBodies({ email: '', password: '' });

        const { token, user } = await service.getTokenFromEmailPassword(email, password);
        ctx.apiResponse.setData({ token, user });
        ctx.setState('user', user);

        if (next) await next();
        break;
      }
      default:
        this.logger.warn(`token generator type "${type}" is not available`);
        throw new NotImplementedError(`token generator type "${type}" is not available`);
    }
  }
};
