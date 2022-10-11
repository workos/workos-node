import { getPrimaryEmail } from './get-primary-email';
import { User } from '../interfaces';

describe('getPrimaryEmail', () => {
  const user: User = {
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
    idp_id: 'idp_foo',
    last_name: 'Snow',
    raw_attributes: {},
    state: 'active',
    username: 'jonsnow',
    job_title: 'Knight of the Watch',
  };

  it(`returns primary email value`, () => {
    const primaryEmail = getPrimaryEmail(user);

    expect(primaryEmail).toEqual('jonsnow@workos.com');
  });
});
