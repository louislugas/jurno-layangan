# jurno-layangan

Main code : src/routes/+page.svelte
Data :
- db.js --> database library for leaderboard data (supabase)
- kiteData.js --> kite database for intro
- obstacle.js --> hardcoded obstacle coordinate (y)
- skyColor.js --> hardcoded hex color for sky, cloud, text, and star

## Functions

Database Function
- getData() --> to get score leaderboard data
- insertData() --> to post/insert score and player name into database
- updateLeaderBoard --> postgres realtime listening to every new score



