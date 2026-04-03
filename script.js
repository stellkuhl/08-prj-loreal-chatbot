/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const questionPreview = document.getElementById("questionPreview");
const latestQuestionText = document.getElementById("latestQuestionText");

/* Cloudflare Worker endpoint */
const OPENAI_URL = "https://cold-flower-0525.stellakuhlman123.workers.dev/";

/* Conversation history */
const messages = [
  {
    role: "system",
    content:
      "You are L'Oréal's Smart Routine & Product Advisor. You ONLY answer questions related to L'Oréal products, skincare, makeup, haircare, fragrance, beauty routines, and product recommendations. If a user asks anything unrelated, politely refuse and redirect them back to L'Oréal beauty topics. Keep all responses clear, friendly, and brand-appropriate. Remember details the user shares during the conversation, such as their name, skin concerns, hair goals, routine preferences, and past questions, so you can respond naturally across multiple turns."
  }
];

/* Update latest question area */
function showLatestQuestion(text) {
  latestQuestionText.textContent = text;
  questionPreview.classList.remove("hidden");
}

/* Add message bubble */
function addMessage(role, text) {
  const row = document.createElement("div");
  row.classList.add("message-row", role);

  const bubble = document.createElement("div");
  bubble.classList.add("msg", role);

  const label = document.createElement("div");
  label.classList.add("msg-label");
  label.textContent = role === "user" ? "You" : "L'Oréal Advisor";

  const content = document.createElement("div");
  content.textContent = text;

  bubble.appendChild(label);
  bubble.appendChild(content);
  row.appendChild(bubble);
  chatWindow.appendChild(row);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Initial greeting */
addMessage(
  "ai",
  "👋 Hi! I can help with L'Oréal skincare, makeup, haircare, fragrance, and beauty routines. Tell me what you’re looking for, and I can recommend products or build a routine for you."
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  showLatestQuestion(userMessage);
  addMessage("user", userMessage);

  userInput.value = "";
  sendBtn.disabled = true;

  /* Save user message in conversation history */
  messages.push({
    role: "user",
    content: userMessage
  });

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages
      })
    });

    const data = await response.json();

    const aiReply =
      data?.choices?.[0]?.message?.content ||
      data?.error ||
      "Sorry, I couldn’t generate a response.";

    addMessage("ai", aiReply);

    /* Save assistant message in conversation history */
    messages.push({
      role: "assistant",
      content: aiReply
    });
  } catch (error) {
    console.error("Frontend error:", error);
    addMessage("ai", "Sorry — something went wrong. Please try again.");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});
