import { WorkOS } from '../workos';
import { GenerateLinkIntent } from '../common/interfaces';

export class AdminPortal {
  constructor(private readonly workos: WorkOS) {}

  async generateLink({
    intent,
    organization,
    returnUrl,
    successUrl,
    intentOptions,
    adminEmails,
  }: {
    intent?: GenerateLinkIntent;
    organization: string;
    returnUrl?: string;
    successUrl?: string;
    intentOptions?: {
      sso: {
        bookmarkSlug?: string;
        providerType?: string;
      };
    };
    adminEmails?: string[];
  }): Promise<{ link: string }> {
    const { data } = await this.workos.post('/portal/generate_link', {
      intent,
      organization,
      return_url: returnUrl,
      success_url: successUrl,
      intent_options: intentOptions
        ? {
            sso: {
              bookmark_slug: intentOptions.sso.bookmarkSlug,
              provider_type: intentOptions.sso.providerType,
            },
          }
        : undefined,
      admin_emails: adminEmails,
    });

    return data;
  }
}
