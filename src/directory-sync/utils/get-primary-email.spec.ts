import { getPrimaryEmail } from './get-primary-email';
import { Group, UserWithGroups } from '../interfaces';

describe('getPrimaryEmail', () => {
  const group: Group = {
    id: 'dir_grp_123',
    idp_id: '123',
    directory_id: 'dir_123',
    organization_id: 'org_123',
    name: 'Foo Group',
    created_at: `2021-10-27 15:21:50.640958`,
    updated_at: '2021-10-27 15:21:50.640959',
    raw_attributes: {
      foo: 'bar',
    },
  };

  const userWithGroup: UserWithGroups = {
    id: 'user_123',
    custom_attributes: {
      custom: true,
    },
    directory_id: 'dir_123',
    organization_id: 'org_123',
    emails: [
      {
        primary: true,
        type: 'type',
        value: 'jonsnow@workos.com',
      },
    ],
    first_name: 'Jon',
    groups: [group],
    idp_id: 'idp_foo',
    last_name: 'Snow',
    raw_attributes: {},
    state: 'active',
    username: 'jonsnow',
  };

  it(`returns primary email value`, () => {
    const primaryEmail = getPrimaryEmail(userWithGroup);

    expect(primaryEmail).toEqual('jonsnow@workos.com');
  });
});
