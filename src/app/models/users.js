import { Schema } from 'nippy-core-lib';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import base64url from 'base64url';

const aclSettings = require('../config/parameters').acl.profiles;
const profiles = Object.keys(aclSettings);

module.exports = (mongooseConnection) => {
  const schema = new Schema({
    name: 'User',
    connection: mongooseConnection,
    descriptor: {
      password: {
        type: String,
        required: [true, 'password is required'],
        hide: true,
        querable: false,
        validate: {
          validator: (v) => v.length > 6,
          message: 'password must be 6 chars long',
          kind: 'length',
        },
      },
      email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'this email is already use'],
        hideJSON: true,
        querable: true,
        validate: {
          validator: (v) => /\S+@\S+\.\S+/.test(v),
          message: 'email is not valid',
          kind: 'invalid-email',
        },
      },
      profile: {
        type: String,
        required: [true, 'profile is required'],
        enum: profiles,
        default: 'user',
        querable: true,
      },
      validationToken: {
        type: String,
        required: false,
        hideJSON: true,
        default: '',
        querable: false,
      },
      validated_at: {
        type: Date,
        required: false,
        default: null,
        querable: true,
      },
      newPasswordToken: {
        type: String,
        required: false,
        hideJSON: true,
        default: '',
        querable: false,
      },
    },
  });

  schema.pre('save', function (next) {
    if (!this.isNew) {
      next();
    }

    Promise.all([this.saltPassword(), this.generateValidationToken()])
      .then(() => next())
      .catch((err) => {
        throw err;
      });
  });

  schema.virtual('link').get(function () {
    return {
      rel: 'self',
      href: `/api/v1/users/${this.id}`,
    };
  });

  schema.methods.matchCryptPassword = function (cryptPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(cryptPassword, this.password, (err, match) => {
        if (err) return reject(err);
        resolve(match);
      });
    });
  };

  schema.methods.generateValidationToken = function () {
    return new Promise((resolve, reject) => {
      this.validationToken = base64url(crypto.randomBytes(40));
      resolve(this.validationToken);
    });
  };

  schema.methods.generateRecoveryPasswordToken = function () {
    return new Promise((resolve, reject) => {
      this.newPasswordToken = base64url(crypto.randomBytes(40));
      resolve(this.newPasswordToken);
    });
  };

  schema.methods.isValidated = function () {
    return this.validated_at === null;
  };

  // Set the password and salt it
  schema.methods.setPassword = function (password) {
    this.password = password;
    return this.saltPassword();
  };

  schema.methods.saltPassword = function () {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(new Error('Error while crypting password'));
        }
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) {
            return reject(new Error('Error while crypting password'));
          }
          this.password = hash;
          resolve(hash);
        });
      });
    });
  };

  return schema.getModel();
};
