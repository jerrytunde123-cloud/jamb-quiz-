const fs = require('fs');
const path = require('path');
const db = require('./database');

const BANK_PATH = path.join(__dirname, 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));

db.prepare('DELETE FROM questions').run();

const insert = db.prepare(`
  INSERT OR REPLACE INTO questions
  (id, subject, question, optionA, optionB, optionC, optionD, correct, year, image)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((items) => {
  let n = 0;
  for (const item of items) {
    try {
      insert.run(
        item.id, item.subject, item.question,
        item.optionA, item.optionB, item.optionC, item.optionD,
        item.correct, item.year, item.image
      );
      n++;
    } catch (e) {
      console.warn(`⚠️  Skipped ${item.id}:`, e.message);
    }
  }
  return n;
});

let total = 0;
const all = [];

for (const key in bank) {
  const subject = bank[key].name;
  for (const q of bank[key].questions) {
    // Trim to 4 options (JAMB standard A–D)
    let opts = (q.options || []).slice(0, 4);
    while (opts.length < 4) opts.push('—');

    // Remap correct index safely
    let correct = q.correct;
    if (typeof correct !== 'number' || correct < 0 || correct > 3) correct = 0;

    // Clean question text of underline HTML tags
    const cleanQ = String(q.question)
      .replace(/<u>/g, '').replace(/<\/u>/g, '')
      .replace(/\r/g, '')
      .trim();

    // Normalize image path to "/images/xxx.jpg"
    let img = null;
    if (q.image) {
      const base = path.basename(q.image);
      img = `/images/${base}`;
    }

    all.push({
      id: q.id || `${subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${total}`,
      subject,
      question: cleanQ,
      optionA: opts[0], optionB: opts[1], optionC: opts[2], optionD: opts[3],
      correct,
      year: q.year || '',
      image: img
    });
    total++;
  }
}

const added = insertMany(all);
console.log(`✅ Seeded ${added} / ${total} questions`);

const subjects = db.prepare(`
  SELECT subject, COUNT(*) c FROM questions GROUP BY subject ORDER BY subject
`).all();
console.log('\n📚 Subjects loaded:');
subjects.forEach(s => console.log(`   • ${s.subject} — ${s.c} questions`));
