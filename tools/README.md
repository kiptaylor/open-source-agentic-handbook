# Repository Tools

`validate-repository.mjs` checks structure, schemas, catalog packages,
synthetic scenarios, binary-asset review, prohibited paths, common credential
patterns, and an optional local denylist.

Create `.public-safety-denylist` locally when reviewers need to block sensitive
names or hosts. Keep one term per line. The file is ignored by Git, and the
validator reports only the entry number rather than printing the sensitive
term.

Run:

```sh
node tools/validate-repository.mjs
```
