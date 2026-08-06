# Security Policy

## Reporting Vulnerabilities

PT Daya Berkah Sentosa Nusantara (DBSN) takes the security of our digital ecosystem seriously. If you discover a security vulnerability within this repository or associated domains (`dayaberkah.id`, `*.dayaberkah.id`), please report it responsibly.

### How to Report

- **Email**: Send your security report to `[Gunakan kontak keamanan perusahaan]`.
- **Encryption**: If sending sensitive details, please use our GPG public key `[Gunakan kunci GPG perusahaan]`.
- **Response SLA**: The security team will acknowledge receipt of your vulnerability report within **48 hours** and provide an initial assessment within **5 business days**.

Please **DO NOT** open public GitHub issues or publicly disclose vulnerabilities before they have been addressed by our engineering team.

---

## Secrets & Credential Management

- **Local Development**: Keep secret keys strictly in `.env.local` or `.dev.vars` (both ignored by git). Never commit raw passwords, database strings, or API tokens to source control.
- **Production Environment**: Secrets MUST be managed via Cloudflare Pages Encrypted Environment Variables or Wrangler CLI:
  ```bash
  npx wrangler pages secret put DATABASE_URL
  npx wrangler pages secret put NEXTAUTH_SECRET
  ```

---

## Infrastructure Security & WAF

- All edge routing is protected by **Cloudflare WAF** and DDoS mitigation.
- Database access is managed via Neon Postgres Serverless Edge Driver with mandatory SSL (`sslmode=require`).
