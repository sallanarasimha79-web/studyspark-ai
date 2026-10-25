const $ = (s) => document.querySelector(s);
const grade = $("#grade"), subject = $("#subject"), input = $("#questionInput");
const messages = $("#chatMessages");
let mode = "simple";
let firstMessage = true;

const demoAnswers = {
  simple: "Let's make this simple!\n\nImagine the topic as something you already know from everyday life. Start with the main idea, then connect it to one clear example.\n\n**Try this:** Tell me the exact concept or paste your textbook question, and I'll break it into smaller parts.\n\n*Demo mode is active.* Connect an OpenAI API key on the server to get AI-generated answers to your actual question.",
  steps: "Let's solve it one step at a time.\n\n**Step 1 — Understand:** Identify what the question is asking.\n\n**Step 2 — Find the idea:** Choose the rule, formula, or concept that fits.\n\n**Step 3 — Work it out:** Apply the idea carefully and show each step.\n\n**Step 4 — Check:** Make sure the answer makes sense.\n\n*Demo mode is active.* Connect the API to get a worked solution for your question.",
  exam: "**Exam-answer structure**\n\n1. **Definition / main point:** Write a direct opening sentence.\n2. **Explanation:** Add the important facts in logical order.\n3. **Example or diagram:** Include one when the question needs it.\n4. **Conclusion:** Finish with the key result.\n\n*Demo mode is active.* Connect the API to generate a tailored answer for your question and class.",
  quiz: "Let's practise! 🧠\n\n**Question 1:** Explain the main idea of the topic you're studying in one or two sentences.\n\nSend your attempt and check your textbook afterwards. In live AI mode, I'll generate a class-appropriate question about your chosen subject and give feedback on your answer.\n\n*Demo mode is active.*"
};

function syncLabels() {
  $("#classLabel").textContent = grade.value;
  $("#subjectLabel").textContent = subject.value;
}
grade.addEventListener("change", syncLabels);
subject.addEventListener("change", syncLabels);
syncLabels();

document.querySelectorAll(".mode-option").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".mode-option").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  mode = btn.dataset.mode;
}));

$("#themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  $("#themeButton").textContent = document.body.classList.contains("dark") ? "☾" : "☼";
});

document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click", () => {
  input.value = btn.dataset.prompt;
  input.focus();
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
}));

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
});
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("#askForm").requestSubmit();
  }
});

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function addMessage(role, text, actions = false) {
  const wrap = document.createElement("div");
  wrap.className = "message " + role;
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "●" : "✦";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = escapeHTML(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  wrap.append(avatar, bubble);
  messages.appendChild(wrap);
  if (actions) {
    const actionRow = document.createElement("div");
    actionRow.className = "answer-actions";
    const simpler = document.createElement("button");
    simpler.textContent = "Explain simpler ↗";
    simpler.onclick = () => { mode = "simple"; document.querySelectorAll(".mode-option").forEach(b => b.classList.toggle("active", b.dataset.mode === mode)); input.value = "Explain your last answer in even simpler words with a real-life example."; input.focus(); };
    const quiz = document.createElement("button");
    quiz.textContent = "Quiz me ✧";
    quiz.onclick = () => { mode = "quiz"; document.querySelectorAll(".mode-option").forEach(b => b.classList.toggle("active", b.dataset.mode === mode)); input.value = "Give me one practice question about the topic you just explained."; input.focus(); };
    actionRow.append(simpler, quiz);
    bubble.appendChild(actionRow);
  }
  messages.scrollTop = messages.scrollHeight;
  return wrap;
}
function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "message assistant";
  wrap.id = "typingMessage";
  wrap.innerHTML = '<div class="message-avatar">✦</div><div class="message-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
  return wrap;
}
function setStatus(live) {
  $("#modeStatus").textContent = live ? "AI connected" : "Demo mode";
  document.querySelector(".status-dot").style.background = live ? "#40c69b" : "#e8ad58";
}
async function ask(question) {
  const clean = question.trim();
  if (!clean) return;
  if (firstMessage) { messages.innerHTML = ""; firstMessage = false; }
  addMessage("user", clean);
  input.value = "";
  input.style.height = "auto";
  $("#sendButton").disabled = true;
  $("#sendButton").style.opacity = ".65";
  const typing = showTyping();
  try {
    const response = await fetch("/.netlify/functions/ask", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({question: clean, grade: grade.value, subject: subject.value, mode})
    });
    if (!response.ok) throw new Error("AI endpoint unavailable");
    const data = await response.json();
    if (!data.answer) throw new Error("No answer received");
    typing.remove();
    setStatus(true);
    addMessage("assistant", data.answer, true);
  } catch (err) {
    typing.remove();
    setStatus(false);
    const demo = demoAnswers[mode] || demoAnswers.simple;
    addMessage("assistant", demo, true);
  } finally {
    $("#sendButton").disabled = false;
    $("#sendButton").style.opacity = "1";
    input.focus();
  }
}
$("#askForm").addEventListener("submit", e => {
  e.preventDefault();
  ask(input.value);
});
$("#clearChat").addEventListener("click", () => {
  messages.innerHTML = document.querySelector(".welcome-card") ? document.querySelector(".welcome-card").outerHTML : "";
  firstMessage = true;
  messages.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-art"><span>✦</span><span>✧</span><span>✳</span><div class="book-art">▱</div></div>
      <h2>Fresh start! <span>🌱</span></h2><p>What are we figuring out today?</p>
      <div class="suggestion-grid">
        <button class="suggestion" data-prompt="Explain photosynthesis with a simple real-life example."><span>🌱</span><span><strong>Explain a concept</strong><small>Make it easy to understand</small></span><b>↗</b></button>
        <button class="suggestion" data-prompt="Give me one practice question for my class and subject, then wait for my answer."><span>🧠</span><span><strong>Test my knowledge</strong><small>One question at a time</small></span><b>↗</b></button>
        <button class="suggestion" data-prompt="Show me a step-by-step method to solve a maths problem, with an example."><span>✏️</span><span><strong>Solve step by step</strong><small>See how it works</small></span><b>↗</b></button>
        <button class="suggestion" data-prompt="Help me make a short revision plan for an upcoming school test."><span>🚀</span><span><strong>Plan my revision</strong><small>Turn stress into a plan</small></span><b>↗</b></button>
      </div>
    </div>`;
  document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click", () => { input.value = btn.dataset.prompt; input.focus(); }));
});
