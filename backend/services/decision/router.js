module.exports = (ruleHints, answer) => {
  // Use simple/fast path if:
  // 1. A pattern was matched with high confidence
  // 2. It's a clear overgeneralization or partial answer
  
  const highConfidenceThreshold = 0.75;
  
  if (ruleHints.type !== "Unknown" && ruleHints.confidence >= highConfidenceThreshold) {
    return "simple";
  }
  
  // For longer, complex answers, use AI route for accuracy
  if (answer.length > 100) {
    return "llm";
  }
  
  // For shorter answers with patterns, use simple path
  if (ruleHints.type !== "Unknown") {
    return "simple";
  }
  
  // Default to LLM for unknown cases
  return "llm";
};
