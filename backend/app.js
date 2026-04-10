require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analysisRoutes = require("./routes/analysisRoutes");
const ocrRoutes = require("./routes/ocrRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", analysisRoutes);
app.use("/api", ocrRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
