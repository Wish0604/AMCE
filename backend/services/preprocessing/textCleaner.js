module.exports = (text) => {
  // Normalize whitespace
  text = text.trim().replace(/\s+/g, " ");
  
  // Convert to lowercase for analysis
  text = text.toLowerCase();
  
  // Remove extra punctuation
  text = text.replace(/[.,;:!?]+\s+([.,;:!?])/g, "$1");
  
  // Remove leading/trailing punctuation
  text = text.replace(/^[.,;:!?]+|[.,;:!?]+$/g, "");
  
  return text;
};
