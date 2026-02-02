/**
 * server.js
 * Simple Express backend API for the Influencer Offer Platform.
 * It provides endpoints to fetch offers, base payouts, and custom influencer payouts from JSON files.
 * Also it enables CORS and JSON body parsing for frontend integration.
 * User can run it via powershell terminal:
 * >> node server.js
 */

// Import required modules
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

// Initialize Express app
const app = express();

// Define server port
const PORT = 5000;

// Enable CORS for cross-origin requests and JSON parsing
app.use(cors());
app.use(express.json());

// Directory containing data files
const DATA_DIR = path.join(__dirname, "data");

// Function allows to read JSON files from data directory
const readJSON = async (file) => {
  const data = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(data);
};

// This get() function returns all offers from offer.json file
app.get("/offers", async (req, res) => {
  try {
    const offers = await readJSON("offers.json");
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THis get() function returns all base payouts for offers from offerPayouts.json
app.get("/offerPayouts", async (req, res) => {
  try {
    const payouts = await readJSON("offerPayouts.json");
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THis get() function returns all custom payouts for influencers from influencerCustomPayouts.json
app.get("/influencerCustomPayouts", async (req, res) => {
  try {
    const custom = await readJSON("influencerCustomPayouts.json");
    res.json(custom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(` Backend running on http://localhost:${PORT}`);
});
