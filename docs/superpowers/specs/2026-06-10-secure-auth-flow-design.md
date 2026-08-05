# Design: Secure Subdomain Authentication Flow

## Purpose
Enhance the existing Next.js Middleware to provide robust, JWT-validated authentication and role-based access control (RBAC) across the Hub, Dashboard, and Spoke domains.

## Architecture
The system utilizes **NextAuth v5 (Auth.js)** for session management and a custom **Next.js Middleware** for subdomain routing.

### 1. Middleware Wrapper
We will replace the manual cookie check in `src/middleware.ts` with the `auth()` wrapper from `src/lib/auth/auth.config.ts`.

### 2. JWT Verification
The `auth()` wrapper automatically handles JWT verification using the `AUTH_SECRET`. This ensures that the session data available in `req.auth` is authentic and hasn't been tampered with.

### 3. Role-Based Access Control (RBAC)
The middleware will enforce the following access rules:
- **Dashboard Domain (`dashboard.*`)**:
    - Requires authentication.
    - `ADMIN` and `VIEWER` have full access.
    - `CLIENT` users must have an active session and a valid `linkedLeadId`.
- **Spoke Domains (`[spoke].*`)**:
    - Access rules can be defined per spoke if needed, but currently follows Hub/Dashboard routing.

### 4. Session Integrity
We will enforce role-based session durations as defined in the `jwt` callback:
- `CLIENT`: 24 hours.
- `ADMIN`/`VIEWER`: 8 hours.
The middleware will check the `issuedAt` claim if necessary, though Auth.js handles most of this.

## Data Flow
1. **Request**: User requests a URL.
2. **Auth Verification**: Middleware `auth()` checks for a valid session.
3. **Identity Check**: If authenticated, `req.auth.user` is populated with `id`, `role`, `email`, etc.
4. **Authorization**:
    - If unauthenticated and on a protected path (e.g., `/dashboard`), redirect to `/login`.
    - If authenticated but unauthorized (e.g., inactive user), redirect to `/login` with an error message.
5. **Routing**: Middleware performs subdomain rewriting based on the host header.

## Security Considerations
- **Edge Compatibility**: The `auth.config.ts` must avoid importing Prisma directly if used in middleware, as Prisma is not compatible with the Edge runtime. We may need to split the config.
- **CSRF**: NextAuth handles CSRF protection for API routes.
- **Cookie Security**: `httpOnly`, `Secure`, and `SameSite: Strict` flags are enabled.

## Success Criteria
- [ ] Manual cookie checking is removed from middleware.
- [ ] Requests to `/dashboard` without a valid JWT are redirected to `/login`.
- [ ] Authenticated users can access their respective subdomains.
- [ ] Inactive users are denied access.
- [ ] Middleware remains performant and Edge-compatible.
