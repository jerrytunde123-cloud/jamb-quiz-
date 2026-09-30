(function () {
  const gate = document.getElementById('gate');
  const continueBtn = document.getElementById('continueBtn');
  const ch1Btn = document.getElementById('ch1Btn');
  const ch2Btn = document.getElementById('ch2Btn');
  const ch1Timer = document.getElementById('ch1Timer');
  const ch2Timer = document.getElementById('ch2Timer');

  let pendingSubject = null;
  const state = {
    ch1: { tapped: false, ready: false, timer: null },
    ch2: { tapped: false, ready: false, timer: null }
  };

  function startChannelTimer(chKey, el) {
    if (state[chKey].tapped) return;
    state[chKey].tapped = true;

    let seconds = 5;
    el.textContent = seconds + 's';
    el.style.display = 'inline-block';

    state[chKey].timer = setInterval(() => {
      seconds--;
      el.textContent = seconds + 's';
      if (seconds <= 0) {
        clearInterval(state[chKey].timer);
        state[chKey].ready = true;
        el.textContent = '✓';
        el.classList.add('done');
        checkUnlock();
      }
    }, 1000);
  }

  function checkUnlock() {
    if (state.ch1.ready && state.ch2.ready) {
      continueBtn.disabled = false;
      continueBtn.classList.add('unlocked');
      continueBtn.innerHTML = '<i class="fas fa-unlock"></i> Continue to Quiz';
    }
  }

  function resetGate() {
    Object.values(state).forEach(s => { if (s.timer) clearInterval(s.timer); });
    state.ch1 = { tapped: false, ready: false, timer: null };
    state.ch2 = { tapped: false, ready: false, timer: null };

    [ch1Timer, ch2Timer].forEach(el => {
      el.textContent = '';
      el.classList.remove('done');
      el.style.display = 'none';
    });
    ch1Btn.classList.remove('done');
    ch2Btn.classList.remove('done');
    continueBtn.disabled = true;
    continueBtn.classList.remove('unlocked');
    continueBtn.innerHTML = '<i class="fas fa-lock"></i> Continue to Quiz';
  }

  function openGate(subject) {
    pendingSubject = subject;
    resetGate();
    gate.classList.remove('hidden');
  }

  ch1Btn.addEventListener('click', () => {
    startChannelTimer('ch1', ch1Timer);
    ch1Btn.classList.add('done');
  });
  ch2Btn.addEventListener('click', () => {
    startChannelTimer('ch2', ch2Timer);
    ch2Btn.classList.add('done');
  });

  continueBtn.addEventListener('click', () => {
    if (continueBtn.disabled) return;
    gate.classList.add('hidden');
    const target = pendingSubject
      ? `/quiz.html?subject=${encodeURIComponent(pendingSubject)}`
      : '/';
    window.location.href = target;
  });

  window.__gate = { openGate };
})();
