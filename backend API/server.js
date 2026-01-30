const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const OFFERS_FILE = path.join(__dirname, "data/offers.json");
const CUSTOM_FILE = path.join(__dirname, "data/influencerCustomPayouts.json");

app.get("/offers", async (req, res) => {
  const data = await fs.readFile(OFFERS_FILE, "utf8");
  res.json(JSON.parse(data));
});

app.get("/customPayouts", async (req, res) => {
  const data = await fs.readFile(CUSTOM_FILE, "utf8");
  res.json(JSON.parse(data));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
