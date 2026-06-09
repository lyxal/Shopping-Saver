# Shopping Saver Mobile

React Native frontend for the `ComparisonAPI` backend.

## What it does

- Signs a user in with email
- Loads and creates shopping lists
- Adds products by name or link
- Supports Coles + Woolworths, Coles-only, and Woolworths-only entry
- Removes products with the backend `POST /removeProduct` route
- Runs the Coles vs Woolworths comparison through a dedicated loading page
- Keeps the current page on refresh by using the browser URL as the route source

## Structure

- `App.tsx` is now just the Expo entrypoint.
- `src/AppShell.tsx` owns the state and page switching.
- `src/screens/` contains one file per page.
- `src/components/common.tsx` contains shared UI pieces.
- `src/lib/` contains API helpers, theme values, and shared types.

## Running it

1. Install dependencies in this folder.
2. Set `EXPO_PUBLIC_API_BASE_URL` to your backend URL.
3. Start Expo.

Example:

```bash
npm install
set EXPO_PUBLIC_API_BASE_URL=http://<your-backend-host>:<port>
npm run start
```

If you use a device or emulator, make sure the backend is reachable from that network.
