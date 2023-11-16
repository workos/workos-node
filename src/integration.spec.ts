import { WorkOS } from './workos';

describe('WorkOS', () => {
  const workos = new WorkOS(process.env.WORKOS_API_KEY);

  describe('userManagement', () => {
    it('invitations', async () => {
      const email = 'dane+testtesttest@workos.com';
      const invite = await workos.userManagement.sendInvitation({
        email,
        expiresInDays: 2,
      });

      expect(invite).toMatchObject({
        object: 'invitation',
        email,
      });

      const retrievedInvite = await workos.userManagement.getInvitation(
        invite.id,
      );

      expect(retrievedInvite).toMatchObject({
        object: 'invitation',
        email,
      });

      const invitesList = await workos.userManagement.listInvitations({
        email,
      });

      expect(invitesList).toMatchObject({
        data: [
          {
            object: 'invitation',
            email,
          },
        ],
      });

      await workos.userManagement.revokeInvitation(invite.id);
    });
  });
});
