import { getPrimaryEmail } from './get-primary-email';
import { DirectoryUser } from '../interfaces';

describe('getPrimaryEmail', () => {
  const user: DirectoryUser = {
    object: 'directory_user',
    id: 'user_123',
    customAttributes: {
      custom: true,
    },
    directoryId: 'dir_123',
    organizationId: 'org_123',
    email: 'jonsnow@workos.com',
    emails: [
      {
        primary: true,
        type: 'type',
        value: 'jonsnow@workos.com',
      },
    ],
    firstName: 'Jon',
    idpId: 'idp_foo',
    lastName: 'Snow',
    rawAttributes: {},
    state: 'active',
    username: 'jonsnow',
    jobTitle: 'Knight of the Watch',
    createdAt: '2021-10-27 15:21:50.640958',
    updatedAt: '2021-12-13 12:15:45.531847',
  };

  it(`returns primary email value`, () => {
    const primaryEmail = getPrimaryEmail(user);

    expect(primaryEmail).toEqual('jonsnow@workos.com');
  });
});
