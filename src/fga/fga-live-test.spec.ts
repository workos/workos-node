import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { WorkOS } from '../workos';
import { CheckOp, WarrantOp } from './interfaces';

describe.skip('FGA Live Test', () => {
  let workos: WorkOS;

  beforeAll(() => {
    disableFetchMocks();
    workos = new WorkOS('API_KEY');
  });

  afterAll(() => {
    enableFetchMocks();
  });

  it('CRUD objects', async () => {
    const object1 = await workos.fga.createObject({
      object: { objectType: 'document' },
    });
    expect(object1.objectType).toEqual('document');
    expect(object1.objectId).toBeDefined();
    expect(object1.meta).toBeUndefined();

    let object2 = await workos.fga.createObject({
      object: { objectType: 'folder', objectId: 'planning' },
    });
    let refetchedObject = await workos.fga.getObject(object2);
    expect(refetchedObject.objectType).toEqual(object2.objectType);
    expect(refetchedObject.objectId).toEqual(object2.objectId);
    expect(refetchedObject.meta).toEqual(object2.meta);

    object2 = await workos.fga.updateObject({
      object: { objectType: 'folder', objectId: 'planning' },
      meta: { description: 'Second document' },
    });
    refetchedObject = await workos.fga.getObject(object2);
    expect(refetchedObject.objectType).toEqual(object2.objectType);
    expect(refetchedObject.objectId).toEqual(object2.objectId);
    expect(refetchedObject.meta).toEqual(object2.meta);

    let objectsList = await workos.fga.listObjects({ limit: 10 });
    expect(objectsList.data.length).toEqual(2);
    expect(objectsList.data[0].objectType).toEqual(object2.objectType);
    expect(objectsList.data[0].objectId).toEqual(object2.objectId);
    expect(objectsList.data[1].objectType).toEqual(object1.objectType);
    expect(objectsList.data[1].objectId).toEqual(object1.objectId);

    objectsList = await workos.fga.listObjects({
      limit: 10,
      search: 'planning',
    });
    expect(objectsList.data.length).toEqual(1);
    expect(objectsList.data[0].objectType).toEqual(object2.objectType);
    expect(objectsList.data[0].objectId).toEqual(object2.objectId);

    await workos.fga.deleteObject(object1);
    await workos.fga.deleteObject(object2);
    objectsList = await workos.fga.listObjects({ limit: 10 });
    expect(objectsList.data.length).toEqual(0);
  });

  it('multi-tenancy example', async () => {
    // Create users
    const user1 = await workos.fga.createObject({
      object: { objectType: 'user' },
    });
    const user2 = await workos.fga.createObject({
      object: { objectType: 'user' },
    });

    // Create tenants
    const tenant1 = await workos.fga.createObject({
      object: { objectType: 'tenant', objectId: 'tenant-1' },
      meta: { name: 'Tenant 1' },
    });
    const tenant2 = await workos.fga.createObject({
      object: { objectType: 'tenant', objectId: 'tenant-2' },
      meta: { name: 'Tenant 2' },
    });

    let user1TenantsList = await workos.fga.query(
      { q: `select tenant where user:${user1.objectId} is member`, limit: 10 },
      { warrantToken: 'latest' },
    );
    expect(user1TenantsList.data.length).toEqual(0);
    let tenant1UsersList = await workos.fga.query(
      {
        q: `select member of type user for tenant:${tenant1.objectId}`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(tenant1UsersList.data.length).toEqual(0);

    // Assign user1 -> tenant1
    await workos.fga.writeWarrant({
      object: tenant1,
      relation: 'member',
      subject: user1,
    });

    user1TenantsList = await workos.fga.query(
      { q: `select tenant where user:${user1.objectId} is member`, limit: 10 },
      { warrantToken: 'latest' },
    );
    expect(user1TenantsList.data.length).toEqual(1);
    expect(user1TenantsList.data[0].objectType).toEqual('tenant');
    expect(user1TenantsList.data[0].objectId).toEqual('tenant-1');
    expect(user1TenantsList.data[0].meta).toEqual({ name: 'Tenant 1' });

    tenant1UsersList = await workos.fga.query(
      {
        q: `select member of type user for tenant:${tenant1.objectId}`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(tenant1UsersList.data.length).toEqual(1);
    expect(tenant1UsersList.data[0].objectType).toEqual('user');
    expect(tenant1UsersList.data[0].objectId).toEqual(user1.objectId);
    expect(tenant1UsersList.data[0].meta).toBeUndefined();

    // Remove user1 -> tenant1
    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: tenant1,
      relation: 'member',
      subject: user1,
    });

    user1TenantsList = await workos.fga.query(
      { q: `select tenant where user:${user1.objectId} is member`, limit: 10 },
      { warrantToken: 'latest' },
    );
    expect(user1TenantsList.data.length).toEqual(0);
    tenant1UsersList = await workos.fga.query(
      {
        q: `select member of type user for tenant:${tenant1.objectId}`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(tenant1UsersList.data.length).toEqual(0);

    // Clean up
    await workos.fga.deleteObject(user1);
    await workos.fga.deleteObject(user2);
    await workos.fga.deleteObject(tenant1);
    await workos.fga.deleteObject(tenant2);
  });

  it('RBAC example', async () => {
    // Create users
    const adminUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });
    const viewerUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });

    // Create roles
    const adminRole = await workos.fga.createObject({
      object: { objectType: 'role', objectId: 'admin' },
      meta: { name: 'Admin', description: 'The admin role' },
    });
    const viewerRole = await workos.fga.createObject({
      object: { objectType: 'role', objectId: 'viewer' },
      meta: { name: 'Viewer', description: 'The viewer role' },
    });

    // Create permissions
    const createPermission = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'create-report' },
      meta: {
        name: 'Create Report',
        description: 'Permission to create reports',
      },
    });
    const viewPermission = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'view-report' },
      meta: { name: 'View Report', description: 'Permission to view reports' },
    });

    let adminUserRolesList = await workos.fga.query(
      {
        q: `select role where user:${adminUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    let adminRolePermissionsList = await workos.fga.query(
      {
        q: `select permission where role:${adminRole.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(adminUserRolesList.data.length).toEqual(0);
    expect(adminRolePermissionsList.data.length).toEqual(0);

    let adminUserHasPermission = await workos.fga.check(
      { object: createPermission, relation: 'member', subject: adminUser },
      { warrantToken: 'latest' },
    );
    expect(adminUserHasPermission.isAuthorized()).toEqual(false);

    // Assign 'create-report' -> admin role -> admin user
    await workos.fga.writeWarrant({
      object: createPermission,
      relation: 'member',
      subject: adminRole,
    });
    await workos.fga.writeWarrant({
      object: adminRole,
      relation: 'member',
      subject: adminUser,
    });

    adminUserHasPermission = await workos.fga.check(
      { object: createPermission, relation: 'member', subject: adminUser },
      { warrantToken: 'latest' },
    );
    expect(adminUserHasPermission.isAuthorized()).toEqual(true);

    adminUserRolesList = await workos.fga.query(
      {
        q: `select role where user:${adminUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(adminUserRolesList.data.length).toEqual(1);
    expect(adminUserRolesList.data[0].objectType).toEqual('role');
    expect(adminUserRolesList.data[0].objectId).toEqual('admin');
    expect(adminUserRolesList.data[0].meta).toEqual({
      name: 'Admin',
      description: 'The admin role',
    });

    adminRolePermissionsList = await workos.fga.query(
      {
        q: `select permission where role:${adminRole.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(adminRolePermissionsList.data.length).toEqual(1);
    expect(adminRolePermissionsList.data[0].objectType).toEqual('permission');
    expect(adminRolePermissionsList.data[0].objectId).toEqual('create-report');
    expect(adminRolePermissionsList.data[0].meta).toEqual({
      name: 'Create Report',
      description: 'Permission to create reports',
    });

    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: createPermission,
      relation: 'member',
      subject: adminRole,
    });
    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: adminRole,
      relation: 'member',
      subject: adminUser,
    });

    adminUserHasPermission = await workos.fga.check(
      { object: createPermission, relation: 'member', subject: adminUser },
      { warrantToken: 'latest' },
    );
    expect(adminUserHasPermission.isAuthorized()).toEqual(false);

    adminUserRolesList = await workos.fga.query(
      {
        q: `select role where user:${adminUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(adminUserRolesList.data.length).toEqual(0);

    adminRolePermissionsList = await workos.fga.query(
      {
        q: `select permission where role:${adminRole.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(adminRolePermissionsList.data.length).toEqual(0);

    // Assign 'view-report' -> viewer user
    let viewerUserHasPermission = await workos.fga.check(
      { object: viewPermission, relation: 'member', subject: viewerUser },
      { warrantToken: 'latest' },
    );
    expect(viewerUserHasPermission.isAuthorized()).toEqual(false);

    let viewerUserPermissionsList = await workos.fga.query(
      {
        q: `select permission where user:${viewerUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(viewerUserPermissionsList.data.length).toEqual(0);

    await workos.fga.writeWarrant({
      object: viewPermission,
      relation: 'member',
      subject: viewerUser,
    });

    viewerUserHasPermission = await workos.fga.check(
      { object: viewPermission, relation: 'member', subject: viewerUser },
      { warrantToken: 'latest' },
    );
    expect(viewerUserHasPermission.isAuthorized()).toEqual(true);

    viewerUserPermissionsList = await workos.fga.query(
      {
        q: `select permission where user:${viewerUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(viewerUserPermissionsList.data.length).toEqual(1);
    expect(viewerUserPermissionsList.data[0].objectType).toEqual('permission');
    expect(viewerUserPermissionsList.data[0].objectId).toEqual('view-report');
    expect(viewerUserPermissionsList.data[0].meta).toEqual({
      name: 'View Report',
      description: 'Permission to view reports',
    });

    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: viewPermission,
      relation: 'member',
      subject: viewerUser,
    });

    viewerUserHasPermission = await workos.fga.check(
      { object: viewPermission, relation: 'member', subject: viewerUser },
      { warrantToken: 'latest' },
    );
    expect(viewerUserHasPermission.isAuthorized()).toEqual(false);

    viewerUserPermissionsList = await workos.fga.query(
      {
        q: `select permission where user:${viewerUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(viewerUserPermissionsList.data.length).toEqual(0);

    // Clean up
    await workos.fga.deleteObject(adminUser);
    await workos.fga.deleteObject(viewerUser);
    await workos.fga.deleteObject(adminRole);
    await workos.fga.deleteObject(viewerRole);
    await workos.fga.deleteObject(createPermission);
    await workos.fga.deleteObject(viewPermission);
  });

  it('pricing tiers, features, and users example', async () => {
    // Create users
    const freeUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });
    const paidUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });

    // Create pricing tiers
    const freeTier = await workos.fga.createObject({
      object: { objectType: 'pricing-tier', objectId: 'free' },
      meta: { name: 'Free Tier' },
    });
    const paidTier = await workos.fga.createObject({
      object: { objectType: 'pricing-tier', objectId: 'paid' },
    });

    // Create features
    const customFeature = await workos.fga.createObject({
      object: { objectType: 'feature', objectId: 'custom-feature' },
      meta: { name: 'Custom Feature' },
    });
    const feature1 = await workos.fga.createObject({
      object: { objectType: 'feature', objectId: 'feature-1' },
    });
    const feature2 = await workos.fga.createObject({
      object: { objectType: 'feature', objectId: 'feature-2' },
    });

    // Assign 'custom-feature' -> paid user
    let paidUserHasFeature = await workos.fga.check(
      { object: customFeature, relation: 'member', subject: paidUser },
      { warrantToken: 'latest' },
    );
    expect(paidUserHasFeature.isAuthorized()).toEqual(false);

    let paidUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${paidUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(paidUserFeaturesList.data.length).toEqual(0);

    await workos.fga.writeWarrant({
      object: customFeature,
      relation: 'member',
      subject: paidUser,
    });

    paidUserHasFeature = await workos.fga.check(
      { object: customFeature, relation: 'member', subject: paidUser },
      { warrantToken: 'latest' },
    );
    expect(paidUserHasFeature.isAuthorized()).toEqual(true);

    paidUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${paidUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(paidUserFeaturesList.data.length).toEqual(1);
    expect(paidUserFeaturesList.data[0].objectType).toEqual('feature');
    expect(paidUserFeaturesList.data[0].objectId).toEqual('custom-feature');
    expect(paidUserFeaturesList.data[0].meta).toEqual({
      name: 'Custom Feature',
    });

    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: customFeature,
      relation: 'member',
      subject: paidUser,
    });

    paidUserHasFeature = await workos.fga.check(
      { object: customFeature, relation: 'member', subject: paidUser },
      { warrantToken: 'latest' },
    );
    expect(paidUserHasFeature.isAuthorized()).toEqual(false);

    paidUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${paidUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(paidUserFeaturesList.data.length).toEqual(0);

    // Assign 'feature-1' -> 'free' tier -> free user
    let freeUserHasFeature = await workos.fga.check(
      { object: feature1, relation: 'member', subject: freeUser },
      { warrantToken: 'latest' },
    );
    expect(freeUserHasFeature.isAuthorized()).toEqual(false);

    let freeUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserFeaturesList.data.length).toEqual(0);

    let freeUserTiersList = await workos.fga.query(
      {
        q: `select pricing-tier where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserTiersList.data.length).toEqual(0);

    await workos.fga.writeWarrant({
      object: feature1,
      relation: 'member',
      subject: freeTier,
    });
    await workos.fga.writeWarrant({
      object: freeTier,
      relation: 'member',
      subject: freeUser,
    });

    freeUserHasFeature = await workos.fga.check(
      { object: feature1, relation: 'member', subject: freeUser },
      { warrantToken: 'latest' },
    );
    expect(freeUserHasFeature.isAuthorized()).toEqual(true);

    freeUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserFeaturesList.data.length).toEqual(1);
    expect(freeUserFeaturesList.data[0].objectType).toEqual('feature');
    expect(freeUserFeaturesList.data[0].objectId).toEqual('feature-1');
    expect(freeUserFeaturesList.data[0].meta).toBeUndefined();

    freeUserTiersList = await workos.fga.query(
      {
        q: `select pricing-tier where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserTiersList.data.length).toEqual(1);
    expect(freeUserTiersList.data[0].objectType).toEqual('pricing-tier');
    expect(freeUserTiersList.data[0].objectId).toEqual('free');
    expect(freeUserTiersList.data[0].meta).toEqual({ name: 'Free Tier' });

    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: feature1,
      relation: 'member',
      subject: freeTier,
    });
    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: freeTier,
      relation: 'member',
      subject: freeUser,
    });

    freeUserHasFeature = await workos.fga.check(
      { object: feature1, relation: 'member', subject: freeUser },
      { warrantToken: 'latest' },
    );
    expect(freeUserHasFeature.isAuthorized()).toEqual(false);

    freeUserFeaturesList = await workos.fga.query(
      {
        q: `select feature where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserFeaturesList.data.length).toEqual(0);

    freeUserTiersList = await workos.fga.query(
      {
        q: `select pricing-tier where user:${freeUser.objectId} is member`,
        limit: 10,
      },
      { warrantToken: 'latest' },
    );
    expect(freeUserTiersList.data.length).toEqual(0);

    // Clean up
    await workos.fga.deleteObject(freeUser);
    await workos.fga.deleteObject(paidUser);
    await workos.fga.deleteObject(freeTier);
    await workos.fga.deleteObject(paidTier);
    await workos.fga.deleteObject(customFeature);
    await workos.fga.deleteObject(feature1);
    await workos.fga.deleteObject(feature2);
  });

  it('warrants', async () => {
    const user1 = await workos.fga.createObject({
      object: { objectType: 'user', objectId: 'userA' },
    });
    const user2 = await workos.fga.createObject({
      object: { objectType: 'user', objectId: 'userB' },
    });
    const newPermission = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm1' },
      meta: { name: 'Permission 1', description: 'Permission 1' },
    });

    let userHasPermission = await workos.fga.check(
      { object: newPermission, relation: 'member', subject: user1 },
      { warrantToken: 'latest' },
    );
    expect(userHasPermission.isAuthorized()).toEqual(false);

    const warrant1 = await workos.fga.writeWarrant({
      object: newPermission,
      relation: 'member',
      subject: user1,
    });
    expect(warrant1.warrantToken).toBeDefined();
    const warrant2 = await workos.fga.writeWarrant({
      object: newPermission,
      relation: 'member',
      subject: user2,
    });
    expect(warrant2.warrantToken).toBeDefined();

    const warrants1 = await workos.fga.listWarrants(
      { limit: 1 },
      { warrantToken: 'latest' },
    );
    expect(warrants1.data.length).toEqual(1);
    expect(warrants1.data[0].objectType).toEqual('permission');
    expect(warrants1.data[0].objectId).toEqual('perm1');
    expect(warrants1.data[0].relation).toEqual('member');
    expect(warrants1.data[0].subject.objectType).toEqual('user');
    expect(warrants1.data[0].subject.objectId).toEqual(user2.objectId);

    const warrants2 = await workos.fga.listWarrants(
      { limit: 1, after: warrants1.listMetadata.after },
      { warrantToken: 'latest' },
    );
    expect(warrants2.data.length).toEqual(1);
    expect(warrants2.data[0].objectType).toEqual('permission');
    expect(warrants2.data[0].objectId).toEqual('perm1');
    expect(warrants2.data[0].relation).toEqual('member');
    expect(warrants2.data[0].subject.objectType).toEqual('user');
    expect(warrants2.data[0].subject.objectId).toEqual(user1.objectId);

    const warrants3 = await workos.fga.listWarrants(
      { subjectType: 'user', subjectId: user1.objectId },
      { warrantToken: 'latest' },
    );
    expect(warrants3.data.length).toEqual(1);
    expect(warrants3.data[0].objectType).toEqual('permission');
    expect(warrants3.data[0].objectId).toEqual('perm1');
    expect(warrants3.data[0].relation).toEqual('member');
    expect(warrants3.data[0].subject.objectType).toEqual('user');
    expect(warrants3.data[0].subject.objectId).toEqual(user1.objectId);

    userHasPermission = await workos.fga.check(
      { object: newPermission, relation: 'member', subject: user1 },
      { warrantToken: 'latest' },
    );
    expect(userHasPermission.isAuthorized()).toEqual(true);

    const query = `select permission where user:${user1.objectId} is member`;
    const response = await workos.fga.query(
      { q: query },
      { warrantToken: 'latest' },
    );
    expect(response.data.length).toEqual(1);
    expect(response.data[0].objectType).toEqual('permission');
    expect(response.data[0].objectId).toEqual('perm1');
    expect(response.data[0].relation).toEqual('member');

    await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: newPermission,
      relation: 'member',
      subject: user1,
    });

    userHasPermission = await workos.fga.check(
      { object: newPermission, relation: 'member', subject: user1 },
      { warrantToken: 'latest' },
    );
    expect(userHasPermission.isAuthorized()).toEqual(false);

    // Clean up
    await workos.fga.deleteObject(user1);
    await workos.fga.deleteObject(user2);
    await workos.fga.deleteObject(newPermission);
  });

  it('check many warrants', async () => {
    const newUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });
    const permission1 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm1' },
      meta: { name: 'Permission 1', description: 'Permission 1' },
    });
    const permission2 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm2' },
      meta: { name: 'Permission 2', description: 'Permission 2' },
    });

    const userHasPermissions = await workos.fga.checkMany(
      {
        op: CheckOp.AnyOf,
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasPermissions.isAuthorized()).toEqual(false);

    let warrantResponse = await workos.fga.writeWarrant({
      object: permission1,
      relation: 'member',
      subject: newUser,
    });
    expect(warrantResponse.warrantToken).toBeDefined();

    let userHasAtLeastOnePermission = await workos.fga.checkMany(
      {
        op: CheckOp.AnyOf,
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasAtLeastOnePermission.isAuthorized()).toEqual(true);

    let userHasAllPermissions = await workos.fga.checkMany(
      {
        op: CheckOp.AllOf,
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasAllPermissions.isAuthorized()).toEqual(false);

    warrantResponse = await workos.fga.writeWarrant({
      object: permission2,
      relation: 'member',
      subject: newUser,
    });
    expect(warrantResponse.warrantToken).toBeDefined();

    userHasAtLeastOnePermission = await workos.fga.checkMany(
      {
        op: CheckOp.AnyOf,
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasAtLeastOnePermission.isAuthorized()).toEqual(true);

    userHasAllPermissions = await workos.fga.checkMany(
      {
        op: CheckOp.AllOf,
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasAllPermissions.isAuthorized()).toEqual(true);

    warrantResponse = await workos.fga.batchWriteWarrants([
      {
        op: WarrantOp.Delete,
        object: permission1,
        relation: 'member',
        subject: newUser,
      },
      {
        op: WarrantOp.Delete,
        object: permission2,
        relation: 'member',
        subject: newUser,
      },
    ]);
    expect(warrantResponse.warrantToken).toBeDefined();

    // Clean up
    await workos.fga.deleteObject(newUser);
    await workos.fga.deleteObject(permission1);
    await workos.fga.deleteObject(permission2);
  });

  it('batch create/delete/check warrants', async () => {
    const newUser = await workos.fga.createObject({
      object: { objectType: 'user' },
    });
    const permission1 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm1' },
      meta: { name: 'Permission 1', description: 'Permission 1' },
    });
    const permission2 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm2' },
      meta: { name: 'Permission 2', description: 'Permission 2' },
    });

    let userHasPermissions = await workos.fga.batchCheck(
      {
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasPermissions[0].isAuthorized()).toEqual(false);
    expect(userHasPermissions[1].isAuthorized()).toEqual(false);

    const warrants = await workos.fga.batchWriteWarrants([
      { object: permission1, relation: 'member', subject: newUser },
      { object: permission2, relation: 'member', subject: newUser },
    ]);
    expect(warrants.warrantToken).toBeDefined();

    userHasPermissions = await workos.fga.batchCheck(
      {
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasPermissions[0].isAuthorized()).toEqual(true);
    expect(userHasPermissions[1].isAuthorized()).toEqual(true);

    const warrantToken = await workos.fga.batchWriteWarrants([
      {
        op: WarrantOp.Delete,
        object: permission1,
        relation: 'member',
        subject: newUser,
      },
      {
        op: WarrantOp.Delete,
        object: permission2,
        relation: 'member',
        subject: newUser,
      },
    ]);
    expect(warrantToken).toBeDefined();

    userHasPermissions = await workos.fga.batchCheck(
      {
        warrants: [
          { object: permission1, relation: 'member', subject: newUser },
          { object: permission2, relation: 'member', subject: newUser },
        ],
      },
      { warrantToken: 'latest' },
    );
    expect(userHasPermissions[0].isAuthorized()).toEqual(false);
    expect(userHasPermissions[1].isAuthorized()).toEqual(false);

    await workos.fga.deleteObject(newUser);
    await workos.fga.deleteObject(permission1);
    await workos.fga.deleteObject(permission2);
  });

  it('warrant with policy', async () => {
    let writeResult = await workos.fga.writeWarrant({
      object: { objectType: 'permission', objectId: 'test-permission' },
      relation: 'member',
      subject: { objectType: 'user', objectId: 'user-1' },
      policy: `geo == "us"`,
    });
    expect(writeResult.warrantToken).toBeDefined();

    let checkResult = await workos.fga.check(
      {
        object: { objectType: 'permission', objectId: 'test-permission' },
        relation: 'member',
        subject: { objectType: 'user', objectId: 'user-1' },
        context: { geo: 'us' },
      },
      {
        warrantToken: 'latest',
      },
    );
    expect(checkResult.isAuthorized()).toEqual(true);

    checkResult = await workos.fga.check(
      {
        object: { objectType: 'permission', objectId: 'test-permission' },
        relation: 'member',
        subject: { objectType: 'user', objectId: 'user-1' },
        context: { geo: 'eu' },
      },
      {
        warrantToken: 'latest',
      },
    );
    expect(checkResult.isAuthorized()).toEqual(false);

    writeResult = await workos.fga.writeWarrant({
      op: WarrantOp.Delete,
      object: { objectType: 'permission', objectId: 'test-permission' },
      relation: 'member',
      subject: { objectType: 'user', objectId: 'user-1' },
      policy: `geo == "us"`,
    });
    expect(writeResult.warrantToken).toBeDefined();

    // Clean up
    await workos.fga.deleteObject({
      objectType: 'permission',
      objectId: 'test-permission',
    });
    await workos.fga.deleteObject({ objectType: 'user', objectId: 'user-1' });
  });

  it('query', async () => {
    const userA = await workos.fga.createObject({
      object: { objectType: 'user', objectId: 'userA' },
    });
    const userB = await workos.fga.createObject({
      object: { objectType: 'user', objectId: 'userB' },
    });
    const permission1 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm1' },
      meta: { name: 'Permission 1', description: 'This is permission 1.' },
    });
    const permission2 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm2' },
    });
    const permission3 = await workos.fga.createObject({
      object: { objectType: 'permission', objectId: 'perm3' },
      meta: { name: 'Permission 3', description: 'This is permission 3.' },
    });
    const role1 = await workos.fga.createObject({
      object: { objectType: 'role', objectId: 'role1' },
      meta: { name: 'Role 1', description: 'This is role 1.' },
    });
    const role2 = await workos.fga.createObject({
      object: { objectType: 'role', objectId: 'role2' },
      meta: { name: 'Role 2' },
    });

    await workos.fga.writeWarrant({
      object: permission1,
      relation: 'member',
      subject: role1,
    });
    await workos.fga.writeWarrant({
      object: permission2,
      relation: 'member',
      subject: role2,
    });
    await workos.fga.writeWarrant({
      object: permission3,
      relation: 'member',
      subject: role2,
    });
    await workos.fga.writeWarrant({
      object: role2,
      relation: 'member',
      subject: role1,
    });
    await workos.fga.writeWarrant({
      object: permission1,
      relation: 'member',
      subject: role2,
      policy: 'tenantId == 123',
    });
    await workos.fga.writeWarrant({
      object: role1,
      relation: 'member',
      subject: userA,
    });
    await workos.fga.writeWarrant({
      object: role2,
      relation: 'member',
      subject: userB,
    });

    let resultSet = await workos.fga.query(
      { q: 'select role where user:userA is member', limit: 1, order: 'asc' },
      { warrantToken: 'latest' },
    );
    expect(resultSet.data.length).toEqual(1);
    expect(resultSet.data[0].objectType).toEqual('role');
    expect(resultSet.data[0].objectId).toEqual('role1');
    expect(resultSet.data[0].relation).toEqual('member');
    expect(resultSet.data[0].warrant.objectType).toEqual('role');
    expect(resultSet.data[0].warrant.objectId).toEqual('role1');
    expect(resultSet.data[0].warrant.relation).toEqual('member');
    expect(resultSet.data[0].warrant.subject.objectType).toEqual('user');
    expect(resultSet.data[0].warrant.subject.objectId).toEqual('userA');
    expect(resultSet.data[0].warrant.policy).toBeUndefined();
    expect(resultSet.data[0].isImplicit).toEqual(false);

    resultSet = await workos.fga.query(
      {
        q: 'select role where user:userA is member',
        limit: 1,
        order: 'asc',
        after: resultSet.listMetadata.after,
      },
      { warrantToken: 'latest' },
    );
    expect(resultSet.data.length).toEqual(1);
    expect(resultSet.data[0].objectType).toEqual('role');
    expect(resultSet.data[0].objectId).toEqual('role2');
    expect(resultSet.data[0].relation).toEqual('member');
    expect(resultSet.data[0].warrant.objectType).toEqual('role');
    expect(resultSet.data[0].warrant.objectId).toEqual('role2');
    expect(resultSet.data[0].warrant.relation).toEqual('member');
    expect(resultSet.data[0].warrant.subject.objectType).toEqual('role');
    expect(resultSet.data[0].warrant.subject.objectId).toEqual('role1');
    expect(resultSet.data[0].warrant.policy).toBeUndefined();
    expect(resultSet.data[0].isImplicit).toEqual(true);

    resultSet = await workos.fga.query(
      {
        q: 'select permission where user:userB is member',
        context: { tenantId: 123 },
        order: 'asc',
      },
      { warrantToken: 'latest' },
    );
    expect(resultSet.data.length).toEqual(3);
    expect(resultSet.data[0].objectType).toEqual('permission');
    expect(resultSet.data[0].objectId).toEqual('perm1');
    expect(resultSet.data[0].relation).toEqual('member');
    expect(resultSet.data[1].objectType).toEqual('permission');
    expect(resultSet.data[1].objectId).toEqual('perm2');
    expect(resultSet.data[1].relation).toEqual('member');
    expect(resultSet.data[2].objectType).toEqual('permission');
    expect(resultSet.data[2].objectId).toEqual('perm3');
    expect(resultSet.data[2].relation).toEqual('member');

    // Clean up
    await workos.fga.deleteObject(role1);
    await workos.fga.deleteObject(role2);
    await workos.fga.deleteObject(permission1);
    await workos.fga.deleteObject(permission2);
    await workos.fga.deleteObject(permission3);
    await workos.fga.deleteObject(userA);
    await workos.fga.deleteObject(userB);
  });
});
