
(function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;
  let targetEl = null;
  let finalTranscript = "";
  let liveTranscript = ""; //used to just be finalTranscript apparently this will help!
  let indicator = null;

  function supported() {
    return !!SpeechRecognition;
  }

  function createIndicator() {
    if (indicator) return indicator;
    indicator = document.createElement("div");
    indicator.id = "voicefill-indicator";
    indicator.innerHTML = `
      <div class="vf-dot"></div>
      <span class="vf-text">Listening…</span>
    `;
    document.body.appendChild(indicator);
    return indicator;
  }

  function showIndicator(text) {
    const el = createIndicator();
    el.querySelector(".vf-text").textContent = text;
    el.classList.add("vf-visible");
  }

  function hideIndicator() {
    if (indicator) indicator.classList.remove("vf-visible");
  }

  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "textarea") return true;
    if (tag === "input") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      return ["text", "search", "email", "url", "tel", "number", ""].includes(type);
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function insertTextAtCursor(el, text) {
    if (!text) return;

    if (el.isContentEditable) {
      
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        el.textContent += text;
      }
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return;
    }

  
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + text + after;
    const newPos = start + text.length;
    el.setSelectionRange(newPos, newPos);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function startListening() {
    if (!supported()) {
      alert("VoiceFill: your browser doesn't support the Web Speech API. Try Chrome or Edge.");
      return;
    }
    const active = document.activeElement;
    if (!isEditable(active)) {
      showIndicator("Click into a text field first");
      setTimeout(hideIndicator, 1500);
      return;
    }
    targetEl = active;
    finalTranscript = "";
    isListening = true;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      liveTranscript = (finalTranscript + interim).trim();
      showIndicator(liveTranscript || "Listening..."); // used to be this: showIndicator((finalTranscript + interim).trim() || "Listening…"); in stead of line 114 and 115 hopefully this helps!
    };

    recognition.onerror = (e) => {
      showIndicator("Mic error: " + e.error);
      setTimeout(hideIndicator, 1500);
    };

    recognition.onend = () => {
      if (isListening) {
       
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
      showIndicator("Listening…");
    } catch (e) {
      showIndicator("Couldn't start mic");
      setTimeout(hideIndicator, 1500);
    }
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognition = null;
    }
    hideIndicator();

    const text = liveTranscript.trim();
    if (text && targetEl) {
      
      const cleaned = cleanupText(text);
      insertTextAtCursor(targetEl, cleaned + " ");
    }
    finalTranscript = "";
    targetEl = null;
  }

  function cleanupText(text) {
    let t = text
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s+([,.!?])/g, "$1")
      .replace(/\bnew line\b/gi, "\n")
      .replace(/\bcomma\b/gi, ",")
      .replace(/\bperiod\b/gi, ".")
      .replace(/\bquestion mark\b/gi, "?");
    if (t.length) t = t.charAt(0).toUpperCase() + t.slice(1);
    return t;
  }

  
  let keysDown = new Set();

  window.addEventListener("keydown", (e) => {
    keysDown.add(e.code);
    if (e.altKey && e.shiftKey && e.code === "KeyV" && !isListening) {
      startListening();
    }
  });
  
  window.addEventListener("keyup", (e) => {
    keysDown.delete(e.code);
    if (e.code === "KeyV" || e.code === "AltLeft" || e.code === "AltRight" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
      if (isListening && supported()) stopListening();
    }
  });

  window.addEventListener("blur", () => {
    if (isListening) stopListening();
  });
})();
