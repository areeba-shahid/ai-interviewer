// ===============================
// TEXT TO SPEECH
// ===============================

export const initSpeech = () => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve(false);

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) resolve(true);
    };

    loadVoices();

    if ("onvoiceschanged" in speechSynthesis) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback timeout
    setTimeout(() => resolve(true), 2000);
  });
};

export const speak = async (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window))
      return reject(new Error("Speech synthesis not supported"));

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? "en-US";

    let voices = synth.getVoices();
    if (!voices.length) {
      voices = speechSynthesis.getVoices();
    }

    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.name.includes("Jenny") ||
        v.name.includes("David")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => resolve();
    utterance.onerror = (err) => reject(err);

    setTimeout(() => synth.speak(utterance), 50);
  });
};

// ===============================
// SPEECH TO TEXT
// ===============================
export const listen = ({ timeout = 15000, language = "en-US" } = {}) => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return reject(new Error("Speech recognition not supported"));

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let timeoutId = null;

    recognition.onresult = (event) => {
      clearTimeout(timeoutId);
      const transcript = event.results[0][0].transcript;
      recognition.stop();
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      clearTimeout(timeoutId);
      recognition.stop();
      if (event.error === "no-speech") resolve("");
      else reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => clearTimeout(timeoutId);

    try {
      recognition.start();
    } catch (e) {
      reject(e);
    }

    timeoutId = setTimeout(() => {
      recognition.stop();
      resolve("");
    }, timeout);
  });
};

// ===============================
// SUPPORT CHECK
// ===============================
export const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

// ===============================
// UNLOCK SPEECH (Safari/Chrome gesture restriction)
// ===============================
export const unlockSpeech = () => {
  const unlock = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utterance);
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    }
  };

  window.addEventListener("click", unlock);
  window.addEventListener("touchstart", unlock);
};
