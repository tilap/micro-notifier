import { aclFactory } from 'nippy-core-lib';
import parameters from '../app/config/parameters';

const acl = aclFactory({
  groups: parameters.acl.groups,
  profiles: parameters.acl.profiles,
  defaultGroup: parameters.acl.defaultGroup,
});

export default acl;
