import { WorkOS } from './workos';

function random(length: number) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('WorkOS', () => {
  const workos = new WorkOS(process.env.WORKOS_API_KEY);

  describe('userManagement', () => {
    it('organization memberships', async () => {
      const testId = random(12);
      const user = await workos.userManagement.createUser({
        email: `dane+${testId}@workos.com`,
      });
      const org = await workos.organizations.createOrganization({
        name: `dane ${testId}`,
        domains: ['workos.com'],
      });

      const om = await workos.userManagement.createOrganizationMembership({
        organizationId: org.id,
        userId: user.id,
      });

      console.log(om);

      expect(om).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          object: 'organization_membership',
          organizationId: org.id,
          userId: user.id,
        }),
      );

      const list_oms = await workos.userManagement.listOrganizationMemberships({
        organizationId: org.id,
        userId: user.id,
      });

      console.log(list_oms.data);

      expect(list_oms).toEqual(
        expect.objectContaining({
          data: [
            expect.objectContaining({
              id: expect.any(String),
              object: 'organization_membership',
              organizationId: org.id,
              userId: user.id,
            }),
          ],
        }),
      );

      const single_om = await workos.userManagement.getOrganizationMembership(
        om.id,
      );

      expect(single_om).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          object: 'organization_membership',
          organizationId: org.id,
          userId: user.id,
        }),
      );

      await workos.userManagement.deleteOrganizationMembership(om.id);

      await expect(
        workos.userManagement.getOrganizationMembership(om.id),
      ).rejects.toThrowError();
    });
  });
});
