module.exports = (answer) => {
  if (answer.includes("always") || answer.includes("all")) {
    return { type: "Overgeneralization" };
  }

  if (answer.length < 20) {
    return { type: "Partial" };
  }

  return { type: "Unknown" };
};
