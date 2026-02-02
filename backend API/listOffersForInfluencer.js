/**
 * listOffersForInfluencer.js
 * Lists all offers and custom fixed payouts for a specific influencer.
 * Reads data from JSON files and displays offer details and payouts.
 * Run via terminal:
 * >> node listOffersForInfluencer.js
 */


// Introductory section imports modules and declares application-level constants.
const fs = require('fs').promises;
const readline = require('readline');

const OFFERS_FILE = './data/offers.json';
const CUSTOM_PAYOUTS_FILE = './data/influencerCustomPayouts.json';

// Function for reading from a file
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Function prompts the user for input via the terminal and returns the response.
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

// Main function for listing custom offer(s) for a specific influencer
async function listOffersForInfluencer() {
  try {
    const influencerId = await prompt('Enter Influencer ID: ');
    if (!influencerId) return console.log('Influencer ID is required!');

    const [offers, customPayouts] = await Promise.all([
      readJSON(OFFERS_FILE),
      readJSON(CUSTOM_PAYOUTS_FILE),
    ]);

    const influencerPayouts = customPayouts.filter(p => p.influencerId === influencerId);
    if (influencerPayouts.length === 0) return console.log(`No offers found for influencer ${influencerId}`);

    console.log(`\nOffers for Influencer ${influencerId}:\n`);

    influencerPayouts.forEach(payout => {
      const offer = offers.find(o => o.id === payout.offerId);
      console.log('---');
      if (offer) {
        console.log(`ID: ${offer.id}`);
        console.log(`Title: ${offer.title}`);
        console.log(`Description: ${offer.description}`);
        console.log(`Categories: ${offer.categories.join(', ')}`);
      } else {
        console.log(`Offer ID: ${payout.offerId} (details not found)`);
      }
      console.log('Payout:');
      console.log(`Type: FIXED`);
      console.log(`Amount: $${payout.fixedAmount}`);
    });

    console.log('\nEnd of list.\n');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listOffersForInfluencer();
