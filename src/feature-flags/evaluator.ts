import { InMemoryStore } from './in-memory-store';
import { EvaluationContext } from './interfaces';

export class Evaluator {
  constructor(private readonly store: InMemoryStore) {}

  isEnabled(
    flagKey: string,
    context: EvaluationContext = {},
    defaultValue: boolean = false,
  ): boolean {
    const entry = this.store.get(flagKey);

    if (!entry) {
      return defaultValue;
    }

    if (!entry.enabled) {
      return false;
    }

    if (context.organizationId) {
      const orgTarget = entry.targets.organizations.find(
        (t) => t.id === context.organizationId,
      );
      if (orgTarget) {
        return orgTarget.enabled;
      }
    }

    if (context.userId) {
      const userTarget = entry.targets.users.find(
        (t) => t.id === context.userId,
      );
      if (userTarget) {
        return userTarget.enabled;
      }
    }

    return entry.default_value;
  }

  getAllFlags(
    context: EvaluationContext = {},
  ): Record<string, boolean> {
    const flags = this.store.getAll();
    const result: Record<string, boolean> = {};

    for (const slug of Object.keys(flags)) {
      result[slug] = this.isEnabled(slug, context);
    }

    return result;
  }
}
