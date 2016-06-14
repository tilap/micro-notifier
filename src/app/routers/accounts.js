const mainPath = '/accounts';

module.exports = {
  registerAccount: {
    method: 'post',
    path: `${mainPath}/register/`,
    dispatch: { controller: 'accounts', method: 'register' },
    description: 'Register a new account',
    args: {
      params: null,
      get: null,
      data: {},
    },
    results: {
      single: true,
    },
  },
  validateAccount: {
    method: 'get',
    path: `${mainPath}/register/`,
    dispatch: { controller: 'accounts', method: 'validate' },
    description: 'Validate an account with account data in url',
    args: {
      params: null,
      get: {},
      data: null,
    },
    results: {
      single: true,
    },
  },
  requestNewPassword: {
    method: 'get',
    path: `${mainPath}/password/`,
    dispatch: { controller: 'accounts', method: 'requestNewPassword' },
    description: 'Request a new password email',
    args: {
      params: null,
      get: {},
      data: null,
    },
    results: {
      single: false,
    },
  },
  setAccountNewPassword: {
    method: 'patch',
    path: `${mainPath}/password/`,
    dispatch: { controller: 'accounts', method: 'setNewPassword' },
    description: 'Set a new password',
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
