# Security policy

Stevo.AI advises other organizations on vulnerability handling, so this
repository and the `stevo.ai` site are held to the same standard.

## Reporting a vulnerability

Report privately. Please do not open a public issue for a security finding.

- **Preferred:** open a private advisory at
  [Security advisories](https://github.com/stevologic/stevo.ai/security/advisories/new).
- **Alternative:** use the contact route published at
  [stevo.ai/#contact](https://stevo.ai/#contact).

A machine-readable version of this policy is published at
[`/.well-known/security.txt`](https://stevo.ai/.well-known/security.txt) per
[RFC 9116](https://www.rfc-editor.org/rfc/rfc9116).

## What to expect

| Stage | Target |
| --- | --- |
| Acknowledgement of your report | 3 business days |
| Initial assessment and severity | 10 business days |
| Fix or documented decision not to fix | 90 days from acknowledgement |

You will be credited in the fix commit unless you ask not to be.

## Scope

In scope:

- The `stevo.ai` site and this repository's source
- The build, dependency, and GitHub Pages deployment path

Out of scope:

- Findings that require a compromised end-user device or browser
- Denial of service, volumetric testing, and automated scanner output with no
  demonstrated impact
- Missing hardening headers on static assets with no exploitable consequence
- Social engineering of any person

## Safe harbour

Good-faith research consistent with this policy is welcome. Do not access,
modify, or exfiltrate data that is not yours, do not degrade the service for
others, and give a reasonable window to remediate before public disclosure.
