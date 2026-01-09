/**
 * Manual verification script for issue #1415
 * Tests that the context field is properly deserialized from listEvents API
 *
 * Usage: npx tsx scripts/verify-context-field.ts
 *
 * Requires WORKOS_API_KEY environment variable to be set
 */

import { WorkOS } from '../src/index';

async function main() {
  const apiKey = process.env.WORKOS_API_KEY;
  if (!apiKey) {
    console.error('Error: WORKOS_API_KEY environment variable is required');
    process.exit(1);
  }

  const workos = new WorkOS(apiKey);

  console.log('Fetching events with authentication events...\n');

  try {
    // Fetch authentication events which typically have context with client_id
    const result = await workos.events.listEvents({
      events: [
        'authentication.oauth_succeeded',
        'authentication.sso_succeeded',
        'authentication.password_succeeded',
        'authentication.magic_auth_succeeded',
      ],
      limit: 5,
    });

    console.log(`Found ${result.data.length} events\n`);

    for (const event of result.data) {
      console.log('─'.repeat(60));
      console.log(`Event ID: ${event.id}`);
      console.log(`Type: ${event.event}`);
      console.log(`Created: ${event.createdAt}`);

      if (event.context) {
        console.log('Context:', JSON.stringify(event.context, null, 2));
      } else {
        console.log('Context: (not present)');
      }
      console.log();
    }

    // Summary
    const eventsWithContext = result.data.filter((e) => e.context);
    console.log('─'.repeat(60));
    console.log(
      `\nSummary: ${eventsWithContext.length}/${result.data.length} events have context field`,
    );

    if (eventsWithContext.length > 0) {
      console.log('\n✅ Context field is being deserialized correctly!');
    } else {
      console.log(
        '\n⚠️  No events with context found. This may be expected if no recent authentication events exist.',
      );
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }
}

main();
