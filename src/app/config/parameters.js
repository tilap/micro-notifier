import pckg from '../../../package.json';

module.exports = {
  acl: {
    defaultGroup: 'default',
    groups: {
      usersAdmin: ['users.list', 'users.create', 'users.update', 'users.delete'],
      usersRegister: ['users.create'],
    },
    profiles: {
      user: [],
      admin: ['usersAdmin', 'usersRegister'],
      default: ['usersRegister'],
    },
  },
  application: {
    name: pckg.name || 'unknown',
    description: pckg.description || 'unknown',
    version: pckg.version || 'unknown',
  },
  paths: {
    routers: 'routers',
    models: 'models',
    services: 'services',
    controllers: 'controllers',
    events: 'events',
    templates: 'templates',
  },
  tokens: {
    version: 1,
  },
};
