// ✅ YOUR LIVE WEBHOOK URL
const WEBHOOK_URL = "https://maxnordman21.app.n8n.cloud/webhook/chat_in";

// Create and inject CSS
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
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    display: none;
    flex-direction: column;
    z-index: 999998;
  }
  #ai-widget-header {
    padding: 16px;
    background: #007aff;
    color: #fff;
    font-size: 18px;
    border-radius: 14px 14px 0 0;
  }
  #ai-widget-messages {
    flex: 1;
    padding: 14px;
    overflow-y: auto;
    font-size: 14px;
    color: #222;
  }
  #ai-widget-input-container {
    padding: 10px;
    display: flex;
    gap: 10px;
  }
  #ai-widget-input {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
  #ai-widget-send {
    background: #007aff;
    color: white;
    border: none;
    padding: 0 16px;
    border-radius: 8px;
    cursor: pointer;
  }
`;

// Add style tag
const styleTag = document.createElement("style");
styleTag.innerHTML = widgetStyles;
document.head.appendChild(styleTag);

// Create button
const button = document.createElement("button");
button.id = "ai-widget-button";
button.innerText = "💬";
document.body.appendChild(button);

// Create chat container
const chat = document.createElement("div");
chat.id = "ai-widget-chat";
chat.innerHTML = `
  <div id="ai-widget-header">AI-Mäklare</div>
  <div id="ai-widget-messages"></div>
  <div id="ai-widget-input-container">
    <input id="ai-widget-input" placeholder="Skriv ett meddelande...">
    <button id="ai-widget-send">➤</button>
  </div>
`;
document.body.appendChild(chat);

const messagesContainer = document.getElementById("ai-widget-messages");
const inputField = document.getElementById("ai-widget-input");

// Toggle chat visibility
button.addEventListener("click", () => {
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  chat.style.flexDirection = "column";
});

// Append messages
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle sending
async function sendMessage() {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  addMessage("Du", userMessage);
  inputField.value = "";

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    addMessage("AI", data.reply);
  } catch (err) {
    addMessage("System", "Fel: Kunde inte nå AI-servern 😢");
  }
}

document.getElementById("ai-widget-send").addEventListener("click", sendMessage);
inputField.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
