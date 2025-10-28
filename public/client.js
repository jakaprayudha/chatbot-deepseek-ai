const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = role === "user" ? "flex justify-end" : "flex justify-start";

  // Jika role = assistant → parse markdown jadi HTML
  const content =
    role === "assistant"
      ? marked.parse(text)
      : escapeHtml(text).replace(/\n/g, "<br>");

  wrapper.innerHTML = `
    <div class="${
      role === "user"
        ? "bg-blue-600 text-white"
        : "bg-slate-100 text-slate-900 prose prose-sm max-w-[80%]"
    } p-3 rounded-lg">
      ${content}
    </div>
  `;
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function escapeHtml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  appendMessage("user", text);
  input.value = "";
  appendMessage("assistant", "Mengetik...");

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, model: "deepseek/deepseek-chat" })
    });
    const data = await resp.json();
    // remove the "Mengetik..." placeholder (last assistant)
    const last = chatEl.querySelectorAll(".flex.justify-start");
    if (last.length) last[last.length - 1].remove();

    if (resp.ok) {
      appendMessage("assistant", data.result || "Tidak ada jawaban");
    } else {
      appendMessage("assistant", `Error: ${data.error || "Unknown error"}`);
    }
  } catch (err) {
    // remove the "Mengetik..." placeholder
    const last = chatEl.querySelectorAll(".flex.justify-start");
    if (last.length) last[last.length - 1].remove();
    appendMessage("assistant", `Network error: ${err.message}`);
  }
});