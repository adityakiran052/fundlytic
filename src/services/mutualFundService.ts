import axios from 'axios';

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
    // Using unique fund IDs to prevent duplicates
    const fundIds = [
      '100034', '100037', '100041', '100044', '100047',
      '100052', '100058', '100063', '100069', '100074',
      '100078', '100082', '100085', '100087', '100089',
      '100091', '100093', '100095', '100097', '100099'
    ];

    const fundsData = await Promise.all(
      fundIds.map(async (id) => {
        try {
          console.log(`Fetching data for fund ${id}`);
          const response = await axios.get(`${BASE_URL}/mf/${id}`);
          
          if (!response.data || !response.data.data || response.data.data.length === 0) {
            console.error(`No data received for fund ${id}`);
            return null;
          }

          const latestNAV = parseFloat(response.data.data[0].nav);
          const yearAgoIndex = Math.min(252, response.data.data.length - 1);
          const yearAgoNAV = parseFloat(response.data.data[yearAgoIndex].nav);
          const return1y = ((latestNAV - yearAgoNAV) / yearAgoNAV * 100).toFixed(2) + '%';
          
          return {
            id,
            name: response.data.meta.scheme_name,
            nav: latestNAV,
            aum: 'N/A',
            return1y,
            return3y: 'N/A',
            category: response.data.meta.scheme_category || 'N/A',
            riskLevel: 'Moderate'
          };
        } catch (error) {
          console.error(`Error fetching fund ${id}:`, error);
          return null;
        }
      })
    );

    // Filter out any null values from failed requests
    const validFundsData = fundsData.filter((fund): fund is MutualFund => fund !== null);
    console.log('Successfully fetched funds data:', validFundsData);
    return validFundsData;
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    throw error;
  }
}

export const getFundHistory = async (fundId: string): Promise<HistoricalData[]> => {
  console.log(`Fetching history for fund ${fundId}`);
  try {
    const response = await axios.get(`${BASE_URL}/mf/${fundId}`);
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format');
    }
    return response.data.data.slice(0, 365).map((item: any) => ({
      date: item.date,
      nav: parseFloat(item.nav)
    })).reverse(); // Reverse to show oldest to newest
  } catch (error) {
    console.error('Error fetching fund history:', error);
    throw error;
  }
}