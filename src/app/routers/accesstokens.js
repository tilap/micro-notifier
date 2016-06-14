module.exports = {
  createAccessToken: {
    method: 'post',
    path: '/accounts/accesstokens',
    dispatch: { controller: 'accesstokens', method: 'create' },
    description: 'Create a new access token for a user based on it email/password',
    args: {
      params: null,
      get: null,
      data: {},
    },
    results: {
      single: true,
    },
  },
  getCurrentUser: {
    method: 'get',
    path: '/accounts/accesstokens',
    dispatch: { controller: 'accesstokens', method: 'getUser' },
    description: 'Get the current user based on the access token',
    args: {
      params: null,
      get: null,
      data: null,
    },
    results: {
      single: true,
    },
  },
};
