module.exports = (answer) => {
  // Check for overgeneralization patterns
  const overgeneralizePatterns = [
    /\b(always|all|never|none|every|everyone)\b/i,
    /all\s+(objects|things|cases)/i,
    /\d+\s*(percent|%)\s*(of\s+)?(all|anything)/i
  ];

  for (const pattern of overgeneralizePatterns) {
    if (pattern.test(answer)) {
      return { 
        type: "Overgeneralization",
        confidence: 0.85,
        pattern: "absolutist_language"
      };
    }
  }

  // Check for partial/incomplete answers
  if (answer.length < 20) {
    return { 
      type: "Partial",
      confidence: 0.70,
      pattern: "too_short"
    };
  }

  // Check for procedural errors
  const proceduralPatterns = [
    /wrong.*step/i,
    /skip.*step/i,
    /forget.*to/i,
    /miss.*step/i
  ];

  for (const pattern of proceduralPatterns) {
    if (pattern.test(answer)) {
      return { 
        type: "Procedural",
        confidence: 0.80,
        pattern: "procedural_error_words"
      };
    }
  }

  return { 
    type: "Unknown",
    confidence: 0,
    pattern: "no_pattern_match"
  };
};
