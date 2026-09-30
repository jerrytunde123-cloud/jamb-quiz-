# SUCCESS ACADEMY — UTME LAB

A browser-based UTME/JAMB practice quiz for Nigerian students.

- **Subject quizzes** from a 1,000-question bank (35+ subjects)
- **Timed sessions** — 10 questions, 5 minutes per attempt
- **Randomised questions** on every retake (drawn from a large pool per subject)
- **Question images** for diagram questions (from `public/images/`)
- **Unlock by joining** the WhatsApp and Telegram channels
- **Leaderboard, likes, comments, and share buttons**
- **Personal bests** stored per subject in `localStorage`

## Run it

```bash
npm install
npm run setup      # seeds DB + imports images from GitHub
npm start          # http://localhost:3000
```

Or step by step:

```bash
npm install
npm run seed       # import question-bank.json into SQLite
npm run images     # clone + copy images from GitHub
npm start
```

## Deploy

### Render.com (recommended — full backend)

1. Push this repo to GitHub.
2. Create a **New Web Service** on render.com.
3. Build command: `npm install && npm run seed && npm run images`
4. Start command: `npm start`
5. Add env vars:
   - `DB_PATH=./utme.db`
   - `ADMIN_KEY=your-secret-key`

### Vercel (static only)

This project includes a full Node backend. To deploy only the frontend:

- Framework Preset: **Other**
- Output Directory: `public`
- Build Command: *empty*
- Install Command: *empty*

> Note: the admin panel and leaderboard require the backend. Deploy on Render
> for full functionality.

## Admin Panel

Visit `/admin.html` and enter your `ADMIN_KEY` to:

- **Add** questions one at a time (with optional image path)
- **Bulk upload** thousands of questions via JSON paste
- **Search and delete** existing questions

## Images

Question diagrams live in `public/images/`. The `question-bank.json` file
references them as `"images/xxx.jpg"` and the seed script rewrites these to
`"/images/xxx.jpg"` for the web app.

To import images from your existing Jamb-Lab repo:

```bash
npm run images
```

This clones your GitHub repo (pinned to commit `fdcf45e6…`), sparse-checks
out only the `assets/images/` folder, and copies every image into
`public/images/`. Then it cleans up the temporary clone automatically.

## Layout

```
utme-lab/
├── server.js              # Express backend + admin API
├── database.js            # SQLite schema
├── seed.js                # Import question-bank.json
├── import-images.js       # Clone + copy images from GitHub
├── question-bank.json     # 1,000+ questions across 35 subjects
├── .env
└── public/
    ├── index.html         # Subject picker
    ├── quiz.html          # Quiz engine
    ├── admin.html         # Admin panel
    ├── css/style.css
    ├── images/            # Question diagrams
    └── js/
        ├── app.js         # Subject grid
        ├── gate.js        # WhatsApp unlock
        └── quiz.js        # Quiz + timer + scoring
```

## Points Flow

- **Initial balance:** 0 points for new users.
- **Earning points:** Users earn **+10 points** each time they share
  (Friends, Groups, Class, or Invite link). Points are only earned from
  sharing, not from exams.
- **Starting an exam:** Costs **5 points** per selected subject. Points are
  deducted upon starting the exam and refreshed to 0 / spent balance.
- **Exam completion:** Exams do **not** award points. Once points are used up
  to take the exam, users must share again to earn points for their next quiz.
- **Invite welcome:** A friend who opens an invite link receives a
  **+10 pt welcome bonus** to try their first quiz.

## Tests

```bash
git add .
git commit -m "Add admin panel + image pipeline + WhatsApp gate"
git push
npm install
npm test
```

## Author

Jerry / Newton — UTME LAB for Nigerian students.
