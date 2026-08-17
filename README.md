# My Simple Resume

Chat-first resume builder. Preview on the left, chat on the right. Data stays in this browser.

## Run locally

1. Copy `.env.example` to `.env`
2. Add `GROQ_API_KEY=` (or `OPENAI_API_KEY` / `OPENROUTER_API_KEY`)
3. Restart after changing env:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What it does

- Import a PDF/Word resume in chat
- Edit the resume and cover letter by chatting
- Photo, undo/history, multiple resumes
- Export PDF, Word, cover letter PDF, or a JSON backup
- Token count is stored on this device only

## Backup

Use **Export → Backup JSON** to move resumes to another computer, then **Import backup**.

Chat uses the API key on the server. If you deploy this app, that key is shared by everyone who uses the site.
