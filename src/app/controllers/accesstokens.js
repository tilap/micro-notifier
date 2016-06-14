import { Controller, KoaContextHelper } from 'nippy-core-lib';
import { UnauthorizedError, ValidationError, NotImplementedError } from '../../core/errors';
import loggerFactory from '../../core/factory/logger';

module.exports = class AccesstokensController extends Controller {
  constructor() {
    super({
      logger: loggerFactory('controller', { message_prefix: 'controller accesstoken' }),
    });
  }

  async getUser(ctx, next) {
    const user = ctx.getState('user');
    ctx.assert(user, new UnauthorizedError());
    ctx.apiResponse.addData(user);
    if (next) await next();
  }

  async create(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const type = h.getRequestBody('type', 'password');
    ctx.assert(type, new ValidationError('type is required', {
      property: 'type',
      type: 'required',
      message: 'type is required and must match "password"',
    }));

    switch (type) {
      case 'password': {
        const service = ctx.getService('accesstokens');

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
