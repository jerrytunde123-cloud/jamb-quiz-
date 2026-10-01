(function () {
  const gate = document.getElementById('gate');
  const continueBtn = document.getElementById('continueBtn');
  const ch1Btn = document.getElementById('ch1Btn');
  const ch2Btn = document.getElementById('ch2Btn');
  const ch1Timer = document.getElementById('ch1Timer');
  const ch2Timer = document.getElementById('ch2Timer');

  const nicknameModal = document.getElementById('nicknameModal');
  const nicknameInput = document.getElementById('nicknameInput');
  const nicknameSave = document.getElementById('nicknameSave');

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

  ch1Btn.addEventListener('click', (e) => {
    startChannelTimer('ch1', ch1Timer);
    ch1Btn.classList.add('done');
    // Deep link: try whatsapp:// first, fallback to web
    handleWhatsAppDeepLink(e, ch1Btn.href);
  });
  ch2Btn.addEventListener('click', (e) => {
    startChannelTimer('ch2', ch2Timer);
    ch2Btn.classList.add('done');
    handleWhatsAppDeepLink(e, ch2Btn.href);
  });

  // Convert https://whatsapp.com/channel/XXX → whatsapp://channel/XXX for mobile
  function handleWhatsAppDeepLink(e, httpsUrl) {
    const match = httpsUrl.match(/whatsapp\.com\/channel\/([A-Za-z0-9]+)/);
    if (!match) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return; // Desktop → let browser handle

    e.preventDefault();
    const channelCode = match[1];
    const deepLink = `whatsapp://channel/${channelCode}`;

    // Try deep link, then fall back to https after 1.2s
    const fallback = setTimeout(() => {
      window.location.href = httpsUrl;
    }, 1200);

    window.location.href = deepLink;
    // If app opened, clear fallback
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(fallback);
    }, { once: true });
  }

  // Continue → nickname prompt
  continueBtn.addEventListener('click', () => {
    if (continueBtn.disabled) return;
    gate.classList.add('hidden');
    nicknameInput.value = localStorage.getItem('nickname') || '';
    nicknameModal.classList.remove('hidden');
    setTimeout(() => nicknameInput.focus(), 100);
  });

  // Nickname save → go to quiz
  nicknameSave.addEventListener('click', () => {
    const nick = nicknameInput.value.trim() || 'Anonymous';
    localStorage.setItem('nickname', nick);
    nicknameModal.classList.add('hidden');

    const target = pendingSubject
      ? `/quiz.html?subject=${encodeURIComponent(pendingSubject)}`
      : '/';
    window.location.href = target;
  });

  nicknameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nicknameSave.click();
  });

  window.__gate = { openGate };
})();
