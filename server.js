require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
// Explicit admin route to guarantee correct file serving
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const activeQuizzes = {};

/* ============================================================
   PUBLIC API
   ============================================================ */

app.get('/api/subjects', (req, res) => {
  const rows = db.prepare(`
    SELECT subject, COUNT(*) as count FROM questions GROUP BY subject ORDER BY subject
  `).all();
  res.json(rows);
});

// 15 random questions per quiz
app.get('/api/quiz/:subject', (req, res) => {
  const subject = req.params.subject;
  const rows = db.prepare(`
    SELECT id, question, optionA, optionB, optionC, optionD, year, image
    FROM questions WHERE subject = ? ORDER BY RANDOM() LIMIT 15
  `).all(subject);

  if (!rows.length) return res.status(404).json({ error: 'No questions for this subject' });

  const quizId = nanoid(12);
  activeQuizzes[quizId] = {
    subject,
    ids: rows.map(r => r.id),
    createdAt: Date.now()
  };

  res.json({ quizId, subject, questions: rows });
});

app.post('/api/submit', (req, res) => {
  const { quizId, answers, nickname, timeTaken } = req.body;
  const meta = activeQuizzes[quizId];
  if (!meta) return res.status(400).json({ error: 'Invalid or expired quiz session' });

  const placeholders = meta.ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT id, correct FROM questions WHERE id IN (${placeholders})
  `).all(...meta.ids);

  let score = 0;
  for (const q of rows) {
    if (answers && answers[q.id] === q.correct) score++;
  }

  const info = db.prepare(`
    INSERT INTO attempts (subject, score, total, time_taken, nickname)
    VALUES (?, ?, ?, ?, ?)
  `).run(meta.subject, score, meta.ids.length,
         timeTaken || 0, (nickname || 'Anonymous').slice(0, 40));

  delete activeQuizzes[quizId];

  res.json({
    attemptId: info.lastInsertRowid,
    score,
    total: meta.ids.length,
    subject: meta.subject
  });
});

app.get('/api/leaderboard/:subject', (req, res) => {
  const rows = db.prepare(`
    SELECT nickname, score, total, time_taken, created_at
    FROM attempts WHERE subject = ?
    ORDER BY score DESC, time_taken ASC, created_at ASC
    LIMIT 20
  `).all(req.params.subject);
  res.json(rows);
});

app.get('/api/stats/:subject', (req, res) => {
  const s = req.params.subject;
  const attempts = db.prepare(`SELECT COUNT(*) c FROM attempts WHERE subject=?`).get(s).c;
  const likesRow = db.prepare(`SELECT count FROM likes WHERE subject=?`).get(s);
  res.json({ attempts, likes: likesRow ? likesRow.count : 0 });
});

app.post('/api/like/:subject', (req, res) => {
  const s = req.params.subject;
  db.prepare(`
    INSERT INTO likes(subject,count) VALUES(?,1)
    ON CONFLICT(subject) DO UPDATE SET count = count + 1
  `).run(s);
  const count = db.prepare(`SELECT count FROM likes WHERE subject=?`).get(s).count;
  res.json({ likes: count });
});

app.get('/api/comments/:subject', (req, res) => {
  const rows = db.prepare(`
    SELECT name, message, created_at FROM comments WHERE subject=?
    ORDER BY created_at DESC LIMIT 50
  `).all(req.params.subject);
  res.json(rows);
});

app.post('/api/comments', (req, res) => {
  const { subject, name, message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Empty message' });
  db.prepare(`INSERT INTO comments(subject,name,message) VALUES(?,?,?)`).run(
    subject || '',
    (name || 'Guest').slice(0, 40),
    message.slice(0, 400)
  );
  res.json({ ok: true });
});

/* ============================================================
   DEEP LINK: /s/<subject-slug>  →  /?subject=...
   ============================================================ */

app.get('/s/:slug', (req, res) => {
  const slug = req.params.slug.toLowerCase().replace(/-/g, '').replace(/\s+/g, '');
  const match = db.prepare(`
    SELECT subject FROM questions
    WHERE LOWER(REPLACE(subject, ' ', '')) = ?
    LIMIT 1
  `).get(slug);

  if (match) {
    return res.redirect(`/?subject=${encodeURIComponent(match.subject)}`);
  }
  res.redirect('/');
});

/* ============================================================
   ADMIN API
   ============================================================ */

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/admin/questions', requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = (page - 1) * limit;
  const subject = req.query.subject || '';
  const search = req.query.q || '';

  let where = '1=1';
  const params = [];
  if (subject) { where += ' AND subject = ?'; params.push(subject); }
  if (search)  { where += ' AND question LIKE ?'; params.push(`%${search}%`); }

  const rows = db.prepare(`
    SELECT * FROM questions WHERE ${where}
    ORDER BY subject, id LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`SELECT COUNT(*) c FROM questions WHERE ${where}`)
    .get(...params).c;

  res.json({ rows, total, page, limit });
});

app.post('/api/admin/questions', requireAdmin, (req, res) => {
  const { id, subject, question, optionA, optionB, optionC, optionD,
          correct, year, image } = req.body;

  if (!subject || !question || !optionA || !optionB || !optionC || !optionD) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const finalId = id || `${subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO questions
      (id, subject, question, optionA, optionB, optionC, optionD, correct, year, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(finalId, subject, question, optionA, optionB, optionC, optionD,
           Number(correct) || 0, year || '', image || null);
    res.json({ ok: true, id: finalId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/admin/bulk', requireAdmin, (req, res) => {
  const items = req.body.questions;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Expected { questions: [...] }' });
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO questions
    (id, subject, question, optionA, optionB, optionC, optionD, correct, year, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((list) => {
    let ok = 0;
    for (const q of list) {
      try {
        const finalId = q.id ||
          `${(q.subject || 'q').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${ok}`;
        insert.run(
          finalId, q.subject, q.question,
          q.optionA, q.optionB, q.optionC, q.optionD,
          Number(q.correct) || 0, q.year || '', q.image || null
        );
        ok++;
      } catch (_) {}
    }
    return ok;
  });

  res.json({ ok: true, added: tx(items) });
});

app.put('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const { question, optionA, optionB, optionC, optionD, correct, year, image } = req.body;
  const r = db.prepare(`
    UPDATE questions SET question=?, optionA=?, optionB=?, optionC=?,
      optionD=?, correct=?, year=?, image=? WHERE id=?
  `).run(question, optionA, optionB, optionC, optionD,
         Number(correct) || 0, year || '', image || null, req.params.id);
  res.json({ ok: true, updated: r.changes });
});

app.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const r = db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ ok: true, deleted: r.changes });
});

/* ============================================================
   START
   ============================================================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SUCCESS ACADEMY — UTME LAB running at http://localhost:${PORT}`);
});
