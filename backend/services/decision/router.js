module.exports = (ruleHints, answer) => {
  if (ruleHints.type !== "Unknown") return "simple";
  return "llm";
};
