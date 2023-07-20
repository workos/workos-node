import { WorkOS } from '../workos';
import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';

export class Portal {
  constructor(private readonly workos: WorkOS) {}

  async generateLink({
    intent,
    organization,
    return_url,
    success_url,
  }: {
    intent: GeneratePortalLinkIntent;
    organization: string;
    return_url?: string;
    success_url?: string;
  }): Promise<{ link: string }> {
    const { data } = await this.workos.post('/portal/generate_link', {
      intent,
      organization,
      return_url,
      success_url,
    });

    return data;
  }
}
