const SYSTEM = `Tum "Lala AI" ho, ek madadgar AI assistant. User jis zuban me likhe (Urdu, Roman Urdu, Sindhi, English) usi me saaf aur aasaan jawab do.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!env.GEMINI_API_KEY) {
        return Response.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
      }
      const { messages } = await request.json();
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.text }]
            }))
          })
        }
      );
      const data = await r.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        return Response.json({ error: data?.error?.message || "No reply" }, { status: 502 });
      }
      return Response.json({ reply });
    }
    return new Response("Not found", { status: 404 });
  }
};
