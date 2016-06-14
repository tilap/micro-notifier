import { Service } from 'nippy-core-lib';
import { UnauthorizedError, ForbiddenError } from '../errors';

export default class ContextService extends Service {
  constructor() {
    super();
    this.setContext('user', null);
    this.aclCheck = true;
  }

  disableAclCheck() {
    this.aclCheck = false;
    return this;
  }

  // User context --------------------------------------------------------------
  setContextUser(user) {
    return this.setContext('user', user);
  }

  getContextUser() {
    return this.getContext('user');
  }

  hasContextUser() {
    return this.hasContext('user') && this.getContext('user') !== null;
  }

  contextUserCan(rightId) {
    const profile = (this.hasContextUser() ? this.getContextUser().profile : null);
    return super.getAcl().hasProfileRight(profile, rightId);
  }

  getContextUserRights() {
    const profile = (this.hasContextUser() ? this.getContextUser().profile : null);
    return super.getAcl().getProfileRights(profile);
  }

  assertHasContextUser(message = '') {
    if (!this.aclCheck) return true;
    super.assert(this.hasContextUser(), new UnauthorizedError(message));
  }

  assertNoContextUser(message) {
    if (!this.aclCheck) return true;
    super.assert(!this.hasContextUser(), new ForbiddenError(message));
  }

  assertContextUserCan(rightId, message = '') {
    if (!this.aclCheck) return true;
    super.assert(this.contextUserCan(rightId), new ForbiddenError(message));
  }

  assertUserAndCan(rightId, message = '') {
    this.assertHasContextUser(message);
    this.assertContextUserCan(rightId, message);
  }
}
