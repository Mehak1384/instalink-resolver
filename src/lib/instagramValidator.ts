/**
 * Instagram Input Validator and Canonical Link Resolver
 *
 * Implements strict defense-in-depth normalization, sanitization,
 * and canonical URL construction in adherence with PRD specifications.
 */

export interface ValidationSuccess {
  isValid: true;
  username: string;
  profileUrl: string;
  appDeepLink: string;
  status: 'link_constructed';
  verified: false;
  inputFormat: 'raw_username' | 'at_prefixed' | 'full_url' | 'domain_path';
}

export interface ValidationError {
  isValid: false;
  error: string;
  code:
    | 'EMPTY_INPUT'
    | 'EXCEEDS_MAX_LENGTH'
    | 'XSS_INJECTION_DETECTED'
    | 'INVALID_SCHEME'
    | 'URL_CREDENTIALS_FORBIDDEN'
    | 'NON_STANDARD_PORT_FORBIDDEN'
    | 'INVALID_HOSTNAME'
    | 'RESERVED_SYSTEM_ROUTE'
    | 'INVALID_USERNAME_CHARACTERS'
    | 'INVALID_USERNAME_LENGTH'
    | 'PERIOD_AT_BOUNDARY'
    | 'CONSECUTIVE_PERIODS'
    | 'UNSUPPORTED_FORMAT';
  details?: string;
}

export type ValidationResult = ValidationSuccess | ValidationError;

// Reserved Instagram system pathways that are not valid single user profiles
export const RESERVED_INSTAGRAM_PATHS = new Set([
  'about',
  'accounts',
  'api',
  'archive',
  'blog',
  'business',
  'community',
  'creator',
  'developers',
  'developer',
  'directory',
  'direct',
  'download',
  'emails',
  'explore',
  'facebook',
  'graphql',
  'help',
  'legal',
  'lite',
  'login',
  'meta',
  'oauth',
  'p',
  'policies',
  'press',
  'privacy',
  'reel',
  'reels',
  'safety',
  'security',
  'session',
  'settings',
  'shop',
  'signup',
  'stories',
  'support',
  'tags',
  'terms',
  'threads',
  'tv',
]);

const ALLOWED_HOSTNAMES = new Set([
  'instagram.com',
  'www.instagram.com',
  'm.instagram.com',
  'help.instagram.com',
]);

const MAX_INPUT_LENGTH = 2048;

/**
 * Validates and normalizes raw username strings according to Instagram's documented rules:
 * - 1 to 30 characters
 * - Only alphanumeric characters, periods, and underscores
 * - Cannot start or end with a period
 * - Cannot contain consecutive periods (..)
 */
export function validateUsernameRules(rawCandidate: string): { valid: boolean; error?: string; code?: ValidationError['code'] } {
  const candidate = rawCandidate.toLowerCase().trim();

  if (!candidate) {
    return { valid: false, error: 'Username cannot be empty.', code: 'EMPTY_INPUT' };
  }

  if (candidate.length > 30) {
    return {
      valid: false,
      error: `Username exceeds maximum length of 30 characters (got ${candidate.length}).`,
      code: 'INVALID_USERNAME_LENGTH',
    };
  }

  if (candidate.startsWith('.') || candidate.endsWith('.')) {
    return {
      valid: false,
      error: 'Instagram usernames cannot begin or end with a period.',
      code: 'PERIOD_AT_BOUNDARY',
    };
  }

  if (candidate.includes('..')) {
    return {
      valid: false,
      error: 'Instagram usernames cannot contain consecutive periods.',
      code: 'CONSECUTIVE_PERIODS',
    };
  }

  // Strictly allow a-z, 0-9, underscore, and period
  const validCharRegex = /^[a-z0-9_.]+$/;
  if (!validCharRegex.test(candidate)) {
    return {
      valid: false,
      error: 'Username contains invalid characters. Only letters, numbers, underscores, and periods are permitted.',
      code: 'INVALID_USERNAME_CHARACTERS',
    };
  }

  if (RESERVED_INSTAGRAM_PATHS.has(candidate)) {
    return {
      valid: false,
      error: `"${candidate}" is a reserved Instagram system route, not a valid user profile.`,
      code: 'RESERVED_SYSTEM_ROUTE',
    };
  }

  return { valid: true };
}

/**
 * Main parser & resolver.
 * Handles:
 * - Direct usernames: `alice_smith`, `@alice_smith`
 * - Full URLs: `https://www.instagram.com/alice_smith/`
 * - Domain paths: `instagram.com/alice_smith?igsh=123`
 * - Security enforcement: checks for scheme, host spoofing, credentials, ports, XSS payloads.
 */
export function resolveInstagramInput(input: string): ValidationResult {
  if (typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Invalid input type. Expected a string.',
      code: 'UNSUPPORTED_FORMAT',
    };
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Enter an Instagram username or profile URL.',
      code: 'EMPTY_INPUT',
    };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      isValid: false,
      error: `Input exceeds maximum allowed size of ${MAX_INPUT_LENGTH} characters.`,
      code: 'EXCEEDS_MAX_LENGTH',
    };
  }

  // Detect script or HTML tag injection
  if (/<[a-z/][\s\S]*>/i.test(trimmed) || /javascript:/i.test(trimmed) || /data:/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Malformed input: HTML or script injection detected.',
      code: 'XSS_INJECTION_DETECTED',
    };
  }

  let extractedCandidate = '';
  let formatType: ValidationSuccess['inputFormat'] = 'raw_username';

  const isUrlLike =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('instagram.com') ||
    trimmed.startsWith('www.instagram.com') ||
    trimmed.startsWith('m.instagram.com');

  if (isUrlLike) {
    let urlToParse = trimmed;
    if (trimmed.startsWith('//')) {
      urlToParse = 'https:' + trimmed;
    } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      urlToParse = 'https://' + trimmed;
      formatType = 'domain_path';
    } else {
      formatType = 'full_url';
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlToParse);
    } catch {
      return {
        isValid: false,
        error: 'Unable to parse the provided URL. Ensure it is a valid web address.',
        code: 'UNSUPPORTED_FORMAT',
      };
    }

    // 1. Enforce HTTP / HTTPS scheme
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        isValid: false,
        error: `Unsupported URL scheme "${parsedUrl.protocol}". Only standard HTTPS URLs are permitted.`,
        code: 'INVALID_SCHEME',
      };
    }

    // 2. Reject credentials in URL (e.g. https://user:pass@...)
    if (parsedUrl.username || parsedUrl.password) {
      return {
        isValid: false,
        error: 'URLs containing embedded authentication credentials are strictly prohibited.',
        code: 'URL_CREDENTIALS_FORBIDDEN',
      };
    }

    // 3. Reject non-standard ports (must be default 80 or 443 or empty)
    if (parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443') {
      return {
        isValid: false,
        error: `Non-standard port "${parsedUrl.port}" rejected. Only default HTTP/HTTPS ports are accepted.`,
        code: 'NON_STANDARD_PORT_FORBIDDEN',
      };
    }

    // 4. Enforce strict destination hostname whitelist
    const hostname = parsedUrl.hostname.toLowerCase();
    if (!ALLOWED_HOSTNAMES.has(hostname)) {
      return {
        isValid: false,
        error: `Hostname "${hostname}" is not a recognized Instagram domain. Arbitrary redirects are blocked.`,
        code: 'INVALID_HOSTNAME',
      };
    }

    // 5. Extract path segments
    // Path looks like: /username/ or /username
    const segments = parsedUrl.pathname
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length === 0) {
      return {
        isValid: false,
        error: 'No username found in the Instagram URL path.',
        code: 'UNSUPPORTED_FORMAT',
      };
    }

    const firstSegment = segments[0];

    // Handle /p/xyz, /reel/xyz, /stories/xyz - reject if not a direct user profile
    if (RESERVED_INSTAGRAM_PATHS.has(firstSegment.toLowerCase())) {
      return {
        isValid: false,
        error: `The path "/${firstSegment}/" refers to a post or system page, not a direct user profile link.`,
        code: 'RESERVED_SYSTEM_ROUTE',
      };
    }

    extractedCandidate = firstSegment;
  } else {
    // Plain username or @username
    let cleaned = trimmed;
    if (cleaned.startsWith('@')) {
      cleaned = cleaned.slice(1).trim();
      formatType = 'at_prefixed';
    } else {
      formatType = 'raw_username';
    }

    // Remove any trailing slashes if user typed `username/`
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }

    extractedCandidate = cleaned;
  }

  // Validate the normalized candidate username against strict Instagram specifications
  const validation = validateUsernameRules(extractedCandidate);
  if (!validation.valid) {
    return {
      isValid: false,
      error: validation.error || 'Invalid username syntax.',
      code: validation.code || 'INVALID_USERNAME_CHARACTERS',
    };
  }

  const normalizedUsername = extractedCandidate.toLowerCase();
  const canonicalProfileUrl = `https://www.instagram.com/${normalizedUsername}/`;
  const mobileDeepLink = `instagram://user?username=${normalizedUsername}`;

  return {
    isValid: true,
    username: normalizedUsername,
    profileUrl: canonicalProfileUrl,
    appDeepLink: mobileDeepLink,
    status: 'link_constructed',
    verified: false,
    inputFormat: formatType,
  };
}
