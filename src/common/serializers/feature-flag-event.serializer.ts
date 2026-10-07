import {
  FeatureFlagEventData,
  FeatureFlagEventResponseData,
  FeatureFlagRuleContext,
  FeatureFlagRuleContextResponse,
  FeatureFlagUpdatedContext,
  FeatureFlagUpdatedContextResponse,
} from '../interfaces';

export const deserializeFeatureFlagEventData = (
  flag: FeatureFlagEventResponseData,
): FeatureFlagEventData => ({
  object: flag.object,
  id: flag.id,
  environmentId: flag.environment_id,
  slug: flag.slug,
  name: flag.name,
  description: flag.description,
  owner:
    flag.owner === null
      ? null
      : {
          email: flag.owner.email,
          firstName: flag.owner.first_name,
          lastName: flag.owner.last_name,
        },
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
