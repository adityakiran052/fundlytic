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
    const fundIds = [
      '119598', '119597', '119596', '119595', '119594',
      '119593', '119592', '119591', '119590', '119589',
      '119588', '119587', '119586', '119585', '119584',
      '119583', '119582', '119581', '119580', '119579'
    ];

    const fundsData = await Promise.all(
      fundIds.map(async (id) => {
        const response = await axios.get(`${BASE_URL}/mf/${id}`);
        const latestNAV = parseFloat(response.data.data[0].nav);
        const yearAgoNAV = parseFloat(response.data.data[252].nav || response.data.data[response.data.data.length - 1].nav);
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
      })
    );

    console.log('Fetched funds data:', fundsData);
    return fundsData;
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    throw error;
  }
}

export const getFundHistory = async (fundId: string): Promise<HistoricalData[]> => {
  console.log(`Fetching history for fund ${fundId}`);
  try {
    const response = await axios.get(`${BASE_URL}/mf/${fundId}`);
    return response.data.data.slice(0, 365).map((item: any) => ({
      date: item.date,
      nav: parseFloat(item.nav)
    }));
  } catch (error) {
    console.error('Error fetching fund history:', error);
    throw error;
  }
}