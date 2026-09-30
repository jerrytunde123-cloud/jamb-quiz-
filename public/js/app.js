const subjectIcons = {
  "English Language": "fa-font",
  "Mathematics": "fa-calculator",
  "Physics": "fa-atom",
  "Chemistry": "fa-flask",
  "Biology": "fa-dna",
  "Economics": "fa-chart-line",
  "Government": "fa-gavel",
  "Literature in English": "fa-feather-alt",
  "Christian Religious Studies": "fa-bible",
  "Geography": "fa-globe-africa",
  "Commerce": "fa-store",
  "Financial Accounting": "fa-coins",
  "Agricultural Science": "fa-leaf",
  "Animal Husbandry": "fa-paw",
  "Arabic": "fa-language",
  "Catering Craft Practice": "fa-utensils",
  "Civic Education": "fa-landmark",
  "Computer Studies": "fa-laptop-code",
  "Data Processing": "fa-database",
  "Fine Arts": "fa-palette",
  "French": "fa-language",
  "Further Mathematics": "fa-square-root-variable",
  "Hausa": "fa-language",
  "History": "fa-landmark",
  "Home Economics": "fa-home",
  "Igbo": "fa-language",
  "Insurance": "fa-shield-alt",
  "Islamic Religious Knowledge": "fa-moon",
  "Marketing": "fa-bullhorn",
  "Music": "fa-music",
  "Office Practice": "fa-briefcase",
  "Physical Education": "fa-running",
  "Yoruba": "fa-language"
};

fetch('/api/subjects')
  .then(r => r.json())
  .then(list => {
    const wrap = document.getElementById('subjects');
    if (!list.length) {
      wrap.innerHTML = '<p style="color:var(--muted)">No subjects loaded. Run <code>npm run seed</code> first.</p>';
      return;
    }
    wrap.innerHTML = list.map(s => `
      <div class="subject-card" data-subject="${s.subject}">
        <div class="icon"><i class="fa-solid ${subjectIcons[s.subject] || 'fa-book'}"></i></div>
        <h4>${s.subject}</h4>
        <span>${s.count} questions</span>
      </div>
    `).join('');

    document.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        const subject = card.dataset.subject;
        window.__gate.openGate(subject);
      });
    });
  })
  .catch(err => {
    document.getElementById('subjects').innerHTML =
      '<p style="color:var(--danger)">Failed to load subjects. Is the server running?</p>';
    console.error(err);
  });
