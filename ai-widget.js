// ====== SETTINGS ======
const WEBHOOK_URL = "https://example.com/webhook/ai-chatbot";
const STORAGE_KEY = "aiw__messages";

let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
if (messages.length === 0) {
  messages = [{ role: "assistant", content: "Hej! Jag är din AI-assistent. Hur kan jag hjälpa dig idag?" }];
}

const els = {
  root: document.getElementById("ai-widget"),
  list: document.getElementById("aiw-messages"),
  name: document.getElementById("aiw-name"),
  phone: document.getElementById("aiw-phone"),
  consent: document.getElementById("aiw-consent"),
  input: document.getElementById("aiw-input"),
  status: document.getElementById("aiw-status"),
};

// ====== HELPERS ======
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }
function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
function formatSEPhone(v){
  if (!v) return "";
  let s = String(v).replace(/\D+/g, "");
  if (s.startsWith("46")) s = "+" + s;
  else if (s.startsWith("0")) s = "+46" + s.slice(1);
  else if (!s.startsWith("+")) s = "+" + s;
  return s;
}
function scrollBottom(){ els.list.scrollTop = els.list.scrollHeight; }
function bubble({ role, content }){
  const wrap = el("div", "bubble " + (role === "user" ? "user" : "ai"));
  wrap.textContent = content;
  els.list.appendChild(wrap);
}

// ====== RENDER EXISTING ======
els.list.innerHTML = "";
messages.forEach(bubble);
scrollBottom();

// ====== PUBLIC API ======
window.aiwToggle = (open) => {
  els.root.classList.toggle("open", !!open);
  if (open) setTimeout(scrollBottom, 50);
};

window.aiwSend = async () => {
  const text = (els.input.value || "").trim();
  if (!text) return;

  // add user bubble
  const userMsg = { role: "user", content: text };
  messages.push(userMsg); save(); bubble(userMsg);
  els.input.value = "";
  scrollBottom();

  // send to webhook
  setStatus("");
  const payload = {
    message: text,
    name: els.name.value || undefined,
    phone: els.phone.value ? formatSEPhone(els.phone.value) : undefined,
    consent: !!els.consent.checked,
    source: "widget",
    meta: {
      href: location.href,
      userAgent: navigator.userAgent,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    typing(true);
    const res = await fetch(WEBHOOK_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    typing(false);

    const aiText = data?.message || "Tack! Jag återkommer strax.";
    const aiMsg = { role: "assistant", content: aiText };
    messages.push(aiMsg); save(); bubble(aiMsg); scrollBottom();
  } catch (e) {
    typing(false);
    const errMsg = { role: "assistant", content: "Kunde inte nå servern just nu. Försök igen om en stund." };
    messages.push(errMsg); save(); bubble(errMsg); scrollBottom();
    setStatus("Fel: " + (e?.message || e));
  }
};

window.aiwSubmitLead = async () => {
  const phone = els.phone.value.trim();
  if (!phone){ setStatus("Fyll i telefonnummer först."); return; }
  if (!els.consent.checked){ setStatus("Du behöver ge samtycke."); return; }

  setStatus("");
  const payload = {
    message: "Lead-intake",
    name: els.name.value || "",
    phone: formatSEPhone(phone),
    consent: true,
    source: "widget",
    meta: { intent: "lead-only" },
  };

  try {
    typing(true);
    const res = await fetch(WEBHOOK_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("Server " + res.status);
    typing(false);

    const ok = { role: "assistant", content: "Tack! Vi har sparat dina uppgifter och hör av oss snart." };
    messages.push(ok); save(); bubble(ok); scrollBottom();
  } catch (e) {
    typing(false);
    setStatus("Kunde inte spara lead just nu.");
  }
};

// ====== UI bits ======
let typingEl = null;
function typing(on){
  if (on){
    if (typingEl) return;
    typingEl = el("div","bubble ai"); typingEl.textContent = "Skriver…";
    els.list.appendChild(typingEl); scrollBottom();
  } else {
    if (typingEl){ typingEl.remove(); typingEl = null; }
  }
}
function setStatus(msg){ els.status.textContent = msg || ""; }

// Enter to send
els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    window.aiwSend();
  }
});

