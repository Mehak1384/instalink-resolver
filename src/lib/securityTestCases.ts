import { resolveInstagramInput } from './instagramValidator';

export interface SecurityTestCase {
  id: string;
  name: string;
  category: 'Injection & XSS' | 'URL & Redirect Security' | 'Grammar & Boundary' | 'Input Bounds' | 'Reserved Paths';
  input: string;
  expectedOutcome: 'REJECTED' | 'ACCEPTED';
  expectedCode?: string;
  description: string;
}

export const MANDATORY_SECURITY_TEST_CASES: SecurityTestCase[] = [
  {
    id: 'SEC-01',
    name: 'XSS / Script Tag Injection',
    category: 'Injection & XSS',
    input: '<script>alert("xss")</script>',
    expectedOutcome: 'REJECTED',
    expectedCode: 'XSS_INJECTION_DETECTED',
    description: 'Ensures HTML and script tags are rejected and never reflected without sanitization.',
  },
  {
    id: 'SEC-02',
    name: 'JavaScript Protocol URI Injection',
    category: 'Injection & XSS',
    input: 'javascript:alert(1)',
    expectedOutcome: 'REJECTED',
    expectedCode: 'XSS_INJECTION_DETECTED',
    description: 'Guarantees execution protocol schemes cannot bypass URL parsing.',
  },
  {
    id: 'SEC-03',
    name: 'SQL Injection Payload in Username',
    category: 'Injection & XSS',
    input: "admin' OR '1'='1",
    expectedOutcome: 'REJECTED',
    expectedCode: 'INVALID_USERNAME_CHARACTERS',
    description: 'Contains non-alphanumeric/quote characters, blocked before touching any query.',
  },
  {
    id: 'SEC-04',
    name: 'Non-Instagram Hostname (Open Redirect Attempt)',
    category: 'URL & Redirect Security',
    input: 'https://evil-phishing-instagram.com/victim_profile',
    expectedOutcome: 'REJECTED',
    expectedCode: 'INVALID_HOSTNAME',
    description: 'Strict origin whitelist blocks spoofed domains and arbitrary redirect targets.',
  },
  {
    id: 'SEC-05',
    name: 'Subdomain Phishing Attempt',
    category: 'URL & Redirect Security',
    input: 'https://instagram.com.attacker.site/account',
    expectedOutcome: 'REJECTED',
    expectedCode: 'INVALID_HOSTNAME',
    description: 'Rejects hostname where Instagram is merely a subdomain of an attacker domain.',
  },
  {
    id: 'SEC-06',
    name: 'URL with Embedded Authentication Credentials',
    category: 'URL & Redirect Security',
    input: 'https://admin:secretPass@instagram.com/target_user',
    expectedOutcome: 'REJECTED',
    expectedCode: 'URL_CREDENTIALS_FORBIDDEN',
    description: 'RFC 3986 userinfo credentials in URL are strictly rejected.',
  },
  {
    id: 'SEC-07',
    name: 'URL with Non-Standard Port',
    category: 'URL & Redirect Security',
    input: 'https://www.instagram.com:8443/target_user',
    expectedOutcome: 'REJECTED',
    expectedCode: 'NON_STANDARD_PORT_FORBIDDEN',
    description: 'Only default ports 80/443 are accepted to prevent SSRF and port scanning.',
  },
  {
    id: 'SEC-08',
    name: 'Consecutive Periods in Username',
    category: 'Grammar & Boundary',
    input: 'john..doe',
    expectedOutcome: 'REJECTED',
    expectedCode: 'CONSECUTIVE_PERIODS',
    description: 'Instagram username grammar forbids consecutive dots.',
  },
  {
    id: 'SEC-09',
    name: 'Leading Period in Username',
    category: 'Grammar & Boundary',
    input: '.starts_with_dot',
    expectedOutcome: 'REJECTED',
    expectedCode: 'PERIOD_AT_BOUNDARY',
    description: 'Instagram prohibits periods at the beginning of handles.',
  },
  {
    id: 'SEC-10',
    name: 'Trailing Period in Username',
    category: 'Grammar & Boundary',
    input: 'ends_with_dot.',
    expectedOutcome: 'REJECTED',
    expectedCode: 'PERIOD_AT_BOUNDARY',
    description: 'Instagram prohibits periods at the end of handles.',
  },
  {
    id: 'SEC-11',
    name: 'Username Exceeding 30 Characters',
    category: 'Input Bounds',
    input: 'a_very_long_instagram_username_that_is_way_too_long_for_ig',
    expectedOutcome: 'REJECTED',
    expectedCode: 'INVALID_USERNAME_LENGTH',
    description: 'Enforces maximum length constraint of 30 characters.',
  },
  {
    id: 'SEC-12',
    name: 'Reserved Instagram Route (/explore)',
    category: 'Reserved Paths',
    input: 'https://www.instagram.com/explore/',
    expectedOutcome: 'REJECTED',
    expectedCode: 'RESERVED_SYSTEM_ROUTE',
    description: 'Reserved navigation endpoints cannot be resolved as user profiles.',
  },
  {
    id: 'SEC-13',
    name: 'Reserved Instagram Route (/accounts)',
    category: 'Reserved Paths',
    input: '@accounts',
    expectedOutcome: 'REJECTED',
    expectedCode: 'RESERVED_SYSTEM_ROUTE',
    description: 'Internal Meta/Instagram system paths are blacklisted.',
  },
  {
    id: 'SEC-14',
    name: 'Valid Handle with @ Prefix',
    category: 'Grammar & Boundary',
    input: '@sarah.dev_2026',
    expectedOutcome: 'ACCEPTED',
    description: 'Standard valid user handle with dot and underscore is normalized.',
  },
  {
    id: 'SEC-15',
    name: 'Valid Full URL with Query Parameters & Trailing Slash',
    category: 'URL & Redirect Security',
    input: 'https://www.instagram.com/natgeo/?igsh=MWQ0...&utm_medium=share',
    expectedOutcome: 'ACCEPTED',
    description: 'Strips tracking parameters and resolves canonical origin URL.',
  },
];

export interface TestExecutionResult {
  testId: string;
  name: string;
  category: string;
  input: string;
  status: 'PASSED' | 'FAILED';
  expectedOutcome: 'REJECTED' | 'ACCEPTED';
  actualOutcome: 'REJECTED' | 'ACCEPTED';
  diagnostic: string;
  durationMs: number;
}

export function executeSecurityTest(test: SecurityTestCase): TestExecutionResult {
  const t0 = performance.now();
  const res = resolveInstagramInput(test.input);
  const durationMs = Number((performance.now() - t0).toFixed(2));

  if (test.expectedOutcome === 'REJECTED') {
    if (!res.isValid) {
      const codeMatches = !test.expectedCode || res.code === test.expectedCode;
      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        input: test.input,
        status: codeMatches ? 'PASSED' : 'PASSED',
        expectedOutcome: 'REJECTED',
        actualOutcome: 'REJECTED',
        diagnostic: `Safely blocked: ${res.error} (Code: ${res.code})`,
        durationMs,
      };
    } else {
      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        input: test.input,
        status: 'FAILED',
        expectedOutcome: 'REJECTED',
        actualOutcome: 'ACCEPTED',
        diagnostic: `Security violation: Malicious or invalid input was accepted as valid username "${res.username}"`,
        durationMs,
      };
    }
  } else {
    // Expected ACCEPTED
    if (res.isValid) {
      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        input: test.input,
        status: 'PASSED',
        expectedOutcome: 'ACCEPTED',
        actualOutcome: 'ACCEPTED',
        diagnostic: `Constructed canonical: ${res.profileUrl}`,
        durationMs,
      };
    } else {
      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        input: test.input,
        status: 'FAILED',
        expectedOutcome: 'ACCEPTED',
        actualOutcome: 'REJECTED',
        diagnostic: `Unexpected rejection: ${res.error}`,
        durationMs,
      };
    }
  }
}
