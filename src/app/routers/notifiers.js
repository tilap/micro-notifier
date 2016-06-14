const mainPath = '/notifiers';

module.exports = {
  triggerNotification: {
    method: 'post',
    path: mainPath,
    dispatch: { controller: 'notifiers', method: 'trigger' },
    description: 'Trigger a notification',
    args: {
      params: null,
      get: null,
      data: {},
    },
    results: {
      single: true,
    },
  },
};
