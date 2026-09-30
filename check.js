const db = require('./database');
const rows = db.prepare('SELECT * FROM questions LIMIT 2').all();
console.log(JSON.stringify(rows, null, 2));
