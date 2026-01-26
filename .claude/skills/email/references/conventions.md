# Email Conventions

## Overview
The email package provides React Email templates for transactional emails. Templates are built using React Email components and sent via Postmark API from the backend.

## Directory Structure
```
packages/email/
├── src/
│   ├── components/           # React Email templates & reusable components
│   │   ├── index.ts          # Component re-exports
│   │   ├── shared-styles.ts  # Centralized styles and colors
│   │   ├── email-layout.tsx  # Common layout wrapper
│   │   ├── email-button.tsx  # Button with variants
│   │   ├── email-footer.tsx  # Standard footer
│   │   ├── alert-box.tsx     # InfoBox, WarningBox, AlertText
│   │   └── [type]-email.tsx  # Individual email templates
│   └── index.tsx             # Public API exports (render functions)
└── package.json
```

## Reusable Components

### EmailLayout
Common layout wrapper with consistent structure:

```typescript
import { EmailLayout } from './components'

<EmailLayout
  preview="Preview text for email clients"
  title="Email Title"
  titleColor="primary"  // 'primary' | 'danger' | 'default' | 'black'
>
  {/* Email content */}
</EmailLayout>
```

### EmailButton
Styled button with variant support:

```typescript
import { EmailButton } from './components'

<EmailButton href={actionUrl} variant="primary">
  Click Here
</EmailButton>

// Variants: 'primary' (blue), 'danger' (red), 'default' (gray), 'black'
```

### EmailFooter
Standard footer with fallback URL for button issues:

```typescript
import { EmailFooter } from './components'

<EmailFooter
  actionText="Click Here"  // Button text to reference
  fallbackUrl={actionUrl}  // URL to display as fallback
/>
```

### Alert Components
For informational and warning sections:

```typescript
import { InfoBox, WarningBox, AlertText } from './components'

// Info box (gray background)
<InfoBox>
  <AlertText variant="info">Important information here</AlertText>
</InfoBox>

// Warning box (red background)
<WarningBox>
  <AlertText variant="warning">Warning message here</AlertText>
</WarningBox>
```

### Shared Styles
Centralized styles for consistent typography and layout:

```typescript
import { styles, colors } from './components'

// Available styles
styles.main        // Main body style
styles.container   // Container style
styles.text        // Standard text
styles.h1          // Heading style
styles.button      // Button base style
styles.hr          // Horizontal rule
styles.footerText  // Footer text
styles.link        // Link style
styles.infoBox     // Info box container
styles.warningBox  // Warning box container
styles.infoText    // Info text
styles.warningText // Warning text
styles.noteText    // Note/italic text

// Available colors
colors.primary  // #2563eb (blue)
colors.danger   // #dc2626 (red)
colors.default  // #333 (dark gray)
colors.black    // #000
```

## Email Template Pattern

### File Naming Convention
- **Pattern**: `[type]-email.tsx` or descriptive name like `forgot-password-link.tsx`
- **Examples**:
  - `email-verification.tsx`
  - `organization-invitation.tsx`
  - `forgot-password-link.tsx`
  - `delete-account-verification.tsx`

### Template Structure
Templates export both a default component and a render function:

```typescript
import { render } from '@react-email/components'
import { EmailButton, EmailFooter, EmailLayout, styles, Text } from './components'

interface MyEmailProps {
  recipientName: string
  actionUrl: string
}

export default function MyEmail({ recipientName, actionUrl }: MyEmailProps) {
  return (
    <EmailLayout preview="Preview text here" title="Email Title">
      <Text style={styles.text}>Hello {recipientName},</Text>
      <Text style={styles.text}>Your email content here.</Text>
      <EmailButton href={actionUrl} variant="primary">
        Call to Action
      </EmailButton>
      <EmailFooter actionText="Call to Action" fallbackUrl={actionUrl} />
    </EmailLayout>
  )
}

// Render function - this is what sending functions import
export function renderMyEmail(props: MyEmailProps): Promise<string> {
  return render(<MyEmail {...props} />)
}
```

### Alternative: Full Control Template
For custom layouts without EmailLayout wrapper:

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  render,
  Section,
  Text,
} from '@react-email/components'
import type { CSSProperties } from 'react'

interface CustomEmailProps {
  name: string
}

export default function CustomEmail({ name }: CustomEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Custom preview text</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Custom Title</Heading>
          <Section>
            <Text style={text}>Hello {name}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Inline styles with CSSProperties type
const main: CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}
// ... other styles

export function renderCustomEmail(props: CustomEmailProps): Promise<string> {
  return render(<CustomEmail {...props} />)
}
```

## Email Sending Implementation

### Location
Email sending functions are in the API layer at `apps/api/src/email/`

### File Naming Convention
- **Pattern**: `send-[type]-email.ts`
- **Examples**:
  - `send-email-verification-email.ts`
  - `send-organization-invitation-email.ts`
  - `send-password-reset-email.ts`

### Implementation Pattern
```typescript
// apps/api/src/email/send-[type]-email.ts
import { ServerClient } from 'postmark'
import { renderMyEmail } from '@bob/email'
import { logger } from '@bob/utils'
import { env } from '~/env'

const postmarkClient = new ServerClient(env.POSTMARK_SERVER_TOKEN)

interface SendMyEmailOptions {
  email: string
  recipientName: string
  actionUrl: string
}

export async function sendMyEmail({
  email,
  recipientName,
  actionUrl,
}: SendMyEmailOptions) {
  const emailHtml = await renderMyEmail({ recipientName, actionUrl })

  logger.info(`Sending my-email to ${email}`)

  const result = await postmarkClient.sendEmail({
    From: env.FROM_EMAIL,
    To: email,
    Subject: 'Your Email Subject',
    HtmlBody: emailHtml,
  })

  return result
}
```

## Re-exports (index.tsx)
Export render functions from the package index:

```typescript
// packages/email/src/index.tsx
export { renderEmailVerificationEmail } from './components/email-verification'
export { renderOrganizationInvitationEmail } from './components/organization-invitation'
export { renderForgotPasswordEmail } from './components/forgot-password-link'
// ... other render functions
```

## Testing

### Local Development
Use React Email's development server to preview templates:
```bash
cd packages/email
bun dev
```

### Testing Checklist
- Preview in React Email dev server
- Verify dynamic content rendering
- Test with various prop combinations
- Check responsive design
- Validate links and buttons
- Review in multiple email clients

## Best Practices

### Template Design
- **Use reusable components** - EmailLayout, EmailButton, EmailFooter
- **Use shared styles** - import from `shared-styles.ts`
- **Keep templates simple** - focus on content over complex layouts
- **Include preview text** - helps with email client previews
- **Provide fallback URLs** - use EmailFooter for button fallbacks

### Content Guidelines
- **Clear subject lines** - describe the email purpose
- **Personalization** - use recipient name when available
- **Single call-to-action** - focus on one primary action
- **Mobile-friendly** - design for mobile-first reading

### Implementation
- **Type all props** - define TypeScript interfaces
- **Export render functions** - not template components directly
- **Use env variables** - `env.FROM_EMAIL`, `env.POSTMARK_SERVER_TOKEN`
- **Log operations** - use `@bob/utils` logger

## Don'ts
- Don't use external stylesheets - use inline styles
- Don't use modern CSS features - stick to basic properties
- Don't forget alt text for images
- Don't send emails without logging
- Don't hardcode email addresses - use `env.FROM_EMAIL`
- Don't use console.log - always use `@bob/utils` logger
- Don't export template components directly - export render functions
