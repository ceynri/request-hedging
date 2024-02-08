# request-hedging

Request hedging policy in the frontend.

Not requestor, just hedging policy logic implementation.

## References

- [gRPC Retry Design](https://github.com/grpc/proposal/blob/master/A6-client-retries.md#hedging-policy)
- [gRPC Request Hedging](https://grpc.io/docs/guides/request-hedging/)
- [The Tail At Scale](https://research.google/pubs/pub40801/)

## Usage Cases

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
