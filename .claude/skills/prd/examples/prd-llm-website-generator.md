# PRD: LLM Website Generator

## Introduction

A no-code website builder that allows non-technical users to create simple HTML websites using natural language prompts. Users describe what they want, and an LLM generates a complete static website. The product emphasizes accessibility through a guest-first onboarding flow—users can create their first site without signing up, then register to save and share their work.

## Goals

- Enable non-technical users to create static HTML websites using plain English prompts
- Provide frictionless onboarding by allowing site creation before registration
- Allow iterative refinement through conversational prompts (regenerate or modify)
- Give users a dashboard to manage all their created websites
- Enable public sharing of websites via simple slug-based URLs

## User Stories

### US-001: Guest creates first website
**Description:** As a guest user, I want to create a website without signing up so that I can try the product before committing.

**Acceptance Criteria:**
- [ ] Landing page shows a prominent prompt input field
- [ ] Guest can enter a prompt and submit without authentication
- [ ] Loading state shown while LLM generates the site
- [ ] Generated website is displayed in preview after completion

### US-002: View generated website in editor mode
**Description:** As a user, I want to see my generated website with a prompt sidebar so that I can make additional changes.

**Acceptance Criteria:**
- [ ] After generation, UI transitions to editor layout
- [ ] Website preview takes up main content area
- [ ] Prompt input moves to a collapsible sidebar
- [ ] Previous prompts shown as conversation history in sidebar

### US-003: Regenerate entire website
**Description:** As a user, I want to completely regenerate my website with a new prompt so that I can start fresh with a different direction.

**Acceptance Criteria:**
- [ ] "Regenerate" or "Start over" option available in editor
- [ ] User can enter a completely new prompt
- [ ] Previous version is replaced entirely
- [ ] Confirmation dialog warns user that current version will be lost

### US-004: Make incremental changes via prompt
**Description:** As a user, I want to describe changes to my existing website so that I can refine it without starting over.

**Acceptance Criteria:**
- [ ] User can type modification prompts in sidebar (e.g., "make the header blue")
- [ ] Changes are applied to existing site, preserving unchanged elements
- [ ] Preview updates to show modified version

### US-005: Register new account
**Description:** As a guest user, I want to create an account so that I can save my website and access it later.

**Acceptance Criteria:**
- [ ] Registration form with email and password fields
- [ ] Password strength requirements displayed
- [ ] Email verification sent after registration
- [ ] If guest had created a site, it transfers to their new account
- [ ] Redirect to dashboard after successful registration

### US-006: Login with email/password
**Description:** As a registered user, I want to log in with my email and password so that I can access my websites.

**Acceptance Criteria:**
- [ ] Login form with email and password fields
- [ ] "Forgot password" link visible
- [ ] Error message for invalid credentials
- [ ] Redirect to dashboard after successful login

### US-007: Login with OAuth providers
**Description:** As a user, I want to sign in with Google or GitHub so that I can use my existing accounts.

**Acceptance Criteria:**
- [ ] "Continue with Google" button on login/register pages
- [ ] "Continue with GitHub" button on login/register pages
- [ ] OAuth flow redirects to provider and back
- [ ] Account created automatically if new OAuth user
- [ ] Existing account linked if email matches

### US-008: Login with magic link
**Description:** As a user, I want to receive a login link via email so that I don't need to remember a password.

**Acceptance Criteria:**
- [ ] "Email me a login link" option on login page
- [ ] User enters email and submits
- [ ] Email sent with secure, time-limited login link
- [ ] Clicking link logs user in and redirects to dashboard
- [ ] Link expires after 15 minutes or single use

### US-009: Reset password
**Description:** As a user, I want to reset my password so that I can regain access if I forget it.

**Acceptance Criteria:**
- [ ] "Forgot password" link on login page
- [ ] User enters email to receive reset link
- [ ] Reset email contains secure, time-limited link
- [ ] Reset page allows entering new password
- [ ] Password updated and user redirected to login

### US-010: View dashboard of websites
**Description:** As a logged-in user, I want to see all my websites in a dashboard so that I can manage them.

**Acceptance Criteria:**
- [ ] Dashboard shows grid/list of user's websites
- [ ] Each website card shows: thumbnail preview, title/name, creation date
- [ ] Cards are clickable to open editor
- [ ] Empty state shown for new users with CTA to create first site

### US-011: Name/rename a website
**Description:** As a user, I want to give my website a name so that I can identify it in my dashboard.

**Acceptance Criteria:**
- [ ] Website name editable from dashboard (inline or modal)
- [ ] Website name editable from editor view
- [ ] Name has character limit (e.g., 100 chars)
- [ ] Default name auto-generated from first prompt if not set

### US-012: Delete a website
**Description:** As a user, I want to delete websites I no longer need so that I can keep my dashboard organized.

**Acceptance Criteria:**
- [ ] Delete option available on each website card
- [ ] Confirmation dialog before deletion
- [ ] Website removed from dashboard after deletion
- [ ] Public URL returns 404 after deletion

### US-013: Share website via public URL
**Description:** As a user, I want to share my website with a public link so that others can view it.

**Acceptance Criteria:**
- [ ] Each website has a unique slug (e.g., `/site/abc123`)
- [ ] "Share" button copies public URL to clipboard
- [ ] Public URL accessible without authentication
- [ ] Public page renders the website HTML full-screen

### US-014: Customize website slug
**Description:** As a user, I want to customize my website's URL slug so that it's memorable and meaningful.

**Acceptance Criteria:**
- [ ] Slug editable from share dialog or settings
- [ ] Slug must be unique across all users
- [ ] Slug validation: lowercase, alphanumeric, hyphens only
- [ ] Error message if slug already taken
- [ ] Old slug stops working after change (no redirects)

### US-015: Guest prompted to sign up after creation
**Description:** As a guest who created a website, I want to be prompted to sign up so that I can save my work.

**Acceptance Criteria:**
- [ ] After site generation, modal/banner prompts guest to sign up
- [ ] Message explains benefits: save, edit later, share publicly
- [ ] "Sign up" and "Continue as guest" options available
- [ ] Dismissing prompt allows continued editing in session
- [ ] Site is lost if guest closes browser without signing up

### US-016: Logout
**Description:** As a logged-in user, I want to log out so that I can secure my account on shared devices.

**Acceptance Criteria:**
- [ ] Logout option in user menu/header
- [ ] Redirect to landing page after logout

### US-017: View website in full-screen preview
**Description:** As a user, I want to preview my website full-screen so that I can see how it looks to visitors.

**Acceptance Criteria:**
- [ ] "Preview" button in editor opens full-screen view
- [ ] Full-screen hides sidebar and editor UI
- [ ] Close/exit button to return to editor
- [ ] Alternatively, opens in new tab

## Functional Requirements

### Website Generation
- FR-1: System must accept natural language prompts describing desired website
- FR-2: System must send prompt to LLM and receive generated HTML
- FR-3: Generated HTML must be valid, self-contained static HTML with inline CSS
- FR-4: System must support both full regeneration and incremental modification modes
- FR-5: For incremental changes, system must send current HTML context to LLM with modification prompt

### User Interface
- FR-6: Landing page must show centered prompt input for first-time/guest users
- FR-7: After generation, UI must transition to editor layout with sidebar and preview
- FR-8: Sidebar must show prompt input and conversation history
- FR-9: Preview must render generated HTML in an iframe or sandboxed container
- FR-10: Sidebar must be collapsible to maximize preview space

### Authentication
- FR-11: System must support email/password registration and login
- FR-12: System must support OAuth login via Google and GitHub
- FR-13: System must support passwordless magic link login
- FR-14: System must send email verification on registration
- FR-15: System must support password reset via email link
- FR-16: All auth tokens/links must expire appropriately (magic link: 15 min, reset: 1 hour)

### Guest Flow
- FR-17: Guests must be able to generate websites without authentication
- FR-18: Guest-created websites must persist in browser session
- FR-19: On registration, guest's session website must transfer to new account
- FR-20: System must prompt guests to sign up after site creation

### Dashboard
- FR-21: Dashboard must display all user's websites in a grid or list
- FR-22: Each website entry must show preview thumbnail, name, and date
- FR-23: Users must be able to create, open, rename, and delete websites from dashboard

### Sharing
- FR-24: Each website must have a unique public URL with format `/site/{slug}`
- FR-25: Slugs must be auto-generated on creation (random or prompt-based)
- FR-26: Users must be able to customize their website's slug
- FR-27: Slugs must be globally unique and validated (lowercase, alphanumeric, hyphens)
- FR-28: Public URLs must render website HTML without authentication

## Non-Goals

- Custom domains for websites
- Website analytics or visitor tracking
- Collaboration or team features
- Version history or undo/redo
- Export/download website files
- Custom code editing (HTML/CSS directly)
- Interactive elements (forms, JavaScript functionality)
- Image upload or asset management (images via URL only)
- SEO tools or meta tag editing
- Monetization or payment features (for MVP)
- Usage limits or rate limiting (for MVP)

## Design Considerations

### Landing Page
- Large, centered prompt input with placeholder text (e.g., "Describe the website you want to create...")
- Minimal header with logo and "Sign in" link
- Example prompts or inspiration below input

### Editor Layout
- Left sidebar (collapsible): prompt input, conversation history, site settings
- Main area: website preview in iframe
- Top bar: site name, share button, preview button, user menu

### Dashboard
- Grid of website cards with hover actions
- Card shows: thumbnail, name, date, quick actions (edit, share, delete)
- "Create new" card/button prominent

### Authentication Pages
- Clean, centered forms
- Social login buttons prominent
- Clear error messaging

## Technical Considerations

- Website HTML stored in database as text/blob
- Preview rendered in sandboxed iframe for security
- Slugs indexed for fast public URL lookups
- Consider rate limiting LLM calls per user (implement later)
- LLM prompt engineering needed to ensure consistent, valid HTML output
- Guest session data stored in localStorage with unique session ID

## Success Metrics

- Guest can generate first website in under 60 seconds
- 50%+ of guests who create a site proceed to sign up
- Users can share a public link within 2 clicks from editor
- Generated websites render correctly across modern browsers

## Open Questions

- What LLM provider/model should be used for generation?
- Should there be a "template" or "style" selector to guide generation?
- How long should guest session data persist before expiring?
- Should public sites show a "Made with [Product]" badge/watermark?
- What is the maximum HTML size we should support?
