const quizService = require("../services/quiz/quizService");

exports.startChallengeQuiz = async (req, res) => {
  try {
    const { seedQuestion, misconceptionType, misconceptionExplanation } = req.body;

    if (!seedQuestion || !misconceptionType) {
      return res.status(400).json({
        success: false,
        error: "seedQuestion and misconceptionType are required"
      });
    }

    const session = await quizService.startSession({
      seedQuestion,
      misconceptionType,
      misconceptionExplanation: misconceptionExplanation || ""
    });

    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error("Quiz start error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to start challenge quiz",
      message: error.message
    });
  }
};

exports.submitChallengeQuizAnswer = async (req, res) => {
  try {
    const { sessionId, selectedOptionId } = req.body;

    if (!sessionId || !selectedOptionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId and selectedOptionId are required"
      });
    }

    const result = quizService.submitAnswer({
      sessionId,
      selectedOptionId
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Quiz answer error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit challenge answer",
      message: error.message
    });
  }
};
