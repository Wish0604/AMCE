module.exports = (aiResult) => {
  switch (aiResult.type) {
    case "Conceptual":
      return `Your understanding of the concept is incorrect. Let’s fix the core idea: ${aiResult.explanation}`;
    case "Procedural":
      return `You made a mistake in the steps. Follow the correct process: ${aiResult.explanation}`;
    case "Overgeneralization":
      return `You applied a rule too broadly. Not all cases follow this: ${aiResult.explanation}`;
    case "Partial":
      return `Your answer is incomplete. Add more details: ${aiResult.explanation}`;
    default:
      return aiResult.explanation;
  }
};
