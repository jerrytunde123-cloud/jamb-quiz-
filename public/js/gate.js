(function () {
  const gate = document.getElementById('gate');
  const gateBtn = document.getElementById('gateBtn');
  const gateSkip = document.getElementById('gateSkip');
  const countdownEl = document.getElementById('countdown');

  function openGate(subject) {
    gate.classList.remove('hidden');
    let seconds = 5;
    gateSkip.disabled = true;
    countdownEl.textContent = seconds;

    const timer = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(timer);
        gateSkip.disabled = false;
        gateSkip.textContent = 'Continue to Quiz';
      }
    }, 1000);

    gateBtn.onclick = () => {
      // user clicked join (opened channel in new tab)
      gateBtn.classList.add('done');
      // allow them to proceed immediately
      setTimeout(() => {
        gate.classList.add('hidden');
        window.location.href = `/quiz.html?subject=${encodeURIComponent(subject)}`;
      }, 800);
    };

    gateSkip.onclick = () => {
      gate.classList.add('hidden');
      window.location.href = `/quiz.html?subject=${encodeURIComponent(subject)}`;
    };
  }

  window.__gate = { openGate };
})();
