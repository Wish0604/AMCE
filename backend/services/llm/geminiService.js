const axios = require("axios");

module.exports = async (question, answer) => {
  const prompt = `
You are an expert teacher.

Question: ${question}
Student Answer: ${answer}

Tasks:
1. Identify if correct
2. Classify misconception (Conceptual, Procedural, Overgeneralization, Partial)
3. Explain simply
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      type: "Conceptual",
      explanation: text
    };
  } catch (err) {
    console.error("Gemini API Error details:", err.response?.data || err.message);
    return {
      type: "AI_Detected",
      explanation: "Failed to reach Gemini API. Please check your API key."
    }
  }
};
