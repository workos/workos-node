import { WorkOS } from './workos';

export * from './audit-logs/interfaces';
export * from './audit-trail/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './directory-sync/interfaces';
export * from './organizations/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './sso/interfaces';
export * from './webhooks/interfaces';

export { WorkOS };

// tslint:disable-next-line:no-default-export
export default WorkOS;
