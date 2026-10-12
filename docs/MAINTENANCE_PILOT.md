# Maintenance pilot

Feature → existing development → validated/reviewed PR to main → existing Pages
deployment. This draft leaves both base branches unchanged and preserves the
published résumé/download work from merged PR48.

The shared read-only [contract 1.1.0](https://github.com/stevologic/oss-deps-explorer/blob/1e6e9a9c4dc9f766c49a421ea268f247d1113287/actions/maintenance/README.md)
is pinned by that complete immutable commit. The local JSON policy keeps xAI,
disables advisory AI and all mutations, and reserves active/default/development/
release/Pages branches. Custom critique/growth/content jobs remain separate.

Metadata discovery/sync/deployment moves from daily to weekly; main pushes and
manual dispatch remain. Weekly capture fits GitHub's 14-day traffic window.
Critique moves from weekly to monthly, stores successful content/factual-baseline/
prompt/model hashes, and skips unchanged scheduled content before any model call.
Its single hash artifact retains90days and is renewed after an unchanged monthly
skip. Retrieval accepts only this workflow's successful default-branch scheduled/
manual runs, failing closed on API/incomplete-inventory errors. Dependency caches
expire after seven unused days and are not used for this monthly success marker.
Manual dispatch can rerun it. Auto model upgrades require an explicit setting;
the existing provider/default model is retained. Portfolio apply creates a draft
to development and dispatches CI; it cannot merge/deploy itself. Locked Brand QA
and résumé factual constraints remain intact. Growth stays dispatch-only; README
cadence/billing claims are corrected.

This draft batches green PR39 production/security dependencies and PR29–32 Actions
pins, and revalidates the combined tree. It does not include failing PR45 (ESLint10
and Node26 types require compatibility review). Fresh lockfile advisory fixes
patch sharp/source-map-js/brace-expansion. A scoped @next/eslint-plugin-next glob
replacement removes unpatched braces/micromatch while retaining the actual globSync
API used by that plugin; complete lint/build tests pass. No forced downgrade or
audit omission is used. Original dependency PRs stay open until equivalent changes
land and verify through integration/main.

Validation: Node24 lint, TypeScript, production static build, all 66 static/marker
tests (including a31-day durable retrieval and actual critique skip), full npm audit
(zero vulnerabilities), YAML/policy checks and diff check
pass. The actual unchanged-content path was exercised with network calls forced
to throw: it skipped successfully with zero calls. The shared 32-test safety suite
and complete offline repository pilot pass. The local font/browser PDF gate was
not rerun because shared browser/UI resources are reserved; original PDF/DOCX
bytes and résumé files are unchanged.

Dependabot version updates target development (weekly npm, monthly Actions).
Security updates always remain default-main targeted; the common flow brings
those changes through validated integration rather than claiming bot rerouting.
No schedules become active on production until reviewed integration/main promotion.
