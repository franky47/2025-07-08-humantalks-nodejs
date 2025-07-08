# François Best

🦋 @francoisbest.com
🐙 @franky47

> Dévelopeur freelance (FullStack TS, Node.js, React)
> Contributeur OSS (`47ng/nuqs`, Next.js)

---

# Node.js can do that?! 🤯

Objectif: réduire nos `node_modules`

> Tip: MàJ vos versions!

---

# Enter The Matrix 😎

---

# Transpilation

Avant:

- `ts-node` + (`tsc` | `swc`)
- `tsx`

Après:

- `--experimental-strip-types`: >=22.6
- Built-in: >=23.6

---

# Environment

Avant:

- `dotenv` (now with ads! 💸)

Après:

- `--env-file`: >= 20.6

---

# Output colouring

Avant:

- `chalk`
- `kleur`
- `ansi-colors`
- etc

Après:

- `import { styleText } from node:utils`: >=21.7

---

# Watching the FS

Avant:

- `chokidar`
- `nodemon`

Après:

- `--watch`: >=22

---

# Testing

Avant:

- `jest`
- `vitest`

Après:

- `node:test`: >=20

---

# Permissions

Avant: 🦗 (mais dans Deno 🦕)

Après:

- `--permission`: >=22.13
- `--allow-fs-read` etc

---

# require(ESM)

```ts
// CommonJS
module.exports.hello = 'world'
const { hello } = require('./hello.cjs')

// ES Modules
export const hello = 'world'
import { hello } from './hello.mjs'
```

Avant:

- ✅ CJS: require(CJS)
- ❌ CJS: require(ESM)
- ✅ ESM: import CJS
- ✅ ESM: import ESM

Après: interopérabilité

- ✅ CJS: require(CJS)
- ✅ CJS: require(ESM) (>=20.17 🙌)
- ✅ ESM: import CJS
- ✅ ESM: import ESM

> Caveat: pas de top-level await,
> les modules doivent être synchrones.

---

# Recap

- `node *.ts`
- `--env-file`
- `--watch`
- `--permission`, `--allow-fs-read` etc
- `--test` & `node:test`
- `styleText` from `node:util`

---

# Merci!

Liens:

- [Repo (code & slides)](https://github.com/franky47/2025-07-08-humantalks-nodejs)
- [BlueSky](https://bsky.app/profile/francoisbest.com)
- [LinkedIn](https://www.linkedin.com/in/francoisbest/)
- [nuqs (URL state manager for React)](https://nuqs.47ng.com)
