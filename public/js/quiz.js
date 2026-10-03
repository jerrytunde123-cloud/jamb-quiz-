const params = new URLSearchParams(location.search);
const subject = params.get('subject');
document.title = `${subject} — UTME LAB`;

let quiz = null;
let current = 0;
let answers = {};
let startTime = Date.now();
let timeLeft = 300;
let timerInterval = null;
let submittedResult = null; // store for review

const nickname = localStorage.getItem('nickname') || 'Anonymous';
document.getElementById('nicknameBadge').textContent = `👤 ${nickname}`;

/* ==========================================================
   KATEX RENDERING
   ========================================================== */
function renderMath(el) {
  if (!el) return;
  if (typeof renderMathInElement !== 'function') {
    // KaTeX hasn't loaded yet — retry once
    setTimeout(() => renderMath(el), 150);
    return;
  }
  try {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false,
      errorColor: '#ef4444'
    });
  } catch (e) {
    console.warn('KaTeX render error:', e);
  }
}

/* ==========================================================
   QUIZ LOAD
   ========================================================== */
async function loadQuiz() {
  if (!subject) {
    alert('No subject specified');
    location.href = '/';
    return;
  }

  try {
    const res = await fetch(`/api/quiz/${encodeURIComponent(subject)}`);
    if (!res.ok) throw new Error('Failed to load quiz');
    quiz = await res.json();
    render();
    startTimer();
  } catch (e) {
    document.getElementById('questionText').textContent = 'Failed to load quiz. Please retry.';
    console.error(e);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${m}:${s}`;
    if (timeLeft <= 30) timerEl.classList.add('danger');
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function render() {
  const q = quiz.questions[current];

  document.getElementById('qCounter').textContent =
    `Q ${current + 1} / ${quiz.questions.length}`;
  document.getElementById('progress').style.width =
    `${((current + 1) / quiz.questions.length) * 100}%`;

  // Render question with KaTeX
  const qText = document.getElementById('questionText');
  qText.innerHTML = q.question;
  renderMath(qText);

  const imgBox = document.getElementById('questionImage');
  if (q.image) {
    imgBox.innerHTML = `<img src="${q.image}" alt="Question diagram" loading="lazy" onerror="this.parentElement.classList.add('hidden')">`;
    imgBox.classList.remove('hidden');
  } else {
    imgBox.innerHTML = '';
    imgBox.classList.add('hidden');
  }

  const letters = ['A', 'B', 'C', 'D'];
  const opts = [q.optionA, q.optionB, q.optionC, q.optionD];

  const optionsBox = document.getElementById('options');
  optionsBox.innerHTML = opts.map((o, i) => `
    <button class="option ${answers[q.id] === i ? 'selected' : ''}" data-idx="${i}">
      <span class="letter">${letters[i]}</span>
      <span class="opt-text">${o}</span>
    </button>
  `).join('');

  // Render each option with KaTeX
  optionsBox.querySelectorAll('.opt-text').forEach(el => renderMath(el));

  optionsBox.querySelectorAll('.option').forEach(btn => {
    btn.onclick = () => {
      answers[q.id] = parseInt(btn.dataset.idx);
      render();
    };
  });

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  prevBtn.disabled = current === 0;
  const isLast = current === quiz.questions.length - 1;
  nextBtn.classList.toggle('hidden', isLast);
  submitBtn.classList.toggle('hidden', !isLast);
}

document.getElementById('prevBtn').onclick = () => {
  if (current > 0) { current--; render(); }
};
document.getElementById('nextBtn').onclick = () => {
  if (current < quiz.questions.length - 1) { current++; render(); }
};
document.getElementById('submitBtn').onclick = submitQuiz;

/* ==========================================================
   SUBMIT
   ========================================================== */
async function submitQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: quiz.quizId, answers, timeTaken, nickname })
    });
    const result = await res.json();
    submittedResult = result;

    document.getElementById('resultScore').textContent =
      `${result.score} / ${result.total}`;

    document.getElementById('resultTitle').textContent =
      result.score >= 12 ? '🏆 Excellent!' :
      result.score >= 8  ? '👍 Good effort!' : '📚 Keep practising!';

    document.getElementById('resultMsg').textContent =
      `You took ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s.`;

    const key = 'best_' + subject;
    const prevBest = parseInt(localStorage.getItem(key) || '0');
    const pct = Math.round((result.score / result.total) * 100);
    const bestEl = document.getElementById('personalBest');
    if (pct > prevBest) {
      localStorage.setItem(key, pct);
      bestEl.innerHTML = `<i class="fas fa-trophy" style="color:#f5a623"></i> New personal best! ${pct}%`;
    } else if (prevBest > 0) {
      bestEl.innerHTML = `Personal best: ${prevBest}%`;
    }

    document.getElementById('retakeBtn').href =
      `/quiz.html?subject=${encodeURIComponent(subject)}&t=${Date.now()}`;

    const slug = subject.toLowerCase().replace(/\s+/g, '-');
    const shareUrl = `${location.origin}/s/${slug}`;
    const shareText = `I scored ${result.score}/${result.total} in ${subject} on UTME LAB! Try it:`;
    document.getElementById('shareWaBtn').href =
      `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

    document.getElementById('resultModal').classList.remove('hidden');

    loadLeaderboard();
    loadComments();
    setupCommentForm();
    setupTabs();
    setupReview();
  } catch (e) {
    alert('Failed to submit quiz');
    console.error(e);
  }
}

/* ==========================================================
   REVIEW
   ========================================================== */
function setupReview() {
  document.getElementById('reviewBtn').onclick = openReview;
  document.getElementById('reviewClose').onclick = closeReview;
  document.getElementById('reviewBackBtn').onclick = closeReview;
}

function openReview() {
  document.getElementById('resultModal').classList.add('hidden');
  document.getElementById('reviewModal').classList.remove('hidden');

  const list = document.getElementById('reviewList');
  const letters = ['A', 'B', 'C', 'D'];
  let correctCount = 0;

  list.innerHTML = quiz.questions.map((q, i) => {
    const userAns = answers[q.id];
    // We don't have "correct" from the client, so we need the server to return it.
    // Since we don't, we send the answers with the quiz so the server can grade.
    // Fallback: we use the answers the server already graded against.
    return ''; // Placeholder — replaced by async load below
  }).join('');

  // Fetch correct answers from server
  fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: subject,
      questionIds: quiz.questions.map(q => q.id)
    })
  })
    .then(r => r.json())
    .then(data => {
      const keyMap = {};
      (data.answers || []).forEach(a => { keyMap[a.id] = a.correct; });

      list.innerHTML = quiz.questions.map((q, i) => {
        const userAns = answers[q.id];
        const correctIdx = keyMap[q.id];
        const isCorrect = userAns === correctIdx;
        const isSkipped = userAns === undefined;
        if (isCorrect) correctCount++;

        const opts = [q.optionA, q.optionB, q.optionC, q.optionD];
        const userLetter = isSkipped ? '—' : letters[userAns];
        const correctLetter = letters[correctIdx];

        return `
          <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
            <div class="review-q-header">
              <span class="review-num">Q${i + 1}</span>
              <span class="review-tag ${isCorrect ? 'ok' : 'bad'}">
                ${isCorrect ? '✓ Correct' : (isSkipped ? '⊘ Skipped' : '✗ Wrong')}
              </span>
            </div>
            <div class="review-question"></div>
            ${q.image ? `<img class="review-img" src="${q.image}" onerror="this.style.display='none'">` : ''}
            <div class="review-options">
              ${opts.map((o, oi) => {
                let cls = '';
                if (oi === correctIdx) cls = 'correct-opt';
                else if (oi === userAns) cls = 'wrong-opt';
                return `
                  <div class="review-opt ${cls}">
                    <span class="letter">${letters[oi]}</span>
                    <span class="opt-text"></span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="review-answer-line">
              Your answer: <strong>${userLetter}</strong> ·
              Correct answer: <strong style="color:#22c55e">${correctLetter}</strong>
            </div>
          </div>
        `;
      }).join('');

      // Now insert text + render math for each review item
      const items = list.querySelectorAll('.review-item');
      items.forEach((item, i) => {
        const q = quiz.questions[i];
        const qEl = item.querySelector('.review-question');
        qEl.textContent = q.question;
        renderMath(qEl);

        const optEls = item.querySelectorAll('.review-opt .opt-text');
        const opts = [q.optionA, q.optionB, q.optionC, q.optionD];
        optEls.forEach((el, oi) => {
          el.textContent = opts[oi];
          renderMath(el);
        });
      });

      document.getElementById('reviewSummary').textContent =
        `You got ${correctCount} out of ${quiz.questions.length} correct.`;
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = '<p style="color:var(--danger)">Failed to load review.</p>';
    });
}

function closeReview() {
  document.getElementById('reviewModal').classList.add('hidden');
  document.getElementById('resultModal').classList.remove('hidden');
}

/* ==========================================================
   LEADERBOARD + COMMENTS
   ========================================================== */
async function loadLeaderboard() {
  const el = document.getElementById('leaderboard');
  try {
    const r = await fetch(`/api/leaderboard/${encodeURIComponent(subject)}`);
    const rows = await r.json();
    if (!rows.length) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;">Be the first on the leaderboard!</p>';
      return;
    }
    el.innerHTML = rows.map((r, i) => `
      <div class="lb-row ${r.nickname === nickname ? 'me' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${r.nickname}</span>
        <span class="lb-score">${r.score}/${r.total}</span>
        <span class="lb-time">${Math.floor(r.time_taken/60)}m ${r.time_taken%60}s</span>
      </div>
    `).join('');
  } catch {
    el.innerHTML = '<p style="color:var(--danger)">Failed to load.</p>';
  }
}

async function loadComments() {
  const el = document.getElementById('commentList');
  try {
    const r = await fetch(`/api/comments/${encodeURIComponent(subject)}`);
    const rows = await r.json();
    if (!rows.length) {
      el.innerHTML = '<p style="color:var(--muted);text-align:center;padding:10px;">No comments yet.</p>';
      return;
    }
    el.innerHTML = rows.map(c => `
      <div class="comment-row">
        <strong>${c.name}</strong>
        <p>${c.message}</p>
      </div>
    `).join('');
  } catch {}
}

function setupCommentForm() {
  const btn = document.getElementById('commentSend');
  const input = document.getElementById('commentMsg');
  btn.onclick = async () => {
    const msg = input.value.trim();
    if (!msg) return;
    btn.disabled = true;
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, name: nickname, message: msg })
    });
    input.value = '';
    btn.disabled = false;
    loadComments();
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
}

function setupTabs() {
  document.querySelectorAll('.tabs-mini button').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.tabs-mini button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('pane-lb').classList.toggle('hidden', b.dataset.pane !== 'lb');
      document.getElementById('pane-cm').classList.toggle('hidden', b.dataset.pane !== 'cm');
    };
  });
}

loadQuiz();
