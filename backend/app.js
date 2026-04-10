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

const PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_TRIES = 20;

const startServer = (port, tries = 0) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && tries < MAX_PORT_TRIES) {
      const nextPort = port + 1;
      console.log(`Port ${port} busy, trying ${nextPort}...`);
      startServer(nextPort, tries + 1);
      return;
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });
};

startServer(PORT);
