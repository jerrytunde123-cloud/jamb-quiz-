require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- SUBJECTS ---------- */
app.get('/api/subjects', (req, res) => {
  const rows = db.prepare(`
    SELECT subject, COUNT(*) as count FROM questions GROUP BY subject ORDER BY subject
  `).all();
  res.json(rows);
});

/* ---------- START QUIZ: returns 10 random questions ---------- */
app.get('/api/quiz/:subject', (req, res) => {
  const subject = req.params.subject;
  const rows = db.prepare(`
    SELECT id, question, optionA, optionB, optionC, optionD, year, image
    FROM questions WHERE subject = ? ORDER BY RANDOM() LIMIT 10
  `).all(subject);

  if (!rows.length) return res.status(404).json({ error: 'No questions for this subject' });

  // Generate a one-time token tied to these question IDs (in-memory map for simplicity)
  const quizId = nanoid(10);
  activeQuizzes[quizId] = {
    subject,
    ids: rows.map(r => r.id),
    createdAt: Date.now()
  };

  res.json({ quizId, subject, questions: rows });
});

/* ---------- SUBMIT QUIZ ---------- */
const activeQuizzes = {}; // in-memory; use Redis in production

app.post('/api/submit', (req, res) => {
  const { quizId, answers, nickname, timeTaken } = req.body;
  const meta = activeQuizzes[quizId];
  if (!meta) return res.status(400).json({ error: 'Invalid or expired quiz' });

  const placeholders = meta.ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT id, correct FROM questions WHERE id IN (${placeholders})
  `).all(...meta.ids);

  let score = 0;
  rows.forEach(q => {
    if (answers[q.id] === q.correct) score++;
  });

  const info = db.prepare(`
    INSERT INTO attempts (subject, score, total, time_taken, nickname)
    VALUES (?, ?, ?, ?, ?)
  `).run(meta.subject, score, meta.ids.length, timeTaken || 0, nickname || 'Anonymous');

  delete activeQuizzes[quizId];

  res.json({
    attemptId: info.lastInsertRowid,
    score,
    total: meta.ids.length,
    subject: meta.subject
  });
});

/* ---------- LEADERBOARD ---------- */
app.get('/api/leaderboard/:subject', (req, res) => {
  const rows = db.prepare(`
    SELECT nickname, score, total, time_taken, created_at
    FROM attempts WHERE subject = ?
    ORDER BY score DESC, time_taken ASC, created_at ASC LIMIT 20
  `).all(req.params.subject);
  res.json(rows);
});

/* ---------- STATS ---------- */
app.get('/api/stats/:subject', (req, res) => {
  const s = req.params.subject;
  const attempts = db.prepare(`SELECT COUNT(*) c FROM attempts WHERE subject=?`).get(s).c;
  const likes = db.prepare(`SELECT count FROM likes WHERE subject=?`).get(s)?.count || 0;
  res.json({ attempts, likes });
});

/* ---------- LIKES ---------- */
app.post('/api/like/:subject', (req, res) => {
  const s = req.params.subject;
  db.prepare(`INSERT INTO likes(subject,count) VALUES(?,1)
    ON CONFLICT(subject) DO UPDATE SET count = count + 1`).run(s);
  const count = db.prepare(`SELECT count FROM likes WHERE subject=?`).get(s).count;
  res.json({ likes: count });
});

/* ---------- COMMENTS ---------- */
app.get('/api/comments/:subject', (req, res) => {
  const rows = db.prepare(`
    SELECT name, message, created_at FROM comments WHERE subject=?
    ORDER BY created_at DESC LIMIT 50
  `).all(req.params.subject);
  res.json(rows);
});

app.post('/api/comments', (req, res) => {
  const { subject, name, message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Empty' });
  db.prepare(`INSERT INTO comments(subject,name,message) VALUES(?,?,?)`)
    .run(subject, (name || 'Guest').slice(0, 40), message.slice(0, 400));
  res.json({ ok: true });
});

/* ---------- SPA fallback ---------- */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 UTME LAB running on http://localhost:${PORT}`));
