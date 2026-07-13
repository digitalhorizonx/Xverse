# Xverse V2 — Architecture

The approved plan for turning the V1 showroom into a maintainable content +
sales platform. Ground rules: the public experience is untouched until
Phase 5, no rewrites, smallest secure system.

## Decisions

| Concern | Decision | Rejected alternatives |
| --- | --- | --- |
| Persistence | **SQLite** (better-sqlite3, WAL) + **Drizzle ORM**, file on the `xverse-data` Docker volume | Postgres now (second service + ops burden, no current need); headless SaaS CMS (external dependency, fights the bilingual model) |
| Content model | Bilingual-first rows (`{en, ar}` fields) + zod-validated JSON `blocks` for rich structured payloads | Rigid fully-relational schema (unmaintainable for 20+ block shapes); EAV (unqueryable) |
| Media | Filesystem on the same volume + `sharp`, metadata in DB, behind a `StorageAdapter` | Blobs in DB (explicitly excluded); S3/R2 now (documented upgrade path via the adapter) |
| AuthN | Self-contained credentials: scrypt (node:crypto) password hashes, opaque session tokens (HMAC-hashed at rest), httpOnly/Secure/SameSite=Lax cookie, DB-backed rate limiting, Origin-check CSRF guard | External IdP (none exists at HorizonX to reuse); JWTs (revocation complexity for zero benefit at this scale) |
| AuthZ | `admin`/`editor`/`viewer` roles → permission sets, enforced **only server-side** via `requirePermission()` | Client-side gating (explicitly forbidden) |
| Migration | Idempotent seed from the V1 `data/*.ts` + AR dictionary, keyed by slug; automatic backup first | Manual content re-entry (explicitly forbidden) |
| Analytics | First-party anonymous events + `track()` adapter layer (GA4/Clarity pluggable) | Direct vendor coupling |
| Leads | Zod-validated API, honeypot + rate limits, DB storage, CSV export, `LeadSink` interface for future CRM | Fake CRM integration (explicitly forbidden) |

## Phases

1. **Foundations** *(this phase)* — DB + migrations at startup, auth core,
   `/admin/login`, protected placeholder dashboard, compose volume, env
   templates, backup runbook. No public-site changes.
2. **Admin shell** — navigation, dashboard, user management, audit-log viewer,
   admin design system (bilingual, RTL, light/dark, on V1 tokens).
3. **Content editing** — products/showcases/industries/tags CRUD, tabbed
   editor, draft → review → publish workflow, versioning + rollback,
   side-by-side AR/EN translation editing with completeness gates.
4. **Media library** — upload pipeline (MIME sniffing, size limits, sharp
   optimization + thumbnails), usage references, bilingual alt text.
5. **Migration + cutover** — seed DB from V1 files, public pages read the
   content service, preview URLs, byte-level regression on slugs/SEO.
6. **Leads + analytics** — capture forms, lead management, first-party
   analytics dashboard.
7. **Hardening** — security review, admin E2E suite, docs, production
   deploy + live verification.

## Security model (Phase 1 surface)

- Passwords: scrypt N=2¹⁵ r=8 p=1, per-hash parameters, 12-char minimum.
- Sessions: 32-byte random token in the cookie; DB stores
  HMAC-SHA256(token, SESSION_SECRET) → a leaked DB cannot mint sessions;
  7-day sliding expiry; revocable server-side; user deactivation kills
  access immediately.
- Login: one generic error (no account enumeration), rate limited per
  account (5 failures/15 min) and per IP hash (20/15 min), persisted across
  restarts; every attempt audited.
- CSRF: SameSite=Lax cookie + explicit Origin/Host assertion on all
  mutating admin requests.
- The security boundary is the API layer (`requirePermission` +
  `assertSameOrigin` in every mutating handler); the admin layout redirect
  is UX only.
- `/admin` and `/api` are `noindex` + robots-disallowed; audit log records
  logins, failures, rate-limit hits, logout, bootstrap.
