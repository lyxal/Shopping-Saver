**Problem Statement**

- Price comparisons between Coles and Woolworths.
- Automatically compare prices between matching items.

**Key Decisions**

- C# for the backend (ASP.NET minimal Web api)
- React Native for the frontend (expo app)
	- Matches tech stack of Open
- Mongodb for data persistence
	- Considered Redis, but the lack of structured values didn't work well with the document structure
	- Considered SQL based database, but data isn't that regular. Plus, NoSQL solutions provide better speed.
	- Eventual consistency is a suitable compromise for the system - data only needs to be updated once every week at most.
- Hijacking Coles search graphql api and product graphql api. Playwright for JavaScript enabled scraping
- Azure for server hosting
- Github pages for frontend hosting
- No authentication to allow for more time investigating Coles and woolworths scraping
- AI to assist with API format planning, as well as frontend styling
	- I attempted using Codex to create the whole website, but was unhappy with the results. I instead opted for manually created layouts with ai styling to enhance the result.

**Next Iteration**

- Single product rows. Possible in current system but requires a lot of thought to present in a meaningful manner. Noise vs signal type situation.
- Implement actual authentication.
- Investigate the stability/long term sustainability of the scraping approaches.
- Make a docker image for easier deployment