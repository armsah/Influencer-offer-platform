export interface Offer {
  id: string;
  title: string;
  description: string;
  categories: string[];
}

export interface Payout {
  offerId: string;
  type: "CPA" | "FIXED" | "CPA_AND_FIXED";
  cpaAmount?: number;
  fixedAmount?: number;
  cpaCountryOverrides?: Record<string, number>;
}

export interface CustomPayout {
  offerId: string;
  influencerId: string;
  type: "CPA" | "FIXED" | "CPA_AND_FIXED";
  cpaAmount?: number;
  fixedAmount?: number;
  cpaCountryOverrides?: Record<string, number>;
}
