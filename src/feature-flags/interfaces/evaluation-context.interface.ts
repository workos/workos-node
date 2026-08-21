/**
 * A single resource in a typed evaluation context. V1 carries only the exact
 * resource ID; attribute matching is a future capability layered onto this
 * same shape.
 */
export interface EvaluationResource {
  id: string;
}

/**
 * Legacy evaluation context, accepted for backward compatibility and
 * normalized internally to the typed form: `userId` matches `user` targets
 * and `organizationId` matches `organization` targets.
 */
export type LegacyEvaluationContext = {
  userId?: string;
  organizationId?: string;
};

/**
 * Typed evaluation context: a direct map of target type slug to the resource
 * being evaluated, e.g.
 * `{ user: { id: 'user_123' }, workspace: { id: 'ws_1' } }`.
 * A context contains at most one resource of each type; callers needing a
 * decision per resource should evaluate once per resource.
 */
export type TypedEvaluationContext = Record<string, EvaluationResource>;

/**
 * Either evaluation context form. The two shapes cannot be mixed in a single
 * call: a hybrid context (a legacy key alongside a typed resource entry) is
 * rejected at evaluation time with a logged warning and matches no targets,
 * so the flag falls back to its default value.
 */
export type EvaluationContext =
  LegacyEvaluationContext | TypedEvaluationContext;
