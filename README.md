# Next.js Authentication System

A modern authentication system built with Next.js 15, Auth.js, Prisma, and SWR. Features include social login (GitHub, Google), magic link authentication, and session management.

## Features

- 🔐 Multiple Authentication Methods
  - Magic Link (Email-based passwordless authentication)
  - GitHub OAuth
  - Google OAuth
- 📧 Email Integration with Resend
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time Session Management with SWR
- 🛡️ Protected Routes
- 📱 Responsive Design
- 🌐 Type-safe with TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn
- PostgreSQL database
- Resend API key (for email functionality)
- GitHub OAuth credentials
- Google OAuth credentials

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-database-url"

# Auth
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:4001"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
SENDER_EMAIL_ADDRESS="your-verified-email"

# OAuth Providers
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
AUTH_GOOGLE_CLIENT_ID="your-google-client-id"
AUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd auth-repo
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server
```bash
npm run dev
```

## Usage

### Protected Routes

Use the `AuthCheck` component to protect routes:

```tsx
import { AuthCheck } from "@/components/auth/auth-check"

export default function ProtectedPage() {
  return (
    <AuthCheck>
      <div>Protected Content</div>
    </AuthCheck>
  )
}
```

### Session Management

Use the `useAuth` hook for session management:

```tsx
import { useAuth } from "@/hooks/use-session"

function MyComponent() {
  const { 
    session, 
    isAuthenticated, 
    isLoading 
  } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>

  return <div>Welcome, {session.user.name}</div>
}
```

### Custom Configuration

The authentication system can be configured through:
- `src/lib/auth/auth.ts` - NextAuth configuration
- `src/providers/swr-provider.tsx` - SWR global configuration
- `src/hooks/use-session.ts` - Session management configuration

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── auth/              # Authentication routes
│   │   ├── signin/        # Sign-in page
│   │   ├── error/         # Error handling
│   │   └── verify-request/# Email verification
│   └── portal/            # Protected dashboard
├── components/            # React components
│   └── auth/             # Auth-related components
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configurations
│   └── auth/            # Auth configuration
└── providers/           # React context providers
```

## Error Handling

The system includes custom error pages and handling for:
- Authentication failures
- Email verification issues
- OAuth errors
- Session expiration
- Server configuration problems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
