document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const form = document.getElementById("form");
  const input = document.getElementById("message-input");
  const messagesContainer = document.getElementById("messages");

  // Function to scroll to the bottom of the chat container
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Fetch existing messages from the server
  async function fetchMessages() {
    try {
      const response = await fetch("/messages");
      const messages = await response.json();

      messages.forEach((msg) => {
        const item = document.createElement("li");
        item.classList.add("message");
        item.innerHTML = `
          <div class="message-header">
            <span class="username">${msg.username}</span>
            <span class="timestamp">${new Date(
              msg.timestamp
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}</span>
          </div>
          <div class="message-body">
            <p>${msg.text}</p>
          </div>
        `;
        messagesContainer.appendChild(item);
      });

      scrollToBottom(); // Scroll to bottom after loading old messages
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  // Load old messages when the page is first loaded
  fetchMessages();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = input.value.trim();
    if (messageText) {
      const message = {
        username: window.username, // Ensure this global variable is correctly set elsewhere
        text: messageText,
      };
      socket.emit("chat message", message);
      input.value = ""; // Clear input field after sending
    }
  });

  socket.on("chat message", (msg) => {
    const item = document.createElement("li");
    item.classList.add("message");
    item.innerHTML = `
      <div class="message-header">
        <span class="username">${msg.username}</span>
        <span class="timestamp">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="message-body">
        <p>${msg.text}</p>
      </div>
    `;
    messagesContainer.appendChild(item);
    scrollToBottom(); // Scroll to bottom when a new message arrives
  });
});
