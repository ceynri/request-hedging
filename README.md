# request-hedging

Request hedging policy in the frontend.

Not requestor, just hedging policy logic implementation.

## Introduction

Hedging policy can be regarded as an aggressive retry policy. A complete request may send multiple identical requests until one of them returns successfully. We don't need to wait for the previous request to time out before sending a new hedging request, which makes the hedging policy have a better optimization effect for long-tail requests.

![example](https://fastly.jsdelivr.net/gh/ceynri/assets@main/images/17126364119081712636411004.png)

> Hedging policy in the backend:
>
> - [gRPC Retry Design](https://github.com/grpc/proposal/blob/master/A6-client-retries.md#hedging-policy)
> - [gRPC Request Hedging](https://grpc.io/docs/guides/request-hedging/)
> - [The Tail At Scale](https://research.google/pubs/pub40801/)

## Getting started

```sh
npm install request-hedging
# or yarn/pnpm...
```

## Use Cases

Single request hedging:

```ts
import { hedging } from 'request-hedging';

const result = await hedging(() => fetch('https://example.com/apis/getData'), {
  maxAttempts: 3, // Up to three times attempted (not required)
});
```

Multiple requests hedging：

```ts
import { hedging } from 'request-hedging';

const result = await hedging([
  () => fetch('https://example.com/apis/getData'),
  () => fetch('https://example.com/backup-apis/getData'),
]);
```

Use `useHedging`：

```ts
import { useHedging } from 'request-hedging';

const hedging = useHedging({
  maxAttempts: 3,
  hedgingDelay: 500,
});

const result1 = await hedging(() => fetch('https://example.com/apis/getData'));

const result2 = await hedging([
  () => fetch('https://example.com/apis/getData'),
  () => fetch('https://example.com/backup-apis/getData'),
], { maxAttempts: 2 });
```

## Options

| name           | type                                       | default value                      |
| -------------- | ------------------------------------------ | ---------------------------------- |
| maxAttempts    | `number`                                   | `Math.max(this.targets.length, 2)` |
| hedgingDelay   | `number` (ms)                              | `1000`                             |
| timeout        | `number` (ms)                              | `Infinity`                         |
| retryableError | `boolean \| ((error: unknown) => boolean)` | `true`                             |

---

## Local Dev

- node >= 18
- pnpm >= 9

```sh
# request-hedging repo
pnpm i
pnpm dev

# Another repo
pnpm link /path/to/request-hedging
```
