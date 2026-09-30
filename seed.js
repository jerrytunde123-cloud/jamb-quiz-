const fs = require('fs');
const db = require('./database');

const bank = JSON.parse(fs.readFileSync('./question-bank.json', 'utf8'));

const insert = db.prepare(`
  INSERT OR REPLACE INTO questions
  (id, subject, question, optionA, optionB, optionC, optionD, correct, year, image)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let total = 0;
for (const key in bank) {
  const subject = bank[key].name;
  for (const q of bank[key].questions) {
    let opts = q.options.slice(0, 4);
    while (opts.length < 4) opts.push('—');

    // Remap correct index if it pointed beyond 3
    let correct = q.correct;
    if (correct > 3) correct = 0; // fallback safety

    insert.run(
      q.id,
      subject,
      q.question.replace(/<u>/g, '').replace(/<\/u>/g, ''), // strip underline tags
      opts[0], opts[1], opts[2], opts[3],
      correct,
      q.year || '',
      q.image || null
    );
    total++;
  }
}
console.log(`✅ Seeded ${total} questions.`);
console.log('Subjects:', Object.values(bank).map(s => s.name).join(', '));
