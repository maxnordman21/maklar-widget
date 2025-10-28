// === Inject CSS styles === //
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
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  z-index: 999999;
}

#ai-widget-chat {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 350px;
  height: 460px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  display: none;
  flex-direction: column;
  font-family: sans-serif;
  z-index: 999999;
}

#ai-chat-header {
  background: #007aff;
  padding: 14px;
  color: white;
  font-size: 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#ai-chat-messages {
  padding: 12px;
  overflow-y: auto;
  height: 310px;
  font-size: 14px;
}

#ai-chat-input {
  display: flex;
  border-top: 1px solid #ddd;
}

#ai-chat-input input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
}

#ai-chat-input button {
  width: 80px;
  border: none;
  background: #007aff;
  color: white;
  cursor: pointer;
}
`;

// Inject CSS
const styleTag = document.createElement("style");
styleTag.innerHTML = widgetStyles;
document.head.appendChild(styleTag);

// === Create widget elements === //
const chatButton = document.createElement("button");
chatButton.id = "ai-widget-button";
chatButton.innerText = "💬";
document.body.appendChild(chatButton);

const chatBox = document.createElement("div");
chatBox.id = "ai-widget-chat";
chatBox.innerHTML = `
  <div id="ai-chat-header">
    Mäklar-Assistent
    <span style="cursor:pointer;" id="ai-chat-close">✖</span>
  </div>
  <div id="ai-chat-messages"></div>

  <div id="ai-chat-input">
    <input id="ai-chat-text" type="text" placeholder="Skriv din fråga...">
    <button id="ai-chat-send">Skicka</button>
  </div>
`;
document.body.appendChild(chatBox);

// Toggle chat
chatButton.onclick = () => chatBox.style.display = "flex";
document.getElementById("ai-chat-close").onclick = () => chatBox.style.display = "none";

// Add message to UI
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = text;
  msgDiv.style.margin = "10px 0";
  msgDiv.style.textAlign = sender === "bot" ? "left" : "right";
  document.getElementById("ai-chat-messages").appendChild(msgDiv);
}

// Send message to your Webhook
async function send() {
  const input = document.getElementById("ai-chat-text");
  const userMessage = input.value;
  input.value = "";
  addMessage(userMessage, "user");

  const res = await fetch("YOUR_WEBHOOK_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await res.json();
  addMessage(data.reply, "bot");
}

document.getElementById("ai-chat-send").onclick = send;
document.getElementById("ai-chat-text").addEventListener("keypress", e => {
  if (e.key === "Enter") send();
});
