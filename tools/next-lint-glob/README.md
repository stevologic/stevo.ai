# Private Next lint compatibility adapter

This private local package implements only the named `globSync` call made by
`@next/eslint-plugin-next@16.4.0` in `utils/get-root-dirs.js`. It retains the
`fast-glob` package identity for that existing dependency slot; its implementation
is tracked here and is not the upstream fast-glob package or a published service.
The root dev dependency plus plugin-only `$fast-glob` override makes clean npm
installs resolve this same local package. Other packages are not overridden.

The original chain reaches micromatch/braces, whose current
[nested-pattern advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
has no patched braces release. The adapter uses pinned tinyglobby 0.2.17, preserving
directory-only matching, absolute paths and literal roots without expanding child
projects. A direct tinyglobby alias changes those semantics and is unsuitable.

Only Next's string root pattern with `onlyDirectories:true` is accepted. This is
not a general replacement for the complete fast-glob API. Re-review the actual
caller and controls when upgrading the Next plugin. The regression tests exercise
default, literal, slash/backslash, wildcard, brace, array and missing roots, real
internal-link lint rejection, valid Next Link, and exclusion of nested projects.
No lint rule, public fee/contact guard or application route is weakened.
