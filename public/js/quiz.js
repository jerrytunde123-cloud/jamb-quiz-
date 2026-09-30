const params = new URLSearchParams(location.search);
const subject = params.get('subject');
document.title = `${subject} — UTME LAB`;

let quiz = null;
let current = 0;
let answers = {};
let startTime = Date.now();
let timeLeft = 300; // 5 minutes
let timerInterval = null;

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

  document.getElementById('questionText').innerHTML = q.question;

  // Image handling
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

async function submitQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: quiz.quizId,
        answers,
        timeTaken
      })
    });
    const result = await res.json();

    document.getElementById('resultScore').textContent =
      `${result.score} / ${result.total}`;

    document.getElementById('resultTitle').textContent =
      result.score >= 8 ? '🏆 Excellent!' :
      result.score >= 5 ? '👍 Good effort!' : '📚 Keep practising!';

    document.getElementById('resultMsg').textContent =
      `You took ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s.`;

    document.getElementById('retakeBtn').href =
      `/quiz.html?subject=${encodeURIComponent(subject)}&t=${Date.now()}`;

    document.getElementById('resultModal').classList.remove('hidden');
  } catch (e) {
    alert('Failed to submit quiz');
    console.error(e);
  }
}

loadQuiz();
