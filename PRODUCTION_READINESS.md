# Production readiness

The governed API at `/api/governance` is the supported production-release path. It records tenant-scoped rights/assets, timeline/render evidence, review and version transitions, ticket reconciliation, publication/export receipts, an idempotent connector outbox, immutable attempts, bounded retries, usage evidence, and dead-letter state. It never publishes content or sells tickets automatically.

## Deployment sequence

1. Review and back up the database, then apply `backend/migrations/001_governed_theater_release.sql` as a separate controlled migration.
2. Copy `.env.example` to `.env`, replace placeholders, and configure a unique 32-plus-character JWT secret and explicit production CORS allowlist.
3. Migrate every legacy plaintext `users.password` value before login. The accepted format is `scrypt$<unique-salt>$<128-lowercase-hex-characters>` for a 64-byte Node.js scrypt result; rotate all demo credentials and verify migration in a non-production copy first. Unmigrated accounts fail closed.
4. Install locked dependencies explicitly. `start.sh` performs no installation, database setup, seeding, or unrelated process termination.
5. Provision memberships and reviewed connector workers for media/model, rights/assets, storage/CDN, transcription/translation, publishing, ticketing, and usage accounting.

Production rejects legacy provider routes, mock/demo flags, wildcard CORS, weak secrets, and startup schema mutation. Generated AI/ticketing-gap handlers are quarantined by default.

## Required external validation

Validate rights/licensing, consent, moderation, accessibility, watermark/disclosure, brand, multilingual, deterministic export, payment, and ticketing contracts with accountable owners. Exercise duplicate sales, provider outage, retry exhaustion, dead-letter recovery, rights revocation, and reconciliation. No content publication, ticket sale, provider execution, or rights determination was performed here.
