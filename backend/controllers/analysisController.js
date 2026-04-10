const preprocess = require("../services/preprocessing/textCleaner");
const ruleEngine = require("../services/rules/ruleEngine");
const decisionRouter = require("../services/decision/router");
const geminiService = require("../services/llm/geminiService");
const feedbackService = require("../services/feedback/feedbackService");
const reinforcementService = require("../services/reinforcement/reinforcementService");

exports.analyzeAnswer = async (req, res) => {
  try {
    const { question, answer, language = "en-US" } = req.body;
    const startTime = Date.now();

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: "Question and answer are required" 
      });
    }

    const cleanAnswer = preprocess(answer);
    const ruleHints = ruleEngine(cleanAnswer);
    const route = decisionRouter(ruleHints, cleanAnswer);

    let aiResult;
    let isCorrect = false;

    if (route === "simple") {
      // Rule-based detection (fast path)
      aiResult = { 
        type: ruleHints.type, 
        explanation: "You are overgeneralizing the concept.",
        confidence: ruleHints.confidence || 0.7
      };
    } else {
      // AI-based detection (slower but more accurate)
      aiResult = await geminiService(question, cleanAnswer, ruleHints, language);
      // Check if Gemini thinks it's correct
      isCorrect = aiResult.isCorrect || false;
    }

    const feedback = feedbackService(aiResult);
    const followUp = await reinforcementService(question, aiResult.type);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        misconception: aiResult.type,
        explanation: feedback,
        followUpQuestion: followUp,
        isCorrect: isCorrect,
        confidence: aiResult.confidence || 0.5,
        processingMethod: route,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server Error",
      message: error.message 
    });
  }
};
