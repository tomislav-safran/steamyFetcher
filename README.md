# SteamyFetcher

A Node.js + TypeScript project for fetching and building a full local Steam games database.

## Features
- Fetches all Steam AppIDs from the public Steam API.
- Fetches detailed game data (description, genres, developers, price, etc.).
- Stores everything in a local SQLite database using Prisma ORM.
- Clean database ready for AI projects, search engines, analytics, or more.

## Tech Stack
- Node.js
- TypeScript
- Prisma ORM
- SQLite
- Axios

## Running Locally
```bash
npm install
npx prisma generate
npx prisma migrate deploy 
npx ts-node src/fetchAppList.ts   # Fetch AppIDs
npx ts-node src/fetchGameDetails.ts  # Fetch full game details
npx ts-node src/fetchReviews.ts # Fetch game reviews
```

## Notes
 - fetching app data for all apps will take a while since the steam API alows fetching details for only 1 record at a time, with a limit of ~200 requests every 5 minutes
