import { Controller, KoaContextHelper } from 'nippy-core-lib';
import loggerFactory from '../../core/factory/logger';

module.exports = class NotifiersController extends Controller {
  constructor() {
    super({
      logger: loggerFactory('controller', { message_prefix: 'controller notifiers' }),
    });
  }

  async trigger(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const { event, data } = h.getDefaultRequestBodies({ event: '', data: {} });

    const service = ctx.getService('notifiers');
    try {
      const results = await service.trigger({ event, data });
      ctx.apiResponse.addData(results);
    } catch (err) {
      this.logger.error('Notification send error', err);
      ctx.apiResponse.setError(err);
    }
    await next();
  }
};
