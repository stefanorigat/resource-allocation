# Keycloak OIDC Authentication Setup

## Overview

The application now uses Keycloak for authentication with OIDC SSO. The landing page is public, and all other routes are protected and require authentication.

## Required Environment Variables

Add the following variables to your `.env` file:

```bash
# NextAuth.js Configuration
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # Or your production URL

# Keycloak OIDC Configuration
KEYCLOAK_ID="your-keycloak-client-id"
KEYCLOAK_SECRET="your-keycloak-client-secret"
KEYCLOAK_ISSUER="https://your-keycloak-domain/realms/your-realm-name"
```

## Keycloak Configuration Steps

### 1. Create a Client in Keycloak

1. Log into your Keycloak Admin Console
2. Select your realm (or create a new one)
3. Go to **Clients** → **Create client**
4. Set the following:
   - **Client ID**: `resource-allocation` (or your preferred name)
   - **Client Protocol**: `openid-connect`
   - **Client Authentication**: `ON`
   - Click **Next**

### 2. Configure Client Settings

1. **Access Settings**:
   - **Root URL**: `http://localhost:3000` (or your production URL)
   - **Valid Redirect URIs**: 
     - `http://localhost:3000/*`
     - `https://linnie-substructional-davion.ngrok-free.dev/*` (if using ngrok)
   - **Valid Post Logout Redirect URIs**: Same as redirect URIs
   - **Web Origins**: `+` (to allow all valid redirect URIs)

2. **Capability Config**:
   - **Client Authentication**: `ON`
   - **Authorization**: `OFF`
   - **Authentication Flow**: Enable `Standard flow` and `Direct access grants`

3. Save the client

### 3. Get Client Credentials

1. Go to the **Credentials** tab of your client
2. Copy the **Client Secret**
3. This is your `KEYCLOAK_SECRET`

### 4. Get the Issuer URL

The issuer URL format is:
```
https://<your-keycloak-domain>/realms/<realm-name>
```

For example:
```
https://keycloak.wiz-team.com/realms/wiz-team-realm
```

### 5. Create Users (Optional)

If you haven't already, create users in Keycloak:

1. Go to **Users** → **Add user**
2. Fill in the user details
3. Go to the **Credentials** tab and set a password
4. Set **Temporary** to `OFF` if you don't want to force a password change

## Application Structure

### Public Routes
- `/` - Landing page (no authentication required)

### Protected Routes
- `/dashboard` - Main dashboard
- `/resources` - Resource management
- `/pods` - Pod management
- `/projects` - Project management
- `/overview` - Monthly overview
- `/budget` - Budget tracking
- `/settings/*` - Settings pages

### Authentication Flow

1. User visits any protected route
2. Middleware checks authentication status
3. If not authenticated, redirects to landing page (`/`)
4. User clicks "Sign In" button
5. Redirected to Keycloak login page
6. After successful login, redirected back to the application
7. Session is maintained via JWT

### Logout

- Click the "Sign Out" button in the navigation
- User is signed out and redirected to the landing page

## Testing Locally

1. Update your `.env` file with the Keycloak credentials
2. Restart your development server: `npm run dev`
3. Visit `http://localhost:3000`
4. You should see the landing page
5. Click "Sign In" to test the authentication flow

## Troubleshooting

### "Invalid redirect_uri"
- Check that your redirect URIs in Keycloak match your application URL exactly
- Make sure to include the wildcard (`/*`) in the redirect URI

### "Client not found"
- Verify that `KEYCLOAK_ID` matches the client ID in Keycloak

### "Invalid client credentials"
- Verify that `KEYCLOAK_SECRET` matches the client secret in Keycloak's Credentials tab

### "Issuer mismatch"
- Verify that `KEYCLOAK_ISSUER` matches the format: `https://<domain>/realms/<realm-name>`
- Do not include trailing slashes

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production URL
2. Add production URLs to Keycloak's Valid Redirect URIs
3. Generate a new `AUTH_SECRET` for production
4. Consider using environment-specific Keycloak realms (dev, staging, prod)

## Security Notes

- Never commit `.env` file to version control
- Use strong, randomly generated secrets
- Regularly rotate client secrets
- Use HTTPS in production
- Configure Keycloak's CORS settings appropriately

