const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { extractText } = require("../services/preprocessing/ocrService");

router.post("/ocr", upload.single("image"), extractText);

module.exports = router;
