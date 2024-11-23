import type { MutualFund } from "../services/mutualFundService";

export interface Portfolio {
  [fundId: string]: {
    units: number;
    fund: MutualFund;
    purchaseNav: number;
  };
}