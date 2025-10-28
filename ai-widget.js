//////////////////////
// Inject CSS styles
//////////////////////
const widgetStyles = `
#ai-widget-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  background: #007aff;
  color: #fff;
  border-radius: 50%;
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

#ai-widget-chat {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 350px;
  height: 460px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 6px 28px rgba(0,0,0,0.25);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 999999;
}

#ai-widget-header {
  background: #007aff;
  padding: 14px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
}

#ai-widget-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  font-size: 14px;
}

.ai-msg {
  background: #f1f1f1;
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 8px;
  max-width: 80%;
}

.user-msg {
  background: #007aff;
  color: #fff;
  padding: 8px 12px;
  margin: 6px 0 6px auto;
  border-radius: 8px;
  max-width: 80%;
}

#ai-widget-input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

#ai-widget-input {
  flex: 1;
  border: none;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 8px;
  font-size: 14px;
}

#ai-widget-send {
  margin-left: 10px;
  padding: 10px 14px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
`;

let styleTag = document.createElement("style");
styleTag.innerHTML = widgetStyles;
document.head.appendChild(styleTag);


//////////////////////
// Inject Widget HTML
//////////////////////
const widgetHTML = `
<div id="ai-widget-chat">
  <div id="ai-widget-header">AI Mäklarassistent 🤖</div>
  <div id="ai-widget-messages"></div>
  <div id="ai-widget-input-area">
    <input id="ai-widget-input" type="text" placeholder="Skriv ett meddelande…" />
    <button id="ai-widget-send">➤</button>
  </div>
</div>

<button id="ai-widget-button">💬</button>
`;

document.body.insertAdjacentHTML("beforeend", widgetHTML);


//////////////////////
// Chat Logic
//////////////////////
const webhookUrl = "https://maxnordman21.app.n8n.cloud/webhook-test/chat_in"; // <— DIN WEBHOOK ✅

const button = document.getElementById('ai-widget-button');
const chat = document.getElementById('ai-widget-chat');
const messages = document.getElementById('ai-widget-messages');
const input = document.getElementById('ai-widget-input');
const sendButton = document.getElementById('ai-widget-send');

button.onclick = () => {
  chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
};

function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = isUser ? 'user-msg' : 'ai-msg';
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const userText = input.value;
  if (!userText.trim()) return;
  addMessage(userText, true);
  input.value = '';

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();
  addMessage(data.reply || "🤖: Jag kunde inte tolka det där.");
}

sendButton.onclick = sendMessage;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
