const usersSeeds = require(`../seed/testing/users`);

var users = {
  admin : null,
  validated: null,
  notvalidated : null,
};

usersSeeds.forEach((user) => {
  if (user.profile && user.profile === 'admin') {
    users.admin = user;
  } else if (user.validated_at) {
    users.validated = user;
  } else {
    users.notvalidated = user;
  }
});

Object.keys(users).forEach((type) => {
  if (users[type] === null) {
    throw new Error('Missing seed data to perform tests')
  }
});

module.exports = users;
