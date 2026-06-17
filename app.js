const startDate = new Date("2024-02-14T00:00:00");

const modeCopy = {
  anniversary: "谢谢你和我一起，把一年里很多不起眼的小事，过成了只属于我们的纪念。",
  birthday: "愿你新的一岁仍然明亮自由，也愿我能把偏爱和耐心，都稳稳放在你身边。",
  confession: "我想把喜欢说得清楚一点：不是一阵热闹，是我认真想靠近你的决定。",
  apology: "对不起让你难过了。比起争输赢，我更想学会好好接住你的感受。",
  surprise: "今天不需要特别的理由，只是想突然告诉你：你一直都很值得被认真爱着。"
};

const secretLines = [
  "我把最认真、最偏心、最想靠近你的部分，都留给了你。",
  "暗号收到：从现在开始，今天的月亮也站在你这边。",
  "隐藏信件已打开：我会在很多很多普通日子里，继续选择你。"
];

const daysTogether = document.querySelector("#daysTogether");
const modeLine = document.querySelector("#modeLine");
const modeButtons = document.querySelectorAll(".mode-chip");
const letterText = document.querySelector("#letterText");
const saveLetter = document.querySelector("#saveLetter");
const printLetter = document.querySelector("#printLetter");
const heartButton = document.querySelector("#heartButton");
const secretMessage = document.querySelector("#secretMessage");
const sparkButton = document.querySelector("#sparkButton");
const musicToggle = document.querySelector("#musicToggle");
const toast = document.querySelector("#toast");
const canvas = document.querySelector("#ambientCanvas");
const ctx = canvas.getContext("2d");

let audioContext;
let musicTimer;
let heartClicks = 0;
let secretBuffer = "";
let toastTimer;
let particles = [];

function setDaysTogether() {
  const today = new Date();
  const diff = today.getTime() - startDate.getTime();
  const days = Math.max(1, Math.floor(diff / 86400000));
  daysTogether.textContent = String(days).padStart(3, "0");
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setMode(mode) {
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  modeLine.textContent = modeCopy[mode];
}

function savePhoto(index, file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("请选择一张图片。");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    localStorage.setItem(`love-photo-${index}`, reader.result);
    renderPhoto(index, reader.result);
    showToast("照片已放进相框。");
  });
  reader.readAsDataURL(file);
}

function renderPhoto(index, source) {
  const image = document.querySelector(`[data-photo-img="${index}"]`);
  if (!image) return;

  image.src = source;
  image.closest(".photo-frame").classList.add("has-image");
}

function loadSavedState() {
  const savedLetter = localStorage.getItem("love-letter-text");
  if (savedLetter) {
    letterText.value = savedLetter;
  }

  for (let index = 0; index < 4; index += 1) {
    const source = localStorage.getItem(`love-photo-${index}`);
    if (source) renderPhoto(index, source);
  }
}

function revealSecret(index = 0) {
  secretMessage.textContent = secretLines[index % secretLines.length];
  secretMessage.classList.add("is-visible");
  heartButton.classList.add("is-awake");
  createParticles(window.innerWidth / 2, window.innerHeight * 0.58, 42);
}

function playNote(frequency, startTime, duration) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function scheduleMusic() {
  const notes = [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 392];
  let step = 0;

  musicTimer = setInterval(() => {
    const now = audioContext.currentTime;
    playNote(notes[step % notes.length], now, 1.1);
    playNote(notes[(step + 2) % notes.length] / 2, now + 0.05, 1.2);
    step += 1;
  }, 760);
}

async function toggleMusic() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "播放音乐");
    showToast("音乐已暂停。");
    return;
  }

  scheduleMusic();
  musicToggle.classList.add("is-playing");
  musicToggle.setAttribute("aria-label", "暂停音乐");
  showToast("一小段柔和的旋律开始了。");
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createParticles(x, y, count = 24) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.6 + Math.random() * 2.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.6,
      life: 80 + Math.random() * 40,
      size: 1.2 + Math.random() * 2.8
    });
  }
}

function paintParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.012;
    particle.life -= 1;

    const alpha = Math.max(0, particle.life / 120);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 210, 191, ${alpha})`;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(paintParticles);
}

function setupReveal() {
  const elements = document.querySelectorAll(
    ".modes, .section-heading, .photo-frame, .timeline li, .letter-paper, .secret-section > *"
  );

  elements.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  elements.forEach((element) => observer.observe(element));
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll("[data-photo]").forEach((input) => {
  input.addEventListener("change", (event) => {
    savePhoto(event.target.dataset.photo, event.target.files[0]);
    event.target.value = "";
  });
});

saveLetter.addEventListener("click", () => {
  localStorage.setItem("love-letter-text", letterText.value);
  showToast("留言已保存在当前浏览器。");
});

printLetter.addEventListener("click", () => {
  window.print();
});

heartButton.addEventListener("click", () => {
  heartClicks += 1;
  if (heartClicks >= 5) {
    revealSecret(heartClicks);
    heartClicks = 0;
  } else {
    createParticles(window.innerWidth / 2, window.innerHeight / 2, 10);
  }
});

sparkButton.addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
  showToast("这一点光，先替我抱抱你。");
});

musicToggle.addEventListener("click", toggleMusic);

window.addEventListener("keydown", (event) => {
  if (event.key.length !== 1) return;
  secretBuffer = `${secretBuffer}${event.key.toLowerCase()}`.slice(-8);
  if (secretBuffer.includes("love") || secretBuffer.includes("520")) {
    revealSecret(1);
    secretBuffer = "";
  }
});

window.addEventListener("resize", resizeCanvas);

setDaysTogether();
loadSavedState();
resizeCanvas();
paintParticles();
setupReveal();
