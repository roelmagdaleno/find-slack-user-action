# Find Slack User

GitHub Action to find a Slack user data by email.

## Configuration

This GitHub Action is using the `users.lookupByEmail` [API method](https://api.slack.com/methods/users.lookupByEmail) and that requires to set up an app and a bot token.

When you create the bot token, it must require the `users:read.email` [scope](https://api.slack.com/scopes/users:read.email). If you don't set the scope, the GitHub Action won't work.

[Follow this guide](https://api.slack.com/authentication/basics) to create an app and a bot token.

## Usage

To get started, you might want to copy the content of the next example into `.github/workflows/cloudways-deploy.yml` and push that file to your repository.

In the example, the deployment will start when you create and push a new tag. [You can change that behavior](https://docs.github.com/en/actions/reference/events-that-trigger-workflows), for example, when you create a release or a simple push to your `main` branch.

```yaml
name: Send Slack Notifications

on:
  push:
    tags:
      - "*"

jobs:
  tag:
    name: New Tag

    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Get Slack User Data
        id: slack_user
        uses: roelmagdaleno/find-slack-user-action@stable
        with:
          email: "custom@example.org"
          fields: "id,name,profile.avatar_hash"
        env:
          SLACK_BOT_TOKEN: xoxb-xxxxxx-xxxxxxx

      - name: Notify Slack Channel
        uses: slackapi/slack-github-action@v1.19.0
        with:
          channel-id: C0XXXXXXXXC
          payload: |
            {
              "text": "This is my user: <@${{ steps.slack_user.outputs.id }}> -- This is my name: ${{ steps.slack_user.outputs.name }} -- And this is my avatar_hash: ${{ steps.slack_user.outputs.profile_avatar_hash }}"
            }
        env:
          SLACK_BOT_TOKEN: xoxb-xxxxxx-xxxxxxx
```

If you don't see your last changes in your server after run the GitHub Action then check whether your Git branch is updated with the changes.

## Environment

You must provide the `SLACK_BOT_TOKEN` as environment value, so the GitHub Action can connect to [Slack API](https://api.slack.com/methods/users.lookupByEmail) and retrieve the desired data.

## Required Inputs

You must provide all of these inputs in your workflow file.

### `email`

The Slack email that will be used to find the user data.

### `fields`

The fields you want to get from the user.

The value is a string with the fields you want from the user separated by commas:

```yaml
- name: Get Slack User Data
  id: slack_user
  uses: roelmagdaleno/find-slack-user-action@stable
  with:
    email: "custom@example.org"
    fields: "id,name"
```

Also, you can use dot notation to get nested data:

```yaml
- name: Get Slack User Data
  id: slack_user
  uses: roelmagdaleno/find-slack-user-action@stable
  with:
    email: "custom@example.org"
    fields: "id,name,profile.avatar_hash"
```

Check the [Available Fields](#available-fields) section to know what are the fields that Slack provides.

## Outputs

The GitHub Action will output the fields you specified in the `fields` attribute.

Let's use this action as an example:

```yaml
- name: Get Slack User Data
  id: slack_user
  uses: roelmagdaleno/find-slack-user-action@stable
  with:
    email: "custom@example.org"
    fields: "id,name,profile.avatar_hash"
```

### Single Fields

You can access the outputs like this:

```
${{ steps.<step_id>.outputs.<field> }}
```

You need to specify an `id` to your current step, so you can access the data of that step. In our example, the `id` is `slack_user`.

Then, you need to specify what `field` you want to get. This is one of the `field` values you put in your `fields` attribute.

At the end, your output command would look like this:

```
${{ steps.slack_user.outputs.id }}
${{ steps.slack_user.outputs.name }}
```

### Nested Fields (Dot Notation)

The output usage for nested fields is similar as single fields. The only difference is the output field will use the keys to get a new object property.

In our example, we want to get the `avatar_hash` that is inside the `profile` property. And, in our `fields` we specified it as `profile.avatar_hash`.

At the end, your output command, for nested fields, would look like this:

```
${{ steps.slack_user.outputs.profile_avatar_hash }}
${{ steps.slack_user.outputs.profile_display_name }}
```

As you can see, the `profile` property will be used as a prefix for the data you really want.

### The `user` output

It also outputs the `user` value that contains the user data you specified in the `fields` attribute.

The `user` output is a JSON in string format (GitHub does this by default with all JSON values).

So, if you want to use the data as JSON you will have to use the [fromJson](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson) function that GitHub provides.

```
${{ fromJson(steps.slack_user.outputs.user).id }}
${{ fromJson(steps.slack_user.outputs.user).profile.avatar_hash }}
```

## Available Fields

The [Slack API](https://api.slack.com/methods/users.lookupByEmail#examples) provides you the next available fields in a successful response:

```json
{
    "id": "W012A3CDE",
    "team_id": "T012AB3C4",
    "name": "spengler",
    "deleted": false,
    "color": "9f69e7",
    "real_name": "Egon Spengler",
    "tz": "America/Los_Angeles",
    "tz_label": "Pacific Daylight Time",
    "tz_offset": -25200,
    "profile": {
        "avatar_hash": "ge3b51ca72de",
        "status_text": "Print is dead",
        "status_emoji": ":books:",
        "real_name": "Egon Spengler",
        "display_name": "spengler",
        "real_name_normalized": "Egon Spengler",
        "display_name_normalized": "spengler",
        "email": "spengler@ghostbusters.example.com",
        "image_24": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "image_32": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "image_48": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "image_72": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "image_192": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "image_512": "https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg",
        "team": "T012AB3C4"
    },
    "is_admin": true,
    "is_owner": false,
    "is_primary_owner": false,
    "is_restricted": false,
    "is_ultra_restricted": false,
    "is_bot": false,
    "updated": 1502138686,
    "is_app_user": false,
    "has_2fa": false
}
```
