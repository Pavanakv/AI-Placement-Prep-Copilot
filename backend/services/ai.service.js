const generateAIResponse = async (type, input, messages) => {
  let prompt = "";

  if (type === "planner") {
    prompt = `
You are an expert placement preparation coach.

Student details:
${input}

Create a day-wise placement preparation plan.

Identify correct categories for the role:
- Data Analyst → SQL, Python, Statistics, Visualization, Excel
- Frontend Developer → HTML/CSS, JavaScript, React, Projects
- Backend Developer → DSA, Node.js, Databases, System Design
- Full Stack → DSA, Frontend, Backend, Projects
- Data Scientist → Python, ML, Statistics, Projects
- DevOps → Linux, Docker, CI/CD, Cloud
- General/Software → DSA, System Design, Projects, Resume

Respond ONLY in this exact JSON format, no extra text, no markdown:
{"role":"target role","categories":["cat1","cat2"],"days":[{"day":1,"category":"SQL","focus":"Basic queries","tasks":["task1","task2","task3"]}]}

Rules:
- Generate plan for EXACT number of days mentioned
- Tasks per day must fit within available hours (1 task = 30-45 mins)
- Use ONLY role-specific categories
- Each day focus on ONE specific topic
- Tasks must be specific and actionable
- Return ONLY JSON, nothing else
`;
  }

  else if (type === "interview") {
    if (messages && messages.length > 0) {
      prompt = `
You are a strict technical interviewer for a ${input || "technical"} role.

You MUST respond ONLY in this JSON format:
{"feedback":"short feedback","score":7,"improvement":"one suggestion","next_question":"next question"}

Rules:
- Always evaluate the user's answer
- Always give score out of 10
- Always ask ONE next question
- Do NOT return anything outside JSON
`;
    } else {
      prompt = `
You are a technical interviewer.
Start a mock interview based on: ${input}
Rules:
- Ask ONLY ONE question
- Do NOT give answer
- Wait for user response
`;
    }
  }

  else if (type === "resume") {
    prompt = `Improve this resume project description professionally with strong action words and impact:\n\n${input}`;
  }

  else if (type === "doubt") {
    prompt = `Explain this programming concept in a simple and beginner-friendly way with an example:\n\n${input}`;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messages && messages.length > 0
          ? [
            { role: "system", content: prompt },
            ...messages,
            { role: "user", content: "Evaluate my last answer and continue the interview." }
          ]
          : [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return "AI Error: " + data.error.message;
    }

    const text = data.choices?.[0]?.message?.content;

    if (type === "planner") {
      try {
        const cleaned = text
          .replace(/```json|```/g, "")
          .replace(/,\s*}/g, "}")      // remove trailing comma before }
          .replace(/,\s*]/g, "]")      // remove trailing comma before ]
          .trim();
        return JSON.parse(cleaned);
      } catch (err) {
        console.log("Planner parse failed:", text);
        return text;
      }
    }

    if (messages && messages.length > 0) {
      try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return `Feedback: ${parsed.feedback}\nScore: ${parsed.score}/10\nImprovement: ${parsed.improvement}\n\nNext Question:\n${parsed.next_question}`;
      } catch (err) {
        console.log("JSON parse failed:", text);
        return text;
      }
    } else {
      return text;
    }

  } catch (err) {
    console.error(err);
    return "Failed to generate response";
  }
};

module.exports = { generateAIResponse };