/**
 * createOffer.js creates influencer offers with configurable payouts.
 * It supports base payouts (CPA, Fixed, or CPA+Fixed), country overrides,
 * and custom payouts for specific influencers. Data is stored in JSON files.
 * User can run it via powershell terminal: 
 * >> node createOffer.js
 */


/*
 * Introductory section imports modules and declares application-level constants. It defines file paths for persistent data storage and
 * allowed business categories for offers.
 */

const fs = require('fs').promises;
const readline = require('readline');

const OFFERS_FILE = './data/offers.json';
const PAYOUTS_FILE = './data/offerPayouts.json';
const CUSTOM_PAYOUTS_FILE = './data/influencerCustomPayouts.json';

const ALLOWED_CATEGORIES = ['Gaming', 'Tech', 'Health', 'Nutrition', 'Fashion', 'Finance'];

/*
 * These utility functions prompt the user via terminal, enforce basic validation rules,
 * and return cleaned values using async/await-friendly Promises.
 */
function promptString(question, required = true) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const val = answer.trim();
      if (required && !val) {
        console.log('Value is required.');
        resolve(promptString(question, required));
      } else {
        resolve(val);
      }
    });
  });
}

function promptNumber(question) {
  return new Promise(async resolve => {
    const input = await promptString(question);
    const num = Number(input);
    if (isNaN(num)) {
      console.log('Please enter a numeric value!');
      resolve(promptNumber(question));
    } else {
      resolve(num);
    }
  });
}

async function promptYesNo(question) {
  let answer = '';
  while (!['yes', 'no'].includes(answer)) {
    answer = (await promptString(question, true)).toLowerCase();
    if (!['yes', 'no'].includes(answer)) {
      console.log('Please enter "yes" or "no".');
    }
  }
  return answer;
}

// Functions for reading from and writing to file
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to write ${file}:`, err.message);
    throw err;
  }
}

// Function for country code validation
function isValidCountryCode(code) {
  return /^[A-Z]{2}$/.test(code);
}

// Function for influencer ID validation
function isValidInfluencerId(id) {
  return /^INF_\d+$/.test(id);
}

// Function for generating sequential offer ID (i.e. offer_1, offer_2, ...)
async function generateOfferId(offers) {
  if (!offers || offers.length === 0) return 'offer_1';

  const numbers = offers
    .map(o => o.id.match(/^offer_(\d+)$/))
    .filter(Boolean)
    .map(match => parseInt(match[1], 10));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `offer_${maxNumber + 1}`;
}

// Function for getting base payout 
async function getBasePayout() {
  const validTypes = ['CPA', 'FIXED', 'CPA_AND_FIXED'];
  let type = '';
  while (!validTypes.includes(type)) {
    type = (await promptString('Enter base payout type (CPA/FIXED/CPA_AND_FIXED): ')).toUpperCase();
    if (!validTypes.includes(type)) {
      console.log(`Invalid type! Please enter one of: ${validTypes.join(', ')}`);
    }
  }

  const payout = { type };

  if (type === 'CPA' || type === 'CPA_AND_FIXED') {
    payout.cpaAmount = await promptNumber('Enter base CPA amount: ');

    const addOverrides = await promptYesNo('Add country-specific CPA overrides? (yes/no): ');
    if (addOverrides === 'yes') {
      payout.cpaCountryOverrides = {};
      while (true) {
        let country = (await promptString('Enter country code (or press Enter to finish): ', false)).toUpperCase();
        if (!country) break;

       
        while (!isValidCountryCode(country)) {
          console.log('Invalid country code! Must be 2 uppercase letters (e.g., US, GB).');
          country = (await promptString('Enter country code (or press Enter to finish): ', false)).toUpperCase();
          if (!country) break;
        }
        if (!country) break;

        payout.cpaCountryOverrides[country] = await promptNumber(`CPA for ${country}: `);
      }
    }
  }

  if (type === 'FIXED' || type === 'CPA_AND_FIXED') {
    payout.fixedAmount = await promptNumber('Enter Fixed amount: ');
  }

  return payout;
}


// Function for getting custom payout for a specific influencer
async function getCustomPayouts(offerId) {
  const customPayouts = [];
  const addCustom = await promptYesNo('Add a custom payout for an influencer? (yes/no): ');

  if (addCustom === 'yes') {
    let influencerId = '';
    while (!isValidInfluencerId(influencerId)) {
      influencerId = (await promptString('Enter influencer ID (e.g., INF_1): ')).toUpperCase();
      if (!isValidInfluencerId(influencerId)) {
        console.log('Invalid influencer ID! Must be in format INF_1, INF_2, etc.');
      }
    }

    const customAmount = await promptNumber(`Enter custom amount for ${influencerId}: `);

    customPayouts.push({ offerId, influencerId, type: 'FIXED', fixedAmount: customAmount });
  }

  return customPayouts;
}

// Main function for creating an offer 
async function createOffer() {
  try {
    const title = await promptString('Enter offer title: ');
    const description = await promptString('Enter offer description: ');

    let categories = [];
    while (categories.length === 0) {
      const input = (await promptString(`Enter categories (comma separated, choose from ${ALLOWED_CATEGORIES.join(', ')}): `))
        .split(',').map(c => c.trim()).filter(Boolean);

      const invalid = input.filter(c => !ALLOWED_CATEGORIES.includes(c));
      if (invalid.length > 0) {
        console.log(`Invalid categories: ${invalid.join(', ')}. Please select from allowed list.`);
      } else {
        categories = input;
      }
    }

    const basePayout = await getBasePayout();

    const [offers, payouts, customPayoutsData] = await Promise.all([
      readJSON(OFFERS_FILE),
      readJSON(PAYOUTS_FILE),
      readJSON(CUSTOM_PAYOUTS_FILE),
    ]);

    const offerId = await generateOfferId(offers);
    offers.push({ id: offerId, title, description, categories });
    payouts.push({ offerId, ...basePayout });

    const customPayouts = await getCustomPayouts(offerId);
    const updatedCustomPayouts = [...customPayoutsData, ...customPayouts];

    await Promise.all([
      writeJSON(OFFERS_FILE, offers),
      writeJSON(PAYOUTS_FILE, payouts),
      writeJSON(CUSTOM_PAYOUTS_FILE, updatedCustomPayouts),
    ]);

    console.log(`\nOffer created successfully! Offer ID: ${offerId}`);
    if (customPayouts.length) console.log('Custom payouts added for specific influencers.');
  } catch (err) {
    console.error('Error creating offer:', err.message);
  }
}

createOffer();
