(function () {
  const params = new URLSearchParams(location.search);
  const devMode = params.has("dev");
  const kioskMode = params.has("kiosk");

  const body = document.body;
  const prophecyPanel = document.getElementById("prophecy-panel");
  const statusLine = document.getElementById("status-line");
  const heardLine = document.getElementById("heard-line");
  const askBtn = document.getElementById("ask-btn");
  const typeForm = document.getElementById("type-form");
  const questionInput = document.getElementById("question-input");
  const chipsEl = document.getElementById("chips");
  const soundToggle = document.getElementById("sound-toggle");
  const fsToggle = document.getElementById("fullscreen-toggle");
  const voicePicker = document.getElementById("voice-picker");
  const micFallback = document.getElementById("mic-fallback");

  let state = "idle";
  let soundOn = true;
  let userHasClicked = false;
  let audioCtx = null;
  let idleDrone = null;
  let attractTimer = null;
  let attractRepeat = null;
  let thinkTimer = null;
  let thinkRotate = null;
  let errorTimer = null;
  let listenTimer = null;
  let watchdogTimer = null;
  let recognition = null;
  let lastAiCall = 0;
  const AI_COOLDOWN_MS = 5000;
  const AI_TIMEOUT_MS = 6000;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasSpeechIn = !!SpeechRecognition;
  const hasSpeechOut = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);

  try {
    soundOn = localStorage.getItem("oracle-sound") !== "off";
  } catch (_) {}

  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundToggle.textContent = soundOn ? "Sound" : "Muted";

  if (!hasSpeechIn) {
    askBtn.classList.add("hidden");
    micFallback.classList.remove("hidden");
  }

  if (kioskMode) body.classList.add("kiosk-mode");

  Oracle.chips.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = q;
    b.addEventListener("click", () => {
      if (state !== "idle") return;
      askOracle(q);
    });
    chipsEl.appendChild(b);
  });

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  }

  function setBusyUi() {
    const busy = state !== "idle";
    body.classList.toggle("controls-busy", busy);
    askBtn.disabled = busy;
    questionInput.disabled = busy;
    chipsEl.querySelectorAll(".chip").forEach((c) => { c.disabled = busy; });
  }

  function clearWatchdog() {
    if (watchdogTimer) clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }

  function startWatchdog() {
    clearWatchdog();
    watchdogTimer = setTimeout(() => {
      hardReset("The spirits have wandered off. Try again.");
    }, 20000);
  }

  function setState(next) {
    state = next;
    body.dataset.state = next;
    setBusyUi();
    if (next === "idle") {
      clearWatchdog();
      statusLine.textContent = "";
      startIdleDrone();
      scheduleAttract();
    } else {
      startWatchdog();
      stopIdleDrone();
      clearAttract();
    }
    if (next === "error") {
      if (errorTimer) clearTimeout(errorTimer);
      errorTimer = setTimeout(() => setState("idle"), 3000);
    }
  }

  function setProphecyText(text) {
    prophecyPanel.textContent = text;
  }

  function showError(msg) {
    setProphecyText(msg);
    playCreak();
    setState("error");
  }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function startIdleDrone() {
    if (!soundOn || !userHasClicked || !audioCtx) return;
    stopIdleDrone();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = 55;
    g.gain.value = 0.015;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    idleDrone = o;
  }

  function stopIdleDrone() {
    if (idleDrone) {
      try { idleDrone.stop(); } catch (_) {}
      idleDrone = null;
    }
  }

  function playChime() {
    if (!soundOn || !audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 660;
    g.gain.value = 0.06;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    o.stop(audioCtx.currentTime + 0.45);
  }

  function playThunder() {
    if (!soundOn || !audioCtx) return;
    const len = audioCtx.sampleRate * 0.35;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audioCtx.createBufferSource();
    const filt = audioCtx.createBiquadFilter();
    const g = audioCtx.createGain();
    filt.type = "lowpass";
    filt.frequency.value = 400;
    g.gain.value = 0.12;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(g);
    g.connect(audioCtx.destination);
    src.start();
  }

  function playCreak() {
    if (!soundOn || !audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180, audioCtx.currentTime);
    o.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.25);
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.3);
  }

  function clearAttract() {
    if (attractTimer) clearTimeout(attractTimer);
    if (attractRepeat) clearInterval(attractRepeat);
    attractTimer = attractRepeat = null;
  }

  function scheduleAttract() {
    clearAttract();
    if (!soundOn || !userHasClicked) return;
    attractTimer = setTimeout(() => {
      if (state !== "idle") return;
      const line = Oracle.attractLines[Math.floor(Math.random() * Oracle.attractLines.length)];
      speak(line, { attract: true });
      attractRepeat = setInterval(() => {
        if (state !== "idle") return;
        const l = Oracle.attractLines[Math.floor(Math.random() * Oracle.attractLines.length)];
        speak(l, { attract: true });
      }, 60000);
    }, 45000);
  }

  function resetInteractionTimers() {
    userHasClicked = true;
    ensureAudio();
    clearAttract();
    if (state === "idle") scheduleAttract();
  }

  function waitVoices() {
    return new Promise((resolve) => {
      const v = speechSynthesis.getVoices();
      if (v.length) return resolve(v);
      const done = () => {
        speechSynthesis.removeEventListener("voiceschanged", done);
        resolve(speechSynthesis.getVoices());
      };
      speechSynthesis.addEventListener("voiceschanged", done);
      setTimeout(() => resolve(speechSynthesis.getVoices()), 500);
    });
  }

  function pickVoice(voices) {
    const saved = storageGet("oracle-voice");
    if (saved) {
      const hit = voices.find((v) => v.name === saved);
      if (hit) return hit;
    }
    const names = ["Daniel", "Fred", "Alex", "Google UK English Male"];
    for (const n of names) {
      const hit = voices.find((v) => v.name.includes(n));
      if (hit) return hit;
    }
    return voices.find((v) => v.lang.startsWith("en")) || voices[0];
  }

  function populateVoicePicker() {
    if (!hasSpeechOut) return;
    waitVoices().then((voices) => {
      voicePicker.innerHTML = "";
      voices.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        voicePicker.appendChild(opt);
      });
      const chosen = pickVoice(voices);
      if (chosen) voicePicker.value = chosen.name;
    });
  }

  function splitSentences(text) {
    return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  }

  function speak(text, opts = {}) {
    return new Promise((resolve) => {
      if (!text) return resolve();
      const full = String(text);
      if (!hasSpeechOut || !soundOn) {
        setProphecyText(full);
        return resolve();
      }
      try {
        speechSynthesis.cancel();
      } catch (_) {}

      const sentences = splitSentences(full);
      let si = 0;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        resolve();
      };

      const timeout = setTimeout(finish, Math.max(15000, full.length * 120));

      waitVoices().then((voices) => {
        const voice = pickVoice(voices);

        function nextSentence() {
          if (si >= sentences.length) {
            clearTimeout(timeout);
            return finish();
          }
          const sentence = sentences[si++].trim();
          if (!sentence) return nextSentence();

          const words = sentence.split(/\s+/);
          let wi = 0;
          const perWord = Math.max(80, (sentence.length / words.length) * 65);

          const reveal = setInterval(() => {
            if (wi < words.length) {
              wi++;
              setProphecyText(words.slice(0, wi).join(" "));
            }
          }, perWord);

          const u = new SpeechSynthesisUtterance(sentence);
          u.voice = voice;
          u.rate = 0.85;
          u.pitch = 0.6;
          u.onend = () => {
            clearInterval(reveal);
            setProphecyText(sentence);
            nextSentence();
          };
          u.onerror = () => {
            clearInterval(reveal);
            setProphecyText(full);
            clearTimeout(timeout);
            finish();
          };
          try {
            speechSynthesis.speak(u);
          } catch (_) {
            clearInterval(reveal);
            setProphecyText(full);
            clearTimeout(timeout);
            finish();
          }
        }

        if (!opts.attract) setProphecyText("");
        nextSentence();
      }).catch(() => {
        setProphecyText(full);
        clearTimeout(timeout);
        finish();
      });
    });
  }

  async function fetchAiProphecy(question) {
    if (Date.now() - lastAiCall < AI_COOLDOWN_MS) return null;
    lastAiCall = Date.now();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
    try {
      const res = await fetch("/.netlify/functions/prophecy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) return null;
      const data = await res.json();
      return data.text && String(data.text).trim() ? String(data.text).trim() : null;
    } catch (_) {
      clearTimeout(t);
      return null;
    }
  }

  async function resolveAnswer(question) {
    if (Oracle.blocked(question)) {
      return Oracle.answer(question);
    }
    const ai = await fetchAiProphecy(question);
    if (ai) return { category: "ai", text: ai };
    return Oracle.answer(question);
  }

  function stopRecognition() {
    if (listenTimer) clearTimeout(listenTimer);
    listenTimer = null;
    if (recognition) {
      try { recognition.abort(); } catch (_) {}
      recognition = null;
    }
  }

  function startListening() {
    if (!hasSpeechIn || state !== "idle") return;
    resetInteractionTimers();
    heardLine.textContent = "";
    setState("listening");
    playChime();
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    listenTimer = setTimeout(() => {
      stopRecognition();
      if (state === "listening") {
        showError("The spirits heard silence. Try again, or type below.");
      }
    }, 8000);

    recognition.onresult = (ev) => {
      let text = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript;
      }
      heardLine.textContent = text ? `You said: ${text}` : "";
      if (ev.results[ev.results.length - 1].isFinal && text.trim()) {
        stopRecognition();
        runThinkingFlow(text.trim());
      }
    };

    const errors = {
      "not-allowed": "The spirits cannot hear you. Type your question below.",
      "no-speech": "The mists swallowed your words. Try again or type below.",
      "audio-capture": "No microphone found. Type your question below.",
      network: "The ether is unreachable. Type your question below.",
      aborted: "",
      "service-not-allowed": "The spirits cannot hear you. Type your question below.",
    };

    recognition.onerror = (ev) => {
      stopRecognition();
      const msg = errors[ev.error] || "The spirits cannot hear you. Type your question below.";
      if (msg && state === "listening") showError(msg);
      else if (state === "listening") setState("idle");
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    try {
      recognition.start();
    } catch (_) {
      showError("The spirits cannot hear you. Type your question below.");
    }
  }

  function clearThinkTimers() {
    if (thinkTimer) clearTimeout(thinkTimer);
    if (thinkRotate) clearInterval(thinkRotate);
    thinkTimer = thinkRotate = null;
  }

  async function runThinkingFlow(question) {
    clearThinkTimers();
    setState("thinking");
    let li = 0;
    setProphecyText(Oracle.thinkingLines[0]);
    thinkRotate = setInterval(() => {
      li = (li + 1) % Oracle.thinkingLines.length;
      setProphecyText(Oracle.thinkingLines[li]);
    }, 900);

    const delay = 2000 + Math.random() * 1500;
    await new Promise((r) => { thinkTimer = setTimeout(r, delay); });

    clearThinkTimers();
    let result;
    try {
      result = await resolveAnswer(question);
    } catch (_) {
      result = Oracle.answer(question);
    }
    if (result.category === "blocked") {
      setProphecyText(result.text);
      playCreak();
      setState("error");
      return;
    }
    playThunder();
    setState("speaking");
    try {
      await speak(result.text);
    } catch (_) {
      setProphecyText(result.text);
    }
    setState("idle");
  }

  function askOracle(question) {
    if (state !== "idle") return;
    resetInteractionTimers();
    runThinkingFlow(String(question ?? "").trim());
  }

  function hardReset(msg) {
    try { speechSynthesis.cancel(); } catch (_) {}
    stopRecognition();
    clearThinkTimers();
    if (msg) setProphecyText(msg);
    setState("idle");
  }

  askBtn.addEventListener("click", () => {
    if (state !== "idle") return;
    if (hasSpeechIn) startListening();
    else askOracle(questionInput.value);
  });

  typeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state !== "idle") return;
    askOracle(questionInput.value);
    questionInput.value = "";
  });

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.textContent = soundOn ? "Sound" : "Muted";
    storageSet("oracle-sound", soundOn ? "on" : "off");
    if (!soundOn) {
      try { speechSynthesis.cancel(); } catch (_) {}
      stopIdleDrone();
      clearAttract();
    } else if (state === "idle") {
      startIdleDrone();
      scheduleAttract();
    }
  });

  fsToggle.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  voicePicker.addEventListener("change", () => {
    storageSet("oracle-voice", voicePicker.value);
  });

  document.addEventListener("keydown", (e) => {
    if (e.target === questionInput) return;
    if (devMode && e.key >= "1" && e.key <= "5") {
      const map = ["idle", "listening", "thinking", "speaking", "error"];
      setState(map[Number(e.key) - 1]);
      return;
    }
    if (e.key === "r" || e.key === "R") {
      hardReset(prophecyPanel.textContent);
      return;
    }
    if (e.key === "m" || e.key === "M") {
      soundToggle.click();
      return;
    }
    if (e.key === "f" || e.key === "F") {
      fsToggle.click();
      return;
    }
    if (e.key === " " && state === "idle" && hasSpeechIn) {
      e.preventDefault();
      startListening();
    }
  });

  if (kioskMode) {
    let hideCur;
    document.addEventListener("mousemove", () => {
      body.classList.remove("kiosk-mode");
      clearTimeout(hideCur);
      hideCur = setTimeout(() => body.classList.add("kiosk-mode"), 3000);
    });
  }

  populateVoicePicker();
  setState("idle");
})();
