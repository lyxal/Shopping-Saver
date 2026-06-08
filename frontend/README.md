# Shopping Saver Mobile

React Native frontend for the `ComparisonAPI` backend.

## What it does

- Signs a user in with email
- Loads and creates shopping lists
- Adds products by name or link
- Runs the Coles vs Woolworths comparison
- Shows the cheaper store plus per-item differences

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
