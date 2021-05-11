import { WorkOS } from '../workos';
import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';

export class Portal {
  constructor(private readonly workos: WorkOS) {}

  async generateLink({
    intent,
    organization,
    returnUrl,
  }: {
    intent: GeneratePortalLinkIntent;
    organization: string;
    returnUrl?: string;
  }): Promise<{ link: string }> {
    const { data } = await this.workos.post('/portal/generate_link', {
      intent,
      organization,
      return_url: returnUrl,
    });

    return data;
  }
}
