import {
  FeatureFlagEventData,
  FeatureFlagEventResponseData,
  FeatureFlagRuleContext,
  FeatureFlagRuleContextResponse,
  FeatureFlagUpdatedContext,
  FeatureFlagUpdatedContextResponse,
} from '../interfaces';

const deserializeFeatureFlagOwner = (
  owner: FeatureFlagEventResponseData['owner'],
): FeatureFlagEventData['owner'] =>
  owner === null
    ? null
    : {
        email: owner.email,
        firstName: owner.first_name,
        lastName: owner.last_name,
      };

export const deserializeFeatureFlagEventData = (
  flag: FeatureFlagEventResponseData,
): FeatureFlagEventData => ({
  object: flag.object,
  id: flag.id,
  environmentId: flag.environment_id,
  slug: flag.slug,
  name: flag.name,
  description: flag.description,
  owner: deserializeFeatureFlagOwner(flag.owner),
  tags: flag.tags,
  enabled: flag.enabled,
  defaultValue: flag.default_value,
  createdAt: flag.created_at,
  updatedAt: flag.updated_at,
});

export const deserializeFeatureFlagRuleContext = (
  context: FeatureFlagRuleContextResponse,
): FeatureFlagRuleContext => ({
  clientId: context.client_id,
  ...(context.actor === undefined ? {} : { actor: context.actor }),
});

export const deserializeFeatureFlagUpdatedContext = (
  context: FeatureFlagUpdatedContextResponse,
): FeatureFlagUpdatedContext => {
  const previous = context.previous_attributes;
  const data = previous?.data;
  return {
    clientId: context.client_id,
    actor: context.actor,
    ...(previous === undefined
      ? {}
      : {
          previousAttributes: {
            ...(data === undefined
              ? {}
              : {
                  data: {
                    ...(data.name === undefined ? {} : { name: data.name }),
                    ...(data.description === undefined
                      ? {}
                      : { description: data.description }),
                    ...(data.tags === undefined ? {} : { tags: data.tags }),
                    ...(data.owner === undefined
                      ? {}
                      : { owner: deserializeFeatureFlagOwner(data.owner) }),
                    ...(data.enabled === undefined
                      ? {}
                      : { enabled: data.enabled }),
                    ...(data.default_value === undefined
                      ? {}
                      : { defaultValue: data.default_value }),
                  },
                }),
          },
        }),
  };
};
