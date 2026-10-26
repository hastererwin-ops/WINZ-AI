const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");

const history = [
  { role: "system", content: CONFIG.SYSTEM_PROMPT }
];

// Fungsi membuat pesan
function addMessage(text, type){
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = type === "ai" ? "◆" : "YOU";
  if(type === "user") avatar.style.fontSize = "10px"; // Font kecil buat tulisan YOU
  
  const textDiv = document.createElement("div");
  textDiv.className = "text";
  textDiv.textContent = text;
  
  div.appendChild(avatar);
  div.appendChild(textDiv);
  chatEl.appendChild(div);
  
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

// Typing indicator
function addTyping(){
  const div = document.createElement("div");
  div.className = "msg ai typing";
  
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "◆";
  
  const textDiv = document.createElement("div");
  textDiv.className = "text";
  textDiv.textContent = "NEURO-X sedang berpikir...";
  
  div.appendChild(avatar);
  div.appendChild(textDiv);
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

// Kirim pesan
async function sendMessage(){
  const text = inputEl.value.trim();
  if(!text) return;

  addMessage(text, "user");
  history.push({ role: "user", content: text });

  inputEl.value = "";
  inputEl.style.height = "auto";
  sendBtn.disabled = true;

  const typingEl = addTyping();

  try{
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: history,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if(!res.ok){
      const err = await res.text();
      throw new Error(`HTTP ${res.status} — ${err}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "(kosong)";

    typingEl.remove();
    addMessage(reply, "ai");
    history.push({ role: "assistant", content: reply });

  }catch(err){
    typingEl.remove();
    addMessage(`⚠️ Error Sistem: ${err.message}\nCek API Key atau koneksi internet.`, "ai");
  }finally{
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

// Event Listener
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
});

inputEl.focus();