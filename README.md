# InstaLink — Instagram Profile Link Finder & Secure Redirect Platform

[![Release Status](https://img.shields.io/badge/Release_Gate-18%2F18_Passed-emerald)](#release-readiness)
[![Security Audited](https://img.shields.io/badge/Defense_in_Depth-Verified-blue)](#security-and-threat-model)
[![Architecture](https://img.shields.io/badge/Architecture-Stateless_FastAPI%2FNode-purple)](#architecture)
[![License](https://img.shields.io/badge/License-Apache_2.0-slate)](#license)

InstaLink is a high-performance, security-first web application and API platform designed to normalize Instagram handles and profile URLs into canonical HTTPS links. It ensures strict origin locking, defense-in-depth sanitization, and explicit user-initiated redirection with zero persistent user tracking.

---

## 1. Executive Summary & Core Principles

- **Security by Design**: Defense-in-depth layers protect against Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), Host Spoofing, and Open Redirects.
- **Strict Origin Lock**: Canonical URLs strictly resolve to `https://www.instagram.com/<username>/`. Arbitrary redirect targets are blocked.
- **Privacy by Default**: No user accounts required; search queries are parsed transiently in-memory and discarded immediately after response transmission.
- **Stateless Horizontal Scaling**: The core resolution pipeline does not query a database, enabling near-instant p95 latency (<20ms in-memory) and infinite replica elasticity.
- **Truthful Verification**: Constructed links are clearly labeled as unverified. The platform does not hallucinate account existence or claim to bypass private account barriers.

---

## 2. Architecture & Request Pipeline

```
+-------------------------------------------------------------+
|                      Client Web Browser                     |
|            (React 19, TypeScript, Tailwind CSS v4)          |
+-------------------------------------------------------------+
                              |
                              | 1. POST /api/v1/resolve (JSON body <= 64KB)
                              v
+-------------------------------------------------------------+
|               Managed CDN / WAF / Edge Gateway              |
|        - TLS 1.3 Termination & Security Headers             |
|        - Request size limiting & Content-Type validation    |
+-------------------------------------------------------------+
                              |
                              | 2. Pass accepted payload
                              v
+-------------------------------------------------------------+
|               Distributed Rate Limiter                      |
|        - Sliding-window bucket (60 req/min per IP)          |
|        - Returns HTTP 429 + Retry-After on limit violation  |
+-------------------------------------------------------------+
                              |
                              | 3. Unblocked request
                              v
+-------------------------------------------------------------+
|           Stateless Normalization & Sanitizer Engine        |
|        - RFC URL Grammar parsing & whitelist check          |
|        - Instagram handle validation (1-30 chars, [a-z0-9_.])
|        - Rejection of reserved routes (/explore, /accounts) |
|        - URL tracking param stripping (?igsh=..., utm_*)    |
+-------------------------------------------------------------+
                              |
                              | 4. Return canonical URL payload
                              v
+-------------------------------------------------------------+
|                      Client Application                     |
|        - Render normalized handle & canonical HTTPS link    |
|        - One-click copy with animated feedback              |
|        - High-contrast SVG QR Code generation               |
|        - Explicit user action: "Open Profile on Instagram"  |
+-------------------------------------------------------------+
```

---

## 3. Supported Input Formats & Validation Rules

| Input Format | Sample Query | Normalized Output | Status |
| :--- | :--- | :--- | :--- |
| **Standard Handle** | `@sarah_dev` | `https://www.instagram.com/sarah_dev/` | Valid |
| **Raw Username** | `sarah.art_2026` | `https://www.instagram.com/sarah.art_2026/` | Valid |
| **Full Profile URL** | `https://www.instagram.com/natgeo/` | `https://www.instagram.com/natgeo/` | Valid |
| **Tracking Query URL**| `instagram.com/creator?igsh=abc` | `https://www.instagram.com/creator/` | Valid (Tracking stripped) |
| **Consecutive Periods** | `john..doe` | — | **422 Rejected** (Grammar violation) |
| **Boundary Dots** | `.username` or `username.` | — | **422 Rejected** (Period at boundary) |
| **Host Spoofing** | `https://evil-instagram.com/user` | — | **422 Rejected** (Invalid hostname) |
| **XSS Payload** | `<script>alert(1)</script>` | — | **422 Rejected** (Script injection detected) |
| **Reserved Routes** | `/explore`, `/accounts`, `/reels` | — | **422 Rejected** (Reserved system pathway) |

### Instagram Username Grammar Rules
- Length: 1 to 30 characters.
- Characters permitted: `a-z`, `0-9`, periods (`.`), underscores (`_`).
- Boundary constraint: Cannot begin or end with a period.
- Sequence constraint: Cannot contain consecutive periods (`..`).
- Blacklist: Reserved system routes are rejected as user profiles.

---

## 4. API Specification

### Endpoint: `POST /api/v1/resolve`
Resolves an untrusted query into a canonical Instagram profile link.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "query": "@natgeo"
}
```

#### Successful Response (`200 OK`)
```json
{
  "username": "natgeo",
  "profile_url": "https://www.instagram.com/natgeo/",
  "app_deep_link": "instagram://user?username=natgeo",
  "status": "link_constructed",
  "verified": false,
  "input_format": "at_prefixed"
}
```

#### Error Response (`422 Unprocessable Entity`)
```json
{
  "error": "Instagram usernames cannot contain consecutive periods.",
  "code": "CONSECUTIVE_PERIODS"
}
```

#### Error Response (`429 Too Many Requests`)
```json
{
  "error": "Too many requests. Please wait before trying again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after_seconds": 60
}
```

---

### Endpoint: `GET /health/live`
Confirms the process is alive.

```json
{
  "status": "alive",
  "timestamp": "2026-10-15T08:00:00.000Z"
}
```

---

### Endpoint: `GET /health/ready`
Reports process readiness and component health.

```json
{
  "status": "ready",
  "uptime_seconds": 3600,
  "checks": {
    "memory": "healthy",
    "rate_limiter": "healthy",
    "stateless_core": "healthy"
  }
}
```

---

### Endpoint: `GET /api/v1/metrics`
Exposes aggregated, privacy-conscious telemetry counters (zero PII stored).

```json
{
  "totalResolutions": 1420,
  "successfulLookups": 1390,
  "validationErrors": 28,
  "rateLimitHits": 2,
  "uptime_seconds": 3600,
  "active_rate_limit_clients": 12
}
```

---

## 5. Security & Threat Model

| Threat | Vulnerability Mechanism | InstaLink Defense Control |
| :--- | :--- | :--- |
| **Open Redirects** | Attackers craft phishing links redirecting to third-party domains. | The destination origin is strictly hardcoded to `https://www.instagram.com/`. Hostnames outside whitelist are blocked. |
| **XSS Injection** | Stored or reflected HTML / script tags executed in browser. | Strict regex matching `^[a-z0-9_.]+$`. Dangerous tags detected and rejected. |
| **SSRF** | Backend fetching user-provided URLs or internal ports. | No backend HTTP fetch is performed. The resolver only parses grammar. Non-standard ports (8443, etc.) are rejected. |
| **DDoS / Flooding** | Volumetric requests exhausting compute and memory. | Managed edge firewall + in-memory sliding-window rate limiting + 64KB max request body limit. |
| **Credential Sniffing** | URLs embedding `https://user:pass@instagram.com`. | RFC 3986 credentials in URL are explicitly detected and rejected (`URL_CREDENTIALS_FORBIDDEN`). |

---

## 6. Capacity Planning (PRD Section 14)

Illustrative benchmark workload:
- **Daily Active Users**: 1,000,000 DAU
- **Lookups Per User**: 10
- **Daily Volume**: 10,000,000 requests/day
- **Average Throughput**: ~116 requests/second
- **Peak Multiplier**: 10×
- **Peak Throughput**: ~1,160 requests/second
- **Replica Requirement**: ~3–5 stateless container instances with 1 vCPU and 512MB RAM each.

---

## 7. Release Readiness Checklist (18/18 Verified)

### Application
- [x] Frontend and backend test suites pass with zero failures.
- [x] Input validation and fixed-origin redirect verified.
- [x] Production error responses sanitized (no stack traces or secrets exposed).
- [x] WCAG 2.2 AA accessibility and browser compatibility checked.

### Security
- [x] TLS 1.3, WAF, and DDoS controls enabled.
- [x] Distributed rate limiting returning 429 verified.
- [x] Secrets stored outside source code in environment management.
- [x] Automated dependency vulnerability scanning clean.
- [x] Security review covering OWASP Top 10 completed.

### Infrastructure
- [x] Stateless resolver isolated; internal ports inaccessible from public internet.
- [x] Autoscaling triggers based on CPU utilization (>70%) and concurrent requests.
- [x] Metrics, health probes, and dashboards operational.
- [x] Deployment rollback and canary testing validated.
- [x] Stateless core verified to require no database backup; recovery in <60 seconds.

### Governance
- [x] Privacy notice affirming zero search history retention published.
- [x] Transient in-memory processing and deletion policies documented.
- [x] Security contact and abuse reporting channels established.
- [x] Release owner formal sign-off completed.

---

## 8. Getting Started & Local Development

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/example/instalink.git
cd instalink

# Install dependencies
npm install

# Start local full-stack server
npm run dev
```

The application will be live at `http://localhost:3000`.

### Production Build
```bash
# Compile client assets
npm run build

# Start production server
npm run start
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 9. Legal & Trademark Disclaimers

- InstaLink is an **independent developer utility** and is not affiliated with, authorized, maintained, sponsored, or endorsed by Instagram, Meta Platforms, Inc., or any of their affiliates or subsidiaries.
- Instagram and related marks and logos are trademarks of Meta Platforms, Inc.
- Constructing a canonical profile link does not guarantee or certify account existence.

---

## 10. License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
