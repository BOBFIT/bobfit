AkyFit website version - original-style layout

This folder is a static website. Upload every file in this folder to an HTTPS
website host such as GitHub Pages, Cloudflare Pages, Netlify, or your own host.

After it is online:
1. Open the HTTPS URL in Safari on your iPhone.
2. Tap Share.
3. Tap Add to Home Screen.
4. Use the Home Screen icon at the gym.

Data is stored on the iPhone using IndexedDB, with localStorage as a shadow
copy. Use the Backup button regularly and save the JSON backup to Files or
iCloud Drive.

Importing old data:
Use the Import button and choose the JSON backup exported from the old AkyFit /
Replit app. The importer understands the old AkyFit backup shape and converts
meals, workouts, goals, body metrics, saved meals, weekly plan, peptide/stack,
daily check-ins, and workout templates where present.

Workout logging:
Use Planner to edit Day 1, Day 2, and any extra workout days you add. In Log,
the Workout Log pulls the planned workout day from the weekly planner. Add sets
for each exercise with reps and weight, then save the session. Previous sessions
stay in history and the next workout shows the previous weights/sets beside each
exercise.

AI features:
The website is static, so it cannot safely contain a private OpenAI key. To use
the old AI features, paste your old AkyFit/Replit backend URL into the AI
Features panel. If that backend is online and has the old /api routes, AI Coach,
Morning Brief, Evening Review, Meal Plan, and Food Photo analysis will work from
the website.

No Mac server, home Wi-Fi, Replit, or Expo Go is required once it is hosted.
