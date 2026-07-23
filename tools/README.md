# Repository Tools

`validate-repository.mjs` checks structure, schemas, catalog packages,
synthetic scenarios, binary-asset review, prohibited paths, common credential
patterns, and an optional local denylist.

`handbook.mjs` is the zero-dependency v1 distribution command. It generates a
prompt or portable downstream bundle, exports structured capability requests,
checks drift, records a human decision, applies an approved update, and
validates generated artifacts.

Create `.public-safety-denylist` locally when reviewers need to block sensitive
names or hosts. Keep one term per line. The file is ignored by Git, and the
validator reports only the entry number rather than printing the sensitive
term.

Run:

```sh
node tools/validate-repository.mjs
npm run handbook -- help
```
