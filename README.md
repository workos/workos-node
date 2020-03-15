# workos-node

A WorkOS client for node applications in your organization to control and monitor the access of information within your organization.

## Installation

You can install the WorkOS JS client in your local environment by running:

```
yarn add @workos-inc/node
```

## Configuration

To use the client you must provide an API key located from the WorkOS dashboard either as an environment variable `WORKOS_API_KEY`:

```sh
WORKOS_API_KEY="sk_1234" ./app
```

Or you can set it on your own before your application starts:

```ts
import WorkOS from '@workos-inc/node';

const workos = new WorkOS('sk_1234');
```

## Usage

Creating an Audit Trail event requires a descriptive action name and annotating the event with its CRUD identifier. The action name must contain an action category and an action name separated by a period, for example, `user.login`.

```ts
const event = {
  group: 'organization_1',
  action: 'user.login',
  action_type: 'C',
  actor_name: 'user@email.com',
  actor_id: 'user_1',
  target_name: 'user@email.com',
  target_id: 'user_1',
  location: '1.1.1.1',
  occurred_at: new Date(0),
};

workos.auditTrail.createEvent(event);
```

The resulting event being sent to WorkOS looks like:

```json
{
  "group": "organization_1",
  "action": "user.login",
  "action_type": "C",
  "actor_name": "user@email.com",
  "actor_id": "user_1",
  "target_name": "user@email.com",
  "target_id": "user_1",
  "location": "1.1.1.1",
  "occurred_at": "2019-05-01T01:15:55.619355Z",
  "metadata": {}
}
```

All events are published to WorkOS asynchronously by default and support `await / async` behavior.

## Adding Metadata To Events

Metadata provides additional context for your Audit Trail events that would be helpful to you or others in the future when looking at an Audit Trail event. Values for your metadata are expected to be primitive types:

- string
- boolean
- number
- Date

_You're allowed to have maps with its elements being any one of the primitive types._

You can add metadata directly to events by appending the `metadata` property.:

```ts
const event = {
  group: 'user_1',
  action: 'tweet.update',
  action_type: 'U',
  actor_name: 'user@email.com',
  actor_id: 'user_1',
  target_name: 'user@email.com',
  target_id: 'tweet_5',
  location: '1.1.1.1',
  occurred_at: '2019-05-01T01:15:55.619355Z',
  metadata: {
    body_was: 'What time is the event',
    body: 'What time is the event?',
  },
};

workos.auditTrail.createEvent(event);
```

Resulting in the following being sent to WorkOS:

```json
{
  "group": "user_1",
  "action": "tweet.update",
  "action_type": "U",
  "actor_name": "user@email.com",
  "actor_id": "user_1",
  "target_name": "user@email.com",
  "target_id": "tweet_5",
  "location": "1.1.1.1",
  "occurred_at": "2019-05-01T01:15:55.619355Z",
  "metadata": {
    "body_was": "What time is the event",
    "body": "What time is the event?"
  }
}
```

By adding supportive metadata when you create the event you can see what the original tweet body was and what the body was updated to. For something like a tweet that could get updated multiple times over the course of time, you can't always depend on the database representation to tell you what the body has always been. Without logging it right when the change occurs, you'll forever lose all the individual changes along the way. Good Audit Trail events attach all supporting information surrounding the event which could be used to inform the reader in the future what exactly happened, how it happened, and when it happened.
