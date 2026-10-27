exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 503, body: JSON.stringify({ error: "No API key" }) };
  }

  let question = "";
  try {
    const body = JSON.parse(event.body || "{}");
    question = String(body.question || "").slice(0, 200);
  } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad JSON" }) };
  }

  const system = [
    "You are the Oracle of Cubicle 13, an ominous and funny fortune teller at an office Halloween party.",
    "Reply in one or two short sentences, 30 words or fewer, plain speakable text, PG and workplace-safe.",
    "Never repeat the user's words.",
    "Never mention real people, money, health, layoffs or protected characteristics.",
    "If the question is inappropriate, answer with a short in-character refusal.",
  ].join(" ");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 120,
        system,
        messages: [{ role: "user", content: question || "Ask the oracle." }],
      }),
    });

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "Upstream failed" }) };
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (_) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
