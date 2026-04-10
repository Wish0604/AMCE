const express = require("express");
const router = express.Router();
const { analyzeAnswer } = require("../controllers/analysisController");
const {
  startChallengeQuiz,
  submitChallengeQuizAnswer
} = require("../controllers/quizController");

router.post("/analyze", analyzeAnswer);
router.post("/challenge/start", startChallengeQuiz);
router.post("/challenge/answer", submitChallengeQuizAnswer);

module.exports = router;
