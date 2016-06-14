const mainPath = '/users';
module.exports = {
  createUser: {
    method: 'post',
    path: mainPath,
    dispatch: { controller: 'users', method: 'createOne' },
    description: 'Create a new user',
    args: {
      params: null,
      get: null,
      data: {},
    },
    results: {
      single: true,
    },
  },
  getUsers: {
    method: 'get',
    path: mainPath,
    dispatch: { controller: 'users', method: 'get' },
    description: 'Get user list',
    args: {
      params: null,
      get: {},
      data: null,
    },
    results: {
      single: null,
    },
  },
  getUserById: {
    method: 'get',
    path: `${mainPath}/:id`,
    dispatch: { controller: 'users', method: 'getById' },
    description: 'Get a user ressource from its id',
    args: {
      params: ['id'],
      get: null,
      data: null,
    },
    results: {
      single: true,
    },
  },
  updateUsers: {
    method: 'patch',
    path: `${mainPath}`,
    dispatch: { controller: 'users', method: 'update' },
    description: 'Update a list of user ressources',
    args: {
      params: null,
      get: {},
      data: {},
    },
    results: {
      single: false,
    },
  },
  updateUserById: {
    method: 'patch',
    path: `${mainPath}/:id`,
    dispatch: { controller: 'users', method: 'updateById' },
    description: 'Update an existing user ressource',
    args: {
      params: ['id'],
      get: null,
      data: {},
    },
    results: {
      single: true,
    },
  },
  deleteUsers: {
    method: 'delete',
    path: mainPath,
    dispatch: { controller: 'users', method: 'delete' },
    description: 'Delete many user ressources',
    args: {
      params: null,
      get: {},
      data: null,
    },
    results: {
      single: false,
    },
  },
  deleteUserById: {
    method: 'delete',
    path: `${mainPath}/:id`,
    dispatch: { controller: 'users', method: 'deleteById' },
    description: 'Delete a user by its id',
    args: {
      params: ['id'],
      get: null,
      data: null,
    },
    results: {
      single: true,
    },
  },
};
