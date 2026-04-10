const preprocess = require("../services/preprocessing/textCleaner");
const ruleEngine = require("../services/rules/ruleEngine");
const decisionRouter = require("../services/decision/router");
const geminiService = require("../services/llm/geminiService");
const feedbackService = require("../services/feedback/feedbackService");
const reinforcementService = require("../services/reinforcement/reinforcementService");

exports.analyzeAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const cleanAnswer = preprocess(answer);
    const ruleHints = ruleEngine(cleanAnswer);
    const route = decisionRouter(ruleHints, cleanAnswer);

    let aiResult;

    if (route === "simple") {
      aiResult = { type: ruleHints.type, explanation: "You are overgeneralizing the concept." };
    } else {
      aiResult = await geminiService(question, cleanAnswer, ruleHints);
    }

    const feedback = feedbackService(aiResult);
    const followUp = reinforcementService(question);

    res.json({
      success: true,
      data: {
        misconception: aiResult.type,
        explanation: feedback,
        followUpQuestion: followUp
      }
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
