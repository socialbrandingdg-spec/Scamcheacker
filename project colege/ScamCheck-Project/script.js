const input = document.getElementById("messageInput");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const clearHistoryBtn = document.getElementById("clearHistory");
const warningList = document.getElementById("warningList");
const adviceList = document.getElementById("adviceList");
const scoreValue = document.getElementById("scoreValue");
const scoreRing = document.getElementById("scoreRing");
const riskTitle = document.getElementById("riskTitle");
const riskDescription = document.getElementById("riskDescription");
const statusBadge = document.getElementById("statusBadge");
const historyList = document.getElementById("historyList");

const rules = [
  {
    id: "urgency",
    patterns: [/\b(immediately|urgent|urgently|act now|right now|hurry|today|within \d+ hours?|expires? today|last chance)\b/i],
    points: 15,
    title: "Creates urgency or pressure",
    detail: "Scammers often push you to act quickly so you do not have time to verify the claim."
  },
  {
    id: "prize",
    patterns: [/\b(you (have )?won|winner|won|cash prize|lottery|reward|congratulations|lucky draw|prize)\b/i],
    points: 22,
    title: "Unexpected prize or reward",
    detail: "Unexpected winnings are a common social-engineering lure, especially when payment or personal information is requested."
  },
  {
    id: "otp",
    patterns: [/\b(otp|one[- ]time password|verification code|security code)\b/i],
    points: 24,
    title: "Requests an OTP or verification code",
    detail: "Never share an OTP with someone who contacted you unexpectedly."
  },
  {
    id: "payment",
    patterns: [/\b(send|pay|transfer|deposit|fee|payment|upi|bank details|account number|card number|cvv|pin)\b/i],
    points: 18,
    title: "Requests money or financial details",
    detail: "Requests for money, card details, PINs or bank information deserve careful verification."
  },
  {
    id: "kyc",
    patterns: [/\b(kyc|pan card|aadhaar|aadhar|verify your account|account will be blocked|account will be suspended)\b/i],
    points: 19,
    title: "Uses account/KYC threat language",
    detail: "Fake KYC and account-blocking messages are frequently used to create fear and force quick action."
  },
  {
    id: "link",
    patterns: [/(https?:\/\/|www\.)/i],
    points: 12,
    title: "Contains a clickable web link",
    detail: "Do not open unexpected links. Check the domain carefully and navigate through the organisation's official site instead."
  },
  {
    id: "impersonation",
    patterns: [/\b(bank|sbi|hdfc|icici|axis|paytm|phonepe|google|amazon|flipkart|police|income tax|government|customs|courier)\b/i],
    points: 9,
    title: "Mentions a trusted organisation",
    detail: "A brand name alone does not prove authenticity. Verify the message through an official channel."
  },
  {
    id: "credential",
    patterns: [/\b(password|username|login|sign in|credentials|secret|security answer)\b/i],
    points: 20,
    title: "Requests login or secret information",
    detail: "Legitimate services generally should not ask you to disclose passwords or secret credentials by message."
  }
];

function analyzeMessage(text) {
  const detected = [];
  let score = 0;

  for (const rule of rules) {
    const matched = rule.patterns.some(pattern => pattern.test(text));
    if (matched) {
      score += rule.points;
      detected.push(rule);
    }
  }

  // Additional signals
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    score += 5;
    detected.push({
      id: "exclamation",
      title: "Heavy use of exclamation marks",
      detail: "Strong emotional punctuation can be used to create excitement or pressure."
    });
  }

  const upperWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (upperWords.length >= 3) {
    score += 5;
    detected.push({
      id: "caps",
      title: "Unusually aggressive formatting",
      detail: "Repeated capitalisation can be used to make a message feel more urgent."
    });
  }

  score = Math.min(100, score);

  let level, title, description, advice;
  if (score >= 60) {
    level = "high";
    title = "High risk — pause before acting";
    description = "This message contains several common scam indicators. Do not click links, send money or share sensitive information until you independently verify it.";
    advice = [
      "Do not click links or download attachments from the message.",
      "Never share OTPs, passwords, PINs or card security codes.",
      "Contact the organisation using its official website or known phone number.",
      "If you already shared financial information, contact your bank/service provider immediately."
    ];
  } else if (score >= 30) {
    level = "medium";
    title = "Medium risk — verify independently";
    description = "There are some warning signs. The message may be legitimate, but verify the sender and request through an official channel before taking action.";
    advice = [
      "Do not respond with personal or financial information yet.",
      "Check the sender and website domain carefully.",
      "Open the organisation's official website yourself instead of using the message link.",
      "If anything feels unusual, stop and verify."
    ];
  } else {
    level = "safe";
    title = "Low risk — no major red flags found";
    description = "Our basic checks did not find strong scam indicators. This does not guarantee the message is safe, so continue to verify unexpected requests.";
    advice = [
      "Continue to use caution with unexpected requests.",
      "Never share OTPs, passwords or PINs.",
      "Verify unusual payment or account requests through official channels."
    ];
  }

  return { score, level, title, description, detected, advice };
}

function renderResult(result) {
  scoreValue.textContent = result.score;
  scoreRing.style.setProperty("--score", `${result.score * 3.6}deg`);
  riskTitle.textContent = result.title;
  riskDescription.textContent = result.description;

  statusBadge.textContent = result.level === "high" ? "High risk" : result.level === "medium" ? "Medium risk" : "Low risk";
  statusBadge.className = `status-badge ${result.level}`;

  warningList.innerHTML = result.detected.length
    ? result.detected.map(item => `
      <div class="warning-item">
        <span class="warning-icon">!</span>
        <div><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.detail)}</span></div>
      </div>`).join("")
    : `<div class="empty-state">No strong warning patterns were detected.</div>`;

  adviceList.innerHTML = result.advice.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function saveHistory(text, result) {
  const history = JSON.parse(localStorage.getItem("scamcheck-history") || "[]");
  history.unshift({
    text: text.slice(0, 140),
    score: result.score,
    level: result.level,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("scamcheck-history", JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("scamcheck-history") || "[]");
  if (!history.length) {
    historyList.innerHTML = `<div class="history-empty">No analyses yet. Your recent checks will appear here.</div>`;
    return;
  }
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-score">${item.score}</div>
      <div>
        <div class="history-text">${escapeHtml(item.text)}</div>
        <div class="history-meta">${escapeHtml(item.date)}</div>
      </div>
      <span class="history-risk ${item.level}">${item.level}</span>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length} / 5000`;
});

analyzeBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) {
    input.focus();
    input.parentElement.style.animation = "shake .35s ease";
    setTimeout(() => input.parentElement.style.animation = "", 400);
    return;
  }
  const result = analyzeMessage(text);
  renderResult(result);
  saveHistory(text, result);
  document.getElementById("resultPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  charCount.textContent = "0 / 5000";
  input.focus();
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("scamcheck-history");
  renderHistory();
});

document.querySelectorAll(".example-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.example;
    charCount.textContent = `${input.value.length} / 5000`;
    input.focus();
  });
});

renderHistory();
