import Controller from '../../core/class/controller-service';
import loggerFactory from '../../core/factory/logger';

module.exports = class UsersController extends Controller {
  constructor() {
    super({
      defaultServiceId: 'users',
      logger: loggerFactory('controller', { message_prefix: 'controller user' }),
    });
  }
};
