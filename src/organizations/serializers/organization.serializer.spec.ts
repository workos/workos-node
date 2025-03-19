import { deserializeOrganization } from './organization.serializer';
import organizationFixture from '../fixtures/get-organization.json';

const organizationResponse = {
  ...organizationFixture,
  object: 'organization' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  domains: [],
};

describe('deserializeOrganization', () => {
  it('includes metadata if present', () => {
    const metadata = { key: 'value' };

    expect(
      deserializeOrganization({
        ...organizationResponse,
        metadata,
      }),
    ).toMatchObject({
      metadata,
    });
  });

  it('coerces missing metadata to empty object', () => {
    const { metadata, ...organizationResponseWithoutMetadata } =
      organizationResponse;

    expect(
      deserializeOrganization(organizationResponseWithoutMetadata),
    ).toMatchObject({
      metadata: {},
    });
  });
});
