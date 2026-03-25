# Security Checklist for Developers

Quick reference guide for maintaining security in TIER Golf platform.

---

## Before Every Commit ✅

### Frontend Security

- [ ] No `dangerouslySetInnerHTML` usage (use React's safe rendering)
- [ ] No hardcoded API keys or secrets
- [ ] User input is validated before sending to API
- [ ] Sensitive data not logged to console
- [ ] No inline event handlers with user data (`onClick={eval(...)}`)

### Backend Security

- [ ] All routes have authentication middleware
- [ ] Authorization checks for role-based access
- [ ] Input validation schema defined for all endpoints
- [ ] No raw SQL queries (use Prisma ORM)
- [ ] Secrets stored in environment variables (never committed)
- [ ] Error messages don't expose sensitive information

---

## API Development Checklist

### Creating New Endpoint

```typescript
// 1. Define validation schema
export const createResourceSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      // ... more fields
    },
    required: ['name']
  }
};

// 2. Add authentication
app.post('/resources',
  {
    preHandler: [app.authenticate, authorize('admin', 'coach')],
    schema: createResourceSchema
  },
  async (request, reply) => {
    // ... handler logic
  }
);

// 3. Add rate limiting for write operations
import { writeRateLimit } from '../plugins/rate-limit';

app.post('/resources',
  {
    ...writeRateLimit(),  // Add this
    preHandler: [app.authenticate, authorize('admin', 'coach')],
    schema: createResourceSchema
  },
  async (request, reply) => {
    // ... handler logic
  }
);
```

---

## Authentication Patterns

### ✅ Correct

```typescript
// Backend: Always verify JWT
preHandler: [app.authenticate, authorize('player')]

// Frontend: Include token in headers
headers: {
  'Authorization': `Bearer ${token}`
}

// Frontend: Handle token expiry
catch (error) {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    logout();
  }
}
```

### ❌ Incorrect

```typescript
// ❌ Never trust client-side role
if (user.role === 'admin') {
  // Do admin action - this can be faked!
}

// ❌ Never send token in URL
fetch(`/api/data?token=${token}`)  // Logs in server logs!

// ❌ Never store sensitive data in localStorage without encryption
localStorage.setItem('creditCard', cardNumber);
```

---

## Input Validation Patterns

### ✅ Correct

```typescript
// Backend: Validate all inputs
const schema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      age: { type: 'integer', minimum: 0, maximum: 150 },
      role: { type: 'string', enum: ['player', 'coach'] }
    },
    required: ['email']
  }
};

// Frontend: Validate before sending
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(formData.email)) {
  setError('Invalid email address');
  return;
}
```

### ❌ Incorrect

```typescript
// ❌ Never trust client input on server
app.post('/users', async (request) => {
  const { email, role } = request.body;
  // What if role is 'admin'? No validation!
  await createUser({ email, role });
});

// ❌ Never use user input in queries without validation
const query = `SELECT * FROM users WHERE name = '${userName}'`;
// SQL injection vulnerability!
```

---

## XSS Prevention

### ✅ Correct

```tsx
// React automatically escapes
<div>{userInput}</div>

// Sanitize HTML if needed
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);
<div dangerouslySetInnerHTML={{ __html: clean }} />

// Use CSP headers (already configured in Helmet)
```

### ❌ Incorrect

```tsx
// ❌ Never render raw HTML from users
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ Never use eval with user data
eval(userInput);

// ❌ Never create script tags dynamically
const script = document.createElement('script');
script.src = userInput;  // XSS if user controls this!
```

---

## Secure Data Storage

### ✅ Correct

```typescript
// Tokens (current implementation)
localStorage.setItem('accessToken', token);  // OK for short-lived tokens

// Preferred: Use httpOnly cookies (future improvement)
// Backend sets cookie automatically, not accessible to JavaScript

// Non-sensitive preferences
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');
```

### ❌ Incorrect

```typescript
// ❌ Never store sensitive data unencrypted
localStorage.setItem('password', password);
localStorage.setItem('creditCard', cardNumber);
localStorage.setItem('ssn', socialSecurity);

// ❌ Never store long-lived tokens
localStorage.setItem('apiKey', 'permanent-key-123');
```

---

## Rate Limiting

### When to Apply

| Endpoint Type | Rate Limit | Usage |
|--------------|------------|-------|
| Auth (login, register) | 50/min | `authRateLimit()` |
| Write operations | 30/min | `writeRateLimit()` |
| Search/query | 50/min | `searchRateLimit()` |
| Reports/exports | 10/min | `heavyRateLimit()` |
| General API | 1000/min | Default |

### Example

```typescript
import { authRateLimit, writeRateLimit } from '../plugins/rate-limit';

// Login endpoint
app.post('/auth/login',
  {
    ...authRateLimit(),  // 50 req/min
    schema: loginSchema
  },
  loginHandler
);

// Create goal
app.post('/goals',
  {
    ...writeRateLimit(),  // 30 req/min
    preHandler: [app.authenticate],
    schema: createGoalSchema
  },
  createGoalHandler
);
```

---

## Error Handling

### ✅ Correct

```typescript
// Generic error messages for security
catch (error) {
  if (error.code === 'P2002') {
    // Prisma unique constraint
    throw conflictError('Resource already exists');
  }
  throw badRequestError('Invalid request');
}

// Log details server-side only
app.log.error({ err: error, userId: request.user.id }, 'Create goal failed');
```

### ❌ Incorrect

```typescript
// ❌ Never expose stack traces to users
catch (error) {
  return reply.status(500).send({
    error: error.stack  // Exposes file paths, versions!
  });
}

// ❌ Never expose database details
catch (error) {
  return reply.send({
    error: 'Duplicate key in users.email_unique_idx'  // DB schema exposed!
  });
}
```

---

## CORS Configuration

### ✅ Correct

```typescript
// Whitelist specific origins
origin: [
  'https://tiergolf.com',
  'https://app.tiergolf.com',
  process.env.FRONTEND_URL
]

// Development: Localhost only
origin: ['http://localhost:3000', 'http://localhost:3001']
```

### ❌ Incorrect

```typescript
// ❌ Never allow all origins in production
origin: '*'

// ❌ Never allow credentials with wildcard
origin: '*',
credentials: true  // Security risk!
```

---

## File Upload Security

### ✅ Correct

```typescript
// Limit file size
limits: {
  fileSize: 10 * 1024 * 1024  // 10MB
}

// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.mimetype)) {
  throw badRequestError('Invalid file type');
}

// Generate unique filenames
const filename = `${uuid()}-${sanitize(file.filename)}`;
```

### ❌ Incorrect

```typescript
// ❌ Never trust client file type
const ext = file.filename.split('.').pop();  // Can be faked!
if (ext === 'jpg') { /* ... */ }

// ❌ Never use original filename directly
const path = `/uploads/${file.filename}`;  // Path traversal risk!
await fs.writeFile(path, file.data);

// ❌ Never allow unlimited file size
// Missing limits config - file bomb attack possible!
```

---

## Dependency Security

### Regular Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Review and update
npm outdated
```

### Safe Dependency Management

```bash
# ✅ Use exact versions for critical packages
"@fastify/helmet": "10.1.0"  # Not "^10.1.0"

# ✅ Review before updating
npm update --dry-run

# ❌ Never ignore audit warnings in production
npm audit --production
```

---

## Environment Variables

### ✅ Correct

```typescript
// Backend: Load from environment
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}

// Frontend: Use REACT_APP_ prefix
const apiUrl = process.env.REACT_APP_API_URL;
```

### ❌ Incorrect

```typescript
// ❌ Never commit secrets
const apiKey = 'sk-1234567890abcdef';  // In source code!

// ❌ Never use default secrets in production
const secret = process.env.JWT_SECRET || 'default-secret';

// ❌ Never expose backend secrets to frontend
// Backend .env
DATABASE_URL=postgres://...  // Must stay on server!
```

---

## Security Testing Commands

```bash
# Frontend security audit
cd apps/web
npm audit --audit-level=high

# Backend security audit
cd apps/api
npm audit --audit-level=high

# Check for known vulnerabilities
npx snyk test

# Scan for secrets in commits
git secrets --scan

# Check for outdated dependencies
npm outdated
```

---

## Common Security Mistakes

### 1. Authorization Bypass

```typescript
// ❌ Wrong: Client-side only check
if (user.role === 'admin') {
  <AdminPanel />
}

// ✅ Correct: Server-side enforcement
app.get('/admin/users',
  { preHandler: [app.authenticate, requireAdmin] },
  getUsers
);
```

### 2. Mass Assignment

```typescript
// ❌ Wrong: Trust all input fields
await prisma.user.create({ data: request.body });
// What if body contains { role: 'admin' }?

// ✅ Correct: Whitelist allowed fields
const { name, email } = request.body;
await prisma.user.create({ data: { name, email, role: 'player' } });
```

### 3. Timing Attacks

```typescript
// ❌ Wrong: Early return reveals info
if (user.email !== inputEmail) {
  return 'Invalid credentials';
}
if (user.password !== inputPassword) {
  return 'Invalid credentials';
}

// ✅ Correct: Always check both
const validEmail = user.email === inputEmail;
const validPassword = await compare(inputPassword, user.password);
if (!validEmail || !validPassword) {
  return 'Invalid credentials';
}
```

---

## Security Incident Response

### If You Discover a Vulnerability

1. **Don't panic** - Most issues can be fixed quickly
2. **Don't commit the fix yet** - Coordinate with team
3. **Document the issue** - What, where, how severe
4. **Notify the team** - Security Slack channel
5. **Create a patch** - Fix the vulnerability
6. **Test thoroughly** - Ensure fix doesn't break anything
7. **Deploy immediately** - Don't wait for next release
8. **Post-mortem** - How did this happen? How to prevent?

### If You Receive a Security Report

1. **Acknowledge receipt** within 24 hours
2. **Assess severity** (Critical, High, Medium, Low)
3. **Verify the report** - Can you reproduce?
4. **Create a fix** - Follow secure coding practices
5. **Test the fix** - Don't introduce new vulnerabilities
6. **Deploy quickly** - Security fixes are top priority
7. **Thank the reporter** - Responsible disclosure is valuable

---

## Quick Reference: Security Headers

Our Helmet configuration provides:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | `default-src 'self'` | Prevent XSS |
| Strict-Transport-Security | `max-age=31536000` | Force HTTPS |
| X-Frame-Options | `DENY` | Prevent clickjacking |
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| X-XSS-Protection | `1; mode=block` | Legacy XSS protection |
| Referrer-Policy | `strict-origin-when-cross-origin` | Limit referrer info |

---

## Resources

### Internal Documentation
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [API Error Handling](./API_ERROR_HANDLING.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Fastify Security Best Practices](https://www.fastify.io/docs/latest/Reference/Security/)
- [React Security Best Practices](https://react.dev/learn/security)

---

**Remember:** Security is everyone's responsibility. When in doubt, ask the team!

**Last Updated:** 2026-01-12
