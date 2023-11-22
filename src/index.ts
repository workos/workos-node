import { WorkOS } from './workos';

export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './directory-sync/utils/get-primary-email';
export * from './events/interfaces';
export * from './organizations/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';

export { WorkOS };

// tslint:disable-next-line:no-default-export
export default WorkOS;
