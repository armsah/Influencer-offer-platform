import React, { useEffect, useState } from "react";

interface Offer {
  id: string;
  title: string;
  description: string;
  categories: string[];
}

interface CustomPayout {
  offerId: string;
  influencerId: string;
  type: "CPA" | "FIXED" | "CPA_AND_FIXED";
  cpaAmount?: number;
  fixedAmount?: number;
}

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customPayouts, setCustomPayouts] = useState<CustomPayout[]>([]);

  const [titleSearch, setTitleSearch] = useState("");
  const [influencerSearch, setInfluencerSearch] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, customRes] = await Promise.all([
          fetch("http://localhost:5000/offers"),
          fetch("http://localhost:5000/customPayouts"),
        ]);

        setOffers(await offersRes.json());
        setCustomPayouts(await customRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Get payout for a given offer & influencer
  const getCustomPayout = (offerId: string, influencerId: string) =>
    customPayouts.find(
      (p) =>
        p.offerId === offerId &&
        p.influencerId.toLowerCase() === influencerId.toLowerCase().trim()
    );

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    // Filter by influencer if provided
    if (influencerSearch.trim()) {
      const payout = getCustomPayout(offer.id, influencerSearch);
      if (!payout) return false;
    }

    // Filter by title if provided
    if (titleSearch.trim()) {
      return offer.title.toLowerCase().includes(titleSearch.toLowerCase().trim());
    }

    // If neither title nor influencer filter excludes it, include
    return true;
  });

  const renderPayout = (offer: Offer) => {
    if (!influencerSearch.trim()) return "N/A";
    const payout = getCustomPayout(offer.id, influencerSearch);
    if (!payout) return "N/A";
    switch (payout.type) {
      case "FIXED":
        return `Fixed $${payout.fixedAmount}`;
      case "CPA":
        return `CPA $${payout.cpaAmount}`;
      case "CPA_AND_FIXED":
        return `CPA $${payout.cpaAmount} + Fixed $${payout.fixedAmount}`;
      default:
        return "N/A";
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Available Offers</h1>

      <input
        placeholder="Influencer ID (optional, e.g. inf_123)"
        value={influencerSearch}
        onChange={(e) => setInfluencerSearch(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 5, width: 300 }}
      />

      <input
        placeholder="Search by offer title"
        value={titleSearch}
        onChange={(e) => setTitleSearch(e.target.value)}
        style={{ display: "block", marginBottom: 20, padding: 5, width: 300 }}
      />

      {filteredOffers.length === 0 ? (
        <p>No offers found.</p>
      ) : (
        <ul>
          {filteredOffers.map((offer) => (
            <li key={offer.id} style={{ marginBottom: 15 }}>
              <strong>{offer.title}</strong>
              <br />
              {offer.description}
              <br />
              Categories: {offer.categories.join(", ")}
              <br />
              Payout: {renderPayout(offer)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Offers;
