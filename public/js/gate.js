(function () {
  const gate = document.getElementById('gate');
  const gateBtn = document.getElementById('gateBtn');
  const gateSkip = document.getElementById('gateSkip');
  const countdownEl = document.getElementById('countdown');

  let timer = null;

  function openGate(subject) {
    gate.classList.remove('hidden');
    let seconds = 5;
    gateSkip.disabled = true;
    countdownEl.textContent = seconds;

    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(timer);
        gateSkip.disabled = false;
        gateSkip.textContent = 'Continue to Quiz';
      }
    }, 1000);

    gateBtn.onclick = (e) => {
      e.preventDefault();
      window.open(gateBtn.href, '_blank');
      gateBtn.classList.add('done');
      setTimeout(() => {
        gate.classList.add('hidden');
        window.location.href = `/quiz.html?subject=${encodeURIComponent(subject)}`;
      }, 700);
    };

    gateSkip.onclick = () => {
      gate.classList.add('hidden');
      window.location.href = `/quiz.html?subject=${encodeURIComponent(subject)}`;
    };
  }

  window.__gate = { openGate };
})();
