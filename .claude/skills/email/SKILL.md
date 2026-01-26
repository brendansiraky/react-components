---
name: email
description: This skill should be used when the user asks to "create an email template", "add a welcome email", "send password reset email", "build verification email", "add organization invitation email", "work with @bob/email", "send transactional email via Postmark", "render React Email", "configure Postmark", "email styling", "EmailLayout component", "EmailButton component", or needs guidance on email template structure, sending functions, or email styling patterns.
---

# Email

This skill provides conventions for the `@bob/email` package and email sending implementation in the API layer.

## Quick Reference

### File Locations
- **Templates**: `packages/email/src/components/[type]-email.tsx`
- **Sending functions**: `apps/api/src/email/send-[type]-email.ts`
- **Re-exports**: `packages/email/src/index.tsx`

### Key Technologies
- **Templating**: React Email (`@react-email/components`)
- **Delivery**: Postmark API
- **Rendering**: `@react-email/render`

### Essential Rules
1. Use inline styles only (no external stylesheets)
2. Always include `<Preview>` text for email client previews
3. Define TypeScript interfaces for all template props
4. Log all email operations with `@bob/utils` logger (never console.log)
5. Export render functions from `packages/email/src/index.tsx`
6. Use reusable components: `EmailLayout`, `EmailButton`, `EmailFooter`

### Workflow

To create a new email:

1. Create template at `packages/email/src/components/[type]-email.tsx`
2. Export render function from `packages/email/src/index.tsx`
3. Create sending function at `apps/api/src/email/send-[type]-email.ts`
4. Test with React Email dev server (`cd packages/email && bun dev`)

## Additional Resources

### Reference Files

For detailed patterns, component reference, and code examples:
- **`references/conventions.md`** - Full email conventions including template structure, sending patterns, reusable components API, and best practices
