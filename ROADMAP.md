# Security Roadmap — 14 Principles

> This is a project-specific checklist combining classical security engineering principles with modern practices; it is not an official standardized list of 14.

**Assessment:** static code review only; items are not security certifications.

## Implementation checklist

### 01. Least Privilege

**Status:** Pending  
**Current evidence:** Chunk access is restricted by roles; API-level permissions are not generated.

**Tasks**

- [ ] Introduce resource/action permissions beyond route roles
- [ ] Enforce permissions in business APIs
- [ ] Test least-privilege role matrices
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 02. Fail-Safe Defaults

**Status:** Pending  
**Current evidence:** Unknown chunks and unauthorized roles are denied; some DSL edge cases need rejection.

**Tasks**

- [ ] Reject protected routes with zero allowed roles
- [ ] Fail builds on every semantic or missing-module error
- [ ] Test unknown profiles and missing policies
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 03. Defense in Depth

**Status:** Pending  
**Current evidence:** JWT verification and RBAC protect delivery; application APIs require separate protection.

**Tasks**

- [ ] Integrate API authorization adapters
- [ ] Add CSP/security-header guidance and tests
- [ ] Add abuse prevention and security monitoring
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 04. Complete Mediation

**Status:** Pending  
**Current evidence:** The generated chunk endpoint verifies access per request.

**Tasks**

- [ ] Verify every sensitive API operation independently
- [ ] Audit static hosting paths and CDN exposure
- [ ] Set private/no-store caching for protected responses
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 05. Separation of Duties

**Status:** Pending  
**Current evidence:** No explicit separation-of-duties policy is represented in the current DSL.

**Tasks**

- [ ] Define conflicting-role constraints where relevant
- [ ] Require review of high-risk policy changes
- [ ] Test prohibited role combinations
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 06. Open Design

**Status:** Pending  
**Current evidence:** The DSL compiler and generated server are inspectable.

**Tasks**

- [ ] Publish a threat model and security boundaries
- [ ] Document DSL semantics and trust assumptions
- [ ] Publish reproducible attack/defense examples
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 07. Economy of Mechanism

**Status:** Pending  
**Current evidence:** CLI, compiler and runtime are separated; dynamic module loading adds complexity.

**Tasks**

- [ ] Simplify Blob URL and React global integration
- [ ] Use one validated compilation pipeline
- [ ] Remove duplicated authorization paths
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 08. Least Common Mechanism

**Status:** Pending  
**Current evidence:** Isolation between tenants or application contexts is not explicitly implemented.

**Tasks**

- [ ] Scope policy and cache state per application/tenant if needed
- [ ] Avoid shared mutable authentication state
- [ ] Document cross-origin and cross-tenant boundaries
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 09. Psychological Acceptability

**Status:** Pending  
**Current evidence:** The DSL and CLI reduce manual configuration.

**Tasks**

- [ ] Report diagnostics with file/line/column
- [ ] Add a doctor command for integration checks
- [ ] Publish minimal quickstarts and examples
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 10. Zero Trust

**Status:** Pending  
**Current evidence:** JWT is verified server-side before chunk delivery.

**Tasks**

- [ ] Validate issuer/audience for configured identity providers
- [ ] Never trust client-provided role lists for server decisions
- [ ] Define token expiry, revocation and rotation strategy
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 11. Secure by Design

**Status:** Pending  
**Current evidence:** Semantic analysis checks duplicate routes, roles and chunks.

**Tasks**

- [ ] Create STRIDE threat model
- [ ] Add parser fuzzing and property-based tests
- [ ] Run security tests in CI
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 12. Secure by Default

**Status:** Pending  
**Current evidence:** JWT_SECRET and CORS_ORIGIN are required and JWT verification restricts HS256.

**Tasks**

- [ ] Set secure cache and content-type headers by default
- [ ] Validate issuer/audience when an IdP is configured
- [ ] Set restrictive request limits and production defaults
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 13. Accountability

**Status:** Pending  
**Current evidence:** Structured authorization decision auditing is not evident in the generated backend.

**Tasks**

- [ ] Log allow/deny decisions with request correlation IDs
- [ ] Redact tokens and personal data
- [ ] Test audit completeness and retention policy
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

### 14. Resilience

**Status:** Pending  
**Current evidence:** Basic error handling exists; async loading and recovery need stronger guarantees.

**Tasks**

- [ ] Cancel stale chunk requests on logout/route changes
- [ ] Test network failures and expired sessions
- [ ] Add deterministic build and recovery tests
- [ ] Verify with automated tests and documented evidence

**Acceptance:** All applicable tasks are implemented, negative tests pass, and evidence is linked in the PR.

## Research validation

- [ ] Compare baseline React delivery against protected delivery
- [ ] Measure authorization bypass attempts and false accepts
- [ ] Measure chunk loading latency, size and memory overhead
- [ ] Publish threat model, limitations and reproducible results
