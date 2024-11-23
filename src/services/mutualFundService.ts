import axios from 'axios';

const API_KEY = 'demo'; // Replace with your actual API key
const BASE_URL = 'https://api.mfapi.in';

export interface MutualFund {
  id: string;
  name: string;
  nav: number;
  aum: string;
  return1y: string;
  return3y: string;
  category: string;
  riskLevel: string;
}

export interface HistoricalData {
  date: string;
  nav: number;
}

export const getMutualFunds = async (): Promise<MutualFund[]> => {
  console.log('Fetching mutual funds list');
  try {
    const response = await axios.get(`${BASE_URL}/mf`);
    return response.data.map((fund: any) => ({
      id: fund.schemeCode,
      name: fund.schemeName,
      nav: parseFloat(fund.nav),
      aum: fund.aum || 'N/A',
      return1y: fund.return1y || 'N/A',
      return3y: fund.return3y || 'N/A',
      category: fund.category || 'N/A',
      riskLevel: fund.riskLevel || 'Moderate'
    }));
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    throw error;
  }
}

export const getFundHistory = async (fundId: string): Promise<HistoricalData[]> => {
  console.log(`Fetching history for fund ${fundId}`);
  try {
    const response = await axios.get(`${BASE_URL}/mf/${fundId}`);
    return response.data.data.map((item: any) => ({
      date: item.date,
      nav: parseFloat(item.nav)
    }));
  } catch (error) {
    console.error('Error fetching fund history:', error);
    throw error;
  }
}