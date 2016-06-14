import ContextService from '../../core/class/service-context';
import { paths as pathsConfig } from '../config/parameters';
import { UncaughtError, ConfigurationError, NotImplementedError, ValidationError } from '../../core/errors';
import loggerFactory from '../../core/factory/logger';
import nodemailer from 'nodemailer';
import path from 'path';
import { EmailTemplate } from 'email-templates';

if (!pathsConfig || !pathsConfig.templates) {
  throw new ConfigurationError('Missing configuration: template path config for emails');
}

module.exports = class NotifiersService extends ContextService {

  constructor() {
    super();
    this.config = null;
  }

  getConfig() {
    // Allow hot config modification
    if (this.config == null) {
      try {
        this.config = require(path.resolve(__dirname, '../../../notifier-config.json'));
      } catch(err) {
        this.logger.error('Unable to load the json notifier configuration', err);
        throw new ConfigurationError('Unable to load the json notifier configuration');
      }
    }
    return this.config;
  }

  getCurrentAppConfig() {
    this.assertHasContextUser();
    const appId = this.getContextUser().email;

    const cfg = this.getConfig();
    this.assert(cfg[appId], new ConfigurationError(`App "${appId}" specific configuration not set`));
    this.assert(cfg[appId].events, new ConfigurationError(`App "${appId}" specific configuration not set for events`));
    this.assert(cfg[appId].transporters, new ConfigurationError(`App "${appId}" specific configuration not set for transports`));

    return cfg[appId];
  }

  getTransporter(name) {
    const config = this.getCurrentAppConfig();
    this.assert(config.transporters[name], new ConfigurationError(`Transporter ${name} not configured`));
    const transport = config.transporters[name].transport || null;
    const options = config.transporters[name].options || {};

    if (transport) {
      const t = require(transport);
      return nodemailer.createTransport(transport(options));
    } else {
      return nodemailer.createTransport(options);
    }
  }

  async trigger({ event = '', data = {} } = {}) {
    this.assert(event, new ValidationError('No event provided'));

    const config = this.getCurrentAppConfig();
    this.assert(config.events[event], new NotImplementedError('Event not implemented'));

    const eventConfig = config.events[event];
    let promises = [];
    eventConfig.forEach((triggerConfig) => {
      let { type = 'mail', template = { name: '', data: {}}, options = {}, transporter = null } = triggerConfig;

      Object.assign(data, template.data);

      switch (type) {
        case 'mail': {
          if (data.user && data.user.email) {
            if (!options.to) options.to = [];
            options.to.push(data.user.email);
          }

          promises.push(new Promise((resolve, reject) => {
            this.buildMailTemplate(template.name, data)
            .catch((err) => {
              this.logger.error('Error while compiling email template', err);
              return reject(new UncaughtError('Error while compiling email template'));
            })
            .then((content) => {
              options.html = content.html;
              options.text = content.text;

              const t = this.getTransporter(transporter);
              if (t === null) return reject(new ConfigurationError(`Unknown transporter ${transporter}`));
              t.sendMail(options, (err, info) => {
                if (err) {
                  this.logger.error('Error sending email', err);
                  return reject(new UncaughtError('Error while sending email'));
                }
                this.logger.verbose('Email send', info);
                return resolve(true);
              });
            })
            ;
          }));
          break;
        }
        default:
          throw new UncaughtError(`Unknown notification type "${type}"`);
      }
    });

    let results = {
      torun: promises.length,
      success: 0,
      errors: 0,
    };

    if (promises.length) {
      let promisesResults = await Promise.all(promises);
      promisesResults.forEach((res) => {
        if (res) {
          results.success += 1;
        } else {
          results.errors += 1;
        }
      });
    }

    return results;
  }

  buildMailTemplate(template, data = {}) {
    if (!template) {
      throw new ConfigurationError('No template provided to build email content');
    }

    const templateDir = path.resolve(__dirname, '../../../', pathsConfig.templates, template);
    const emailTemplate = new EmailTemplate(templateDir);

    return new Promise((resolve, reject) => {
      emailTemplate.render(data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};
