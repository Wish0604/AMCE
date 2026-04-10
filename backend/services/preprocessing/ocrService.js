const fs = require("fs");
const path = require("path");

// Simulated OCR - in production, use Tesseract.js or Google Cloud Vision
const simulatedOcrResults = [
  "Objects fall because of gravity, not because of their weight",
  "Heat always rises and cold always falls",
  "The Earth revolves around the Sun because they are attracted",
  "Friction prevents all motion on surfaces",
  "All metals conduct electricity equally",
  "Plants only need sunlight and water to grow"
];

exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No image file uploaded" 
      });
    }

    // Simulate OCR extraction with random selection
    // In production, implement real OCR using Tesseract.js:
    // const Tesseract = require('tesseract.js');
    // const result = await Tesseract.recognize(filePath);
    // extractedText = result.data.text;

    const extractedText = simulatedOcrResults[
      Math.floor(Math.random() * simulatedOcrResults.length)
    ];

    // Clean up uploaded file
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: {
        text: extractedText,
        confidence: 0.85,
        source: "ocr_simulation",
        fileProcessed: req.file.originalname,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("OCR Error:", error);
    
    // Clean up on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false,
      error: "OCR processing failed",
      message: error.message
    });
  }
};

