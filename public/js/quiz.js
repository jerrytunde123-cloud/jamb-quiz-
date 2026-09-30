const params = new URLSearchParams(location.search);
const subject = params.get('subject');
document.title = `${subject} — UTME LAB`;

let quiz = null;
let current = 0;
let answers = {};
let startTime = Date.now();
let timeLeft = 300; // 5 minutes
let timerInterval;

async function loadQuiz() {
  const res = await fetch(`/api/quiz/${encodeURIComponent(subject)}`);
  quiz = await res.json();
  render();
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
    if (timeLeft <= 30) document.getElementById('timer').classList.add('danger');
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function render() {
  const q = quiz.questions[current];
  document.getElementById('qCounter').textContent = `Q ${current + 1} / ${quiz.questions.length}`;
  document.getElementById('progress').style.width = `${((current + 1) / quiz.questions.length) * 100}%`;

  document.getElementById('questionText').innerHTML = q.question;

  const letters = ['A', 'B', 'C', 'D'];
  const opts = [q.optionA, q.optionB, q.optionC, q.optionD];

  document.getElementById('options').innerHTML = opts.map((o, i) => `
    <button class="option ${answers[q.id] === i ? 'selected' : ''}" data-idx="${i}">
      <span class="letter">${letters[i]}</span>
      <span class="opt-text">${o}</span>
    </button>
  `).join('');

  document.querySelectorAll('.option').forEach(btn => {
    btn.onclick = () => {
      answers[q.id] = parseInt(btn.dataset.idx);
      render();
    };
  });

  document.getElementById('prevBtn').disabled = current === 0;
  const isLast = current === quiz.questions.length - 1;
  document.getElementById('nextBtn').classList.toggle('hidden', isLast);
  document.getElementById('submitBtn').classList.toggle('hidden', !isLast);
}

document.getElementById('prevBtn').onclick = () => { if (current > 0) { current--; render(); } };
document.getElementById('nextBtn').onclick = () => { if (current < quiz.questions.length - 1) { current++; render(); } };
document.getElementById('submitBtn').onclick = submitQuiz;

async function submitQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId: quiz.quizId, answers, timeTaken })
  });
  const result = await res.json();

  document.getElementById('resultScore').textContent = `${result.score} / ${result.total}`;
  document.getElementById('resultTitle').textContent =
    result.score >= 8 ? '🏆 Excellent!' :
    result.score >= 5 ? '👍 Good effort!' : '📚 Keep practising!';
  document.getElementById('resultMsg').textContent =
    `You took ${Math.floor(timeTaken/60)}m ${timeTaken%60}s.`;
  document.getElementById('retakeBtn').href =
    `/quiz.html?subject=${encodeURIComponent(subject)}&t=${Date.now()}`;
  document.getElementById('resultModal').classList.remove('hidden');
}

loadQuiz();
