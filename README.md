# Study nook

A small, mobile-friendly study site with flashcards, spaced review, and multiple-choice quizzes. It is a static website with no sign-in, server, or build step.

## Use it

Open `index.html` in a browser, or publish the repository with GitHub Pages. The app starts with three study decks based on the supplied AS2106 handouts:

- Interactive web materials
- Web content and infographics
- Interactive games

From **My decks**, create a deck, add or edit cards, and export a backup. Each card has a question, answer, three wrong choices for quizzes, and optional note/source. Data, review progress, and the dark-mode preference are saved in the current browser using local storage. Importing a backup adds a copy of its decks to the library. The site does not include visitor tracking.

Spaced review uses simple intervals: Again in about 10 minutes, Hard in 1 day, Good in 3 days, and Easy in at least 4 days. Each rating updates the next due time for that card.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the site when changes reach `main`. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the publishing source if GitHub Pages is not enabled yet. Once the first deployment finishes, GitHub shows the published address on that settings page.

## Files

- `index.html` — page structure and edit dialogs
- `styles.css` — responsive layout and touch-friendly controls
- `data.js` — starter decks and flashcards
- `app.js` — review scheduling, quizzes, library editing, and browser storage
