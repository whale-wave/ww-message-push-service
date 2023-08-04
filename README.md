# Whale Wave Message Push Service

## Config

Modify the contents of `src/config/config.ts`

```ts
export default {
  port: 1234,
  telegram: {
    token: 'xxxx',
    chatGroups: [
      {
        chatId: 'xxxxx',
        replyToMessageId: 5,
      },
    ],
  },
  webhooks: {
    feiShu: ['xxxxxxx'],
  },
};
```

> PS: `config.local.ts` will not be added to git management

## Usage

```bash
pnpm install
pnpm dev
```

## Deploy

```bash
pnpm build
```

> NodeJs version: 18.14.0
