/*
 * testCreateOffer.js
 * 
 * It performs automated test for the createOffer.js, by implementing the following steps:
 *  - simulates user input to create a new offer and 
 *  - verifies that it is correctly added to the offers JSON file. 
 *  - backs up original data and restores it after the test to avoid modifying real data.
 * User can run it via powershell terminal: 
 * >> node testCreateOffer.js
 */

// Modules used for assignment functionality
const fs = require('fs').promises;
const assert = require('assert');

// Simulate user input
const answers = [
  'Test Offer',        // title
  'Test Description',  // description
  'Health, Nutrition', // categories
  'FIXED',             // base payout type
  '100',               // base fixed amount
  'no'                 // custom payout (yes/no)?
];

// Mock readline interface to simulate user input during testing
let i = 0;

const readline = require('readline');
readline.createInterface = () => ({
  question(_, cb) { cb(answers[i++]); },
  close() {}
});

// Data directories for offers, offerPayouts and influencer custom payouts
const OFFERS_FILE = './data/offers.json';
const PAYOUTS_FILE = './data/offerPayouts.json';
const CUSTOM_FILE = './data/influencerCustomPayouts.json';

// Import createOffer script
require('../createOffer');

(async () => {
  // Backup current JSON data
  const offersBackup = await fs.readFile(OFFERS_FILE, 'utf8');
  const payoutsBackup = await fs.readFile(PAYOUTS_FILE, 'utf8');
  const customBackup = await fs.readFile(CUSTOM_FILE, 'utf8');

  try {

    // Verify that the offer was successfully created and saved
    await new Promise(resolve => setTimeout(resolve, 1500));
    const offers = JSON.parse(await fs.readFile(OFFERS_FILE, 'utf8'));
    const created = offers.some(o => o.title === 'Test Offer');
    assert(created, 'Offer not created');

    console.log('Test passed: Offer created successfully');
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    // Restore original JSON data
    await fs.writeFile(OFFERS_FILE, offersBackup);
    await fs.writeFile(PAYOUTS_FILE, payoutsBackup);
    await fs.writeFile(CUSTOM_FILE, customBackup);
  }
})();
