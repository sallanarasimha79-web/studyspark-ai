// Server-side AI endpoint. Keep OPENAI_API_KEY in Netlify environment variables.
export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Use POST." }, { status: 405 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      error: "AI is not connected yet. Add OPENAI_API_KEY in your Netlify site environment variables."
    }, { status: 503 });
  }

  try {
    const body = await req.json();
    const question = String(body.question || "").trim().slice(0, 4000);
    const grade = String(body.grade || "10").slice(0, 2);
    const subject = String(body.subject || "General").slice(0, 60);
    const mode = String(body.mode || "simple").slice(0, 20);

    if (!question) return Response.json({ error: "Please enter a question." }, { status: 400 });

    const modeInstructions = {
      simple: "Explain in very easy, age-appropriate language. Use a relatable example, define difficult words, and keep paragraphs short.",
      steps: "Teach the reasoning step by step. Show intermediate steps, explain why each step is valid, and check the result.",
      exam: "Give an accurate, well-organised school exam answer at an appropriate length for the question. Include key terms and a short example where useful.",
      quiz: "Act as a friendly tutor. Ask one suitable practice question about the requested topic, unless the student has already answered a quiz question; then give constructive feedback and explain any misconception."
    };
    const instruction = modeInstructions[mode] || modeInstructions.simple;
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions: `You are StudySpark AI, a careful, encouraging school tutor for a student in Class ${grade} studying ${subject}. ${instruction} Be truthful and never claim certainty when unsure. If a question depends on a specific textbook syllabus, say so and ask for the board or textbook context when needed. Do not guarantee every answer is perfect. Do not simply give a final answer when a brief explanation would help learning. Keep the response clear and focused. If a student appears to be asking for help with an active test or exam, support understanding rather than facilitating cheating.`,
        input: question,
        max_output_tokens: 900
      })
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return Response.json({
        error: data?.error?.message || "The AI provider could not answer right now."
      }, { status: apiResponse.status >= 500 ? 502 : 400 });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n")
      .trim();

    if (!answer) return Response.json({ error: "No text answer returned. Please try again." }, { status: 502 });
    return Response.json({ answer });
  } catch (error) {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
};

export const config = { path: "/.netlify/functions/ask", method: "POST" };
