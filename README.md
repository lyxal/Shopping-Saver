**The Problem I Focused On**

For this take-home assignment, I focused on bringing accessibility to price comparisons between Coles and Woolworths. The same basket of groceries can vary by 10-20% in cost between the two stores in any given week, so knowing which store has the cheapest overall prices for a shopping list can save shoppers hundreds, if not thousands, of dollars a year. However, comparing prices manually is tedious, especially for longer shopping lists, and products do not always match exactly between stores, so shoppers would otherwise need to remember their comparison pairs every time. To address this, I built an application that takes a manually entered shopping list, finds corresponding products at both Coles and Woolworths, and presents each product's price, the total cost per store, and the overall cheapest option. This lets shoppers maximise their savings on every shop and cut through the comparison friction the supermarket duopoly relies on.

**Key Product Decisions**

For the technology stack, I used C# for the backend and React Native for the frontend, mirroring the stack used by Open. For data persistence, I chose MongoDB. I initially considered Redis, but its flat value format didn't suit the rich document structure I needed to represent products, whereas MongoDB offers more structural flexibility along with strong consistency guarantees. These guarantees matter because prices only change on Wednesdays, so I can cache prices weekly without risking users being served stale data after a fresh scrape. For hosting, I used Microsoft Azure for the server and GitHub Pages for the frontend.

On the application side, I chose to support only manual grocery item input for this iteration. Receipt scanning is feasible, but reliable OCR and item matching would have taken more time than I had available. I also believe manual input is the better choice for users right now: Coles and Woolworths often use abbreviations on receipts that could make automatic matching unreliable without manual confirmation anyway. This is not to say receipt scanning is a bad idea or that it will not be added later - just that manual input was the more important target for a first iteration.

I also decided not to include items only available at one store in comparisons. While this would be a trivial server-side change, experimenting with how results are presented showed that surfacing savings information is a delicate balance: too much detail overwhelms users with noise, while too little risks them missing out on real savings. Presenting single-store items well would need careful design work to be genuinely useful rather than just additional clutter.

For storage and API design, I avoided N+1 requests where possible - for example, batching price requests for an entire shopping list into a single call. I also cache previously retrieved prices in the database to avoid unnecessary refetches from Coles and Woolworths, which helps minimise the number of automated requests the server makes and keeps it under the radar of the supermarkets' detection systems.

On the practical side, I made the decision to have the production demo, hosted at https://lyxal.github.io/Shopping-Saver/, use mock data rather than real data. Running the application locally on a laptop or an Australian-based server *will* use real Coles and Woolworths data. The issue is that both supermarkets appear to block data centre IPs, or at least geoblock cloud servers outside Australia. Using mock data for the deployed demo lets me provide something accessible while still demonstrating that real scraping is functional.

Scraping is necessary because Coles and Woolworths don't provide easily accessible public APIs. While the application does (ab)use the endpoints their own websites rely on, these aren't comprehensive - Woolworths, for instance, does not appear to expose a product information API - and they require scraping cookies and script locations from the live site (Coles' product search endpoint location, for example, changes with their current Build ID). Coles also has additional bot protection on non-API endpoints, which meant using Playwright to fetch pages with JavaScript enabled — and even then, bot detection was still occasionally triggered.

Finally, I chose not to implement a real authentication system. Users can enter an email address for persistent shopping lists, but addresses aren't verified. While authentication is architecturally straightforward, it is still time-consuming to implement properly, and skipping it let me focus my limited time on the scraping work, which was the harder problem. I consequently avoided the overhead of email sending, password hashing, and repeated logins during development.

For AI assistance, I used agentic tools to:

- Help choose a database provider based on system requirements
- Refine the database document structure
- Refine POST request body formats
- Stub initial implementations of `getProductFromWoolworthsURL`, `getProductFromColesURL`, `getProductFromWoolworthsName`, and `getProductFromColesName`
- Style and refine the frontend layout

I initially tried using Codex to generate the entire frontend, but found it easier to hand-write the overall layout and use Codex for styling refinements instead - the generated frontend was architecturally overcomplicated, using patterns no human would recommend for an application of this scale.

**Running Locally**

The project has two separate applications:

- `ComparisonAPI` - the C#/.NET backend API
- `comparison-frontend` - the Expo/React Native frontend

Prerequisites:

- .NET 10 SDK
- Node.js and npm
- A MongoDB connection string
- PowerShell, for the Playwright browser install command

Backend setup:

```powershell
cd ComparisonAPI
dotnet restore
dotnet build
```

The backend requires a MongoDB connection string at `MongoDB:ConnectionString`. For local development, set it with .NET user secrets so it does not need to be committed to `appsettings.json`:

```powershell
dotnet user-secrets set "MongoDB:ConnectionString" "<your MongoDB connection string>"
```

The backend uses Playwright when scraping Coles pages, so the Playwright browser binaries must be installed after the first successful backend build:

```powershell
pwsh .\bin\Debug\net10.0\playwright.ps1 install chromium
```

To run the backend locally:

```powershell
dotnet run
```

The backend listens on `http://localhost:5000` in development.

To build/publish the backend:

```powershell
dotnet publish -c Release -o .\publish
```

Frontend setup:

```powershell
cd comparison-frontend
npm install
Copy-Item .env.example .env
```

The default frontend API URL is `http://localhost:5000`. To use a different backend URL, edit `.env`:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

To run the frontend:

```powershell
npm run web
```

You can also start Expo without choosing a platform immediately:

```powershell
npm start
```

To build the frontend for web:

```powershell
npm run build:web
```

The web build output is written to `comparison-frontend/dist`.

**Plans for the Next Iteration**

If I had more time, I would:

- Support comparisons including items available at only one store, with careful design consideration for presenting these meaningfully
- Implement a real authentication system
- Investigate the long-term stability and sustainability of the current scraping approaches
- Investigate scraping from a cloud environment - an Australian-based region might be sufficient, though it is also possible both stores block all data centre IPs regardless of location
- Create a Docker image for easier deployment
- Improve mobile layouts, as some text is currently too wide or too large for smaller screens
- Allow products receipts to be scanned as a source of input.
