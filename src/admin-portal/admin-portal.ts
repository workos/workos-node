import { WorkOS } from '../workos';
import { GenerateLinkIntent } from '../common/interfaces';

export class AdminPortal {
  constructor(private readonly workos: WorkOS) {}

  async generateLink({
    intent,
    organization,
    returnUrl,
    successUrl,
  }: {
    intent: GenerateLinkIntent;
    organization: string;
    returnUrl?: string;
    successUrl?: string;
  }): Promise<{ link: string }> {
    const { data } = await this.workos.post('/portal/generate_link', {
      intent,
      organization,
      return_url: returnUrl,
      success_url: successUrl,
    });

    return data;
  }
}
