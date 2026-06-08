Brief 3A — Smart Shopping Destination

 Tell users where to shop this week based on their regular items and current specials
Problem: The same basket of groceries can vary by 10–20% in cost between Coles and Woolworths in any given week, driven by rotating specials on staple items. Most people do not track this and default to habit.
Why it matters: For a household spending $250/week on groceries, a 10–15% saving represents $1,300–$2,000/year. The blocker is not willingness to save — it is the effort of comparing. Remove that friction and the decision becomes easy.
Potential solution: Using a user's recurring shopping list (via receipt photo, loyalty account, or manual entry), analyse current specials at Coles and Woolworths to tell the user which store will save them the most money this week, and by how much.

• Working build — deployed link, TestFlight, APK, or screen recording of the running app
• Brief walkthrough — written or video (5–10 mins) covering: the problem you focused on, key product decisions you made, what you would do next if you had more time
• Code — repository link or zip

We are not looking for perfection. We are looking for how you think, how you work, and what you ship.

High Level User Story

1. User inputs regularly bought products (either manually or through receipt)
   a. Manual input = Product link from Coles/Woolworths
   b. Receipt input = OCR receipt and lookup from Coles/Woolworths
2. User inputs preferred store(s)
   a. Autosuggest based on location
   b. Option to search multiple stores?
3. Application maps each product to Coles product ID and Woolworths product ID
   a. Executed once for each new product
   b. Products already in the system are not re-mapped.
   c. Requiring lookup = OnReceipt - InDatabase
4. Application gets the price of each product on the list, notes specials, and tallies produce costs.
   a. Prices for existing products cached, cache expires every Wednesday.
5. Application displays price information to user, along with savings.
   a. Categorised as “if you want to only visit one store” and “if you’re okay with splitting up your trips”
   Questions
6. Coles and Woolworths do not appear to provide any freely accessible (i.e. no API key required) facing product information APIs. Additionally, the API keys used in their websites and apps are most likely unreliable for a production application (e.g. prone to being rotated frequently). Should specials information be retrieved from web scraping, pre-computed specials from weekly catalogues, or mocked with a stub API?
7. What is the expected behaviour if one store stocks a product that the other store does not stock?
8. Given location can make a difference in what specials are available to a user, should there be an option to set a target Coles/Woolworths?

Functional Requirements

- Users input the groceries they frequently purchase.
- The system presents the total cost of the user’s grocery list at both Coles and Woolworths.
- If a store does not have a product present at another store, the system asks the user if they wish to have the missing product included in the result.
  Tech Stack
- React Native for frontend
- C# for backend
- Redis for database (powered by STACKEXCHANGE LIBRARY?!?!)
- Microsoft Azure for backend hosting
- Github pages for frontend hosting
- Github actions for building
  Interaction with Coles
- It is true that you can piggyback off the API the Coles website/mobile app use: https://github.com/drkno/au-supermarket-apis/tree/main
- Problem: Requires API key.
- Problem: API isn’t like a public developer API. It’s an app specific API, and uses API keys generated (presumably) by the server when the client loads a page.
- Solution: Scrape API keys!
- Problem: API key life unknown. Could be long lasting. Could be short lived. I’ve been stung by Google invalidating secrets/cookies/etc when they’ve been scraped from a service.
- Problem: Using personal API keys could ruin my own personal usage of Coles services (IP ban, key ban, etc)
- Problem: Searching

## Mobile Frontend

The React Native frontend lives in [`frontend/`](frontend/). It is an Expo-based app that connects to the `ComparisonAPI` backend and covers the core workflow:

- sign in with email
- create or choose a grocery list
- add products by name or link
- compare Coles vs Woolworths totals

Set `EXPO_PUBLIC_API_BASE_URL` to your backend URL before running the app locally.
