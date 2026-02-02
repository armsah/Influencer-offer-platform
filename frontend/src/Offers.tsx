/*
 * Offers.tsx displays available offers and their payouts in a React frontend.
 * It fetches offers, base payouts, and influencer-specific custom payouts from the backend.
 * Users can filter offers by title and optionally by influencer ID to see only their custom payouts.
 * The component calculates and displays payouts (FIXED, CPA, CPA+FIXED) including country overrides.
 */

import React, { useEffect, useState } from "react";

// Interfaces defining the structure of offers, payouts, and custom payouts
interface Offer {
  id: string;
  title: string;
  description: string;
  categories: string[];
}

interface Payout {
  offerId: string;
  type: "CPA" | "FIXED" | "CPA_AND_FIXED";
  cpaAmount?: number;
  fixedAmount?: number;
  cpaCountryOverrides?: Record<string, number>;
}

interface CustomPayout extends Payout {
  influencerId: string;
}

const normalize = (v: string) => v.trim().toLowerCase();

// State for offers, base payouts, custom payouts, and search inputs
const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [basePayouts, setBasePayouts] = useState<Payout[]>([]);
  const [customPayouts, setCustomPayouts] = useState<CustomPayout[]>([]);

  const [titleSearch, setTitleSearch] = useState("");
  const [influencerSearch, setInfluencerSearch] = useState("");

  // Fetch data from backend API
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/offers").then(r => r.json()),
      fetch("http://localhost:5000/offerPayouts").then(r => r.json()),
      fetch("http://localhost:5000/influencerCustomPayouts").then(r => r.json())
    ]).then(([o, b, c]) => {
      setOffers(o);
      setBasePayouts(b);
      setCustomPayouts(c);
    });
  }, []);


    /**
   * Determines the relevant payout for an offer.
   * - If influencer ID is provided, only returns custom payout for that influencer.
   * - Otherwise, returns base payout.
   */
  const getPayout = (offerId: string) => {
    const inf = influencerSearch.trim();

    if (inf) {
      return customPayouts.find(
        p =>
          normalize(p.offerId) === normalize(offerId) &&
          normalize(p.influencerId) === normalize(inf)
      );
    }

    return basePayouts.find(
      p => normalize(p.offerId) === normalize(offerId)
    );
  };

 // Filter offers by title and availability of payout
  const filteredOffers = offers.filter(offer => {
    if (
      titleSearch &&
      !offer.title.toLowerCase().includes(titleSearch.toLowerCase())
    ) {
      return false;
    }

    return Boolean(getPayout(offer.id));
  });

  /**
   * Renders a payout string for display.
   * Handles FIXED, CPA, and CPA+FIXED, including country-specific CPA ranges.
   */
  const renderPayout = (p?: Payout | CustomPayout) => {
  if (!p) return "N/A";

  const renderCPA = () => {
    if (p.cpaCountryOverrides && Object.keys(p.cpaCountryOverrides).length > 0) {
      const values = Object.values(p.cpaCountryOverrides).map(Number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return min !== max ? `CPA $${min}–$${max}` : `CPA $${min}`;
    }

    return p.cpaAmount !== undefined ? `CPA $${p.cpaAmount}` : "";
  };

  switch (p.type) {
    case "FIXED":
      return p.fixedAmount !== undefined
        ? `Fixed $${p.fixedAmount}`
        : "N/A";

    case "CPA":
      return renderCPA() || "N/A";

    case "CPA_AND_FIXED": {
      const cpaPart = renderCPA();
      const fixedPart =
        p.fixedAmount !== undefined ? `Fixed $${p.fixedAmount}` : "";

      if (cpaPart && fixedPart) return `${cpaPart} + ${fixedPart}`;
      return cpaPart || fixedPart || "N/A";
    }

    default:
      return "N/A";
  }
};

// Render the component
return (
    <div style={{ padding: 20 }}>
      <h1>Available Offers</h1>

      <input
        placeholder="Influencer ID (optional, e.g. inf_123)"
        value={influencerSearch}
        onChange={e => setInfluencerSearch(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: 300 }}
      />

      <input
        placeholder="Search by offer title"
        value={titleSearch}
        onChange={e => setTitleSearch(e.target.value)}
        style={{ display: "block", marginBottom: 20, width: 300 }}
      />

      {filteredOffers.length === 0 ? (
        <p>No offers found.</p>
      ) : (
        <ul>
          {filteredOffers.map(offer => {
            const payout = getPayout(offer.id);
            return (
              <li key={offer.id} style={{ marginBottom: 15 }}>
                <strong>{offer.title}</strong>
                <br />
                {offer.description}
                <br />
                Categories: {offer.categories.join(", ")}
                <br />
                Payout: {renderPayout(payout)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Offers;
