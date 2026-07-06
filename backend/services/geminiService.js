// Minimal Gemini API wrapper — uses Node's built-in fetch, no extra SDK needed.
// Two jobs only: translate text, and transcribe voice notes.

const GEMINI_MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const callGemini = async (parts) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
};

export const translateText = async (text, targetLang) => {
  const prompt = `Translate the following chat message to ${targetLang}. Reply with ONLY the translated text — no notes, no quotes, no explanation.\n\nMessage: "${text}"`;
  return callGemini([{ text: prompt }]);
};

export const transcribeAudio = async (base64Audio, mimeType) => {
  const parts = [
    {
      text: "Transcribe the spoken words in this voice note. Reply with ONLY the plain-text transcript — no timestamps, no speaker labels, no commentary. If there is no clear speech, reply with an empty string.",
    },
    { inline_data: { mime_type: mimeType, data: base64Audio } },
  ];
  return callGemini(parts);
};
