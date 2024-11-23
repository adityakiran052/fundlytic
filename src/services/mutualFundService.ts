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
    // Using more reliable fund IDs that consistently return data
    const fundIds = [
      '119598', // SBI Blue Chip Fund
      '119551', // HDFC Top 100 Fund
      '120505', // ICICI Prudential Bluechip Fund
      '120178', // Axis Bluechip Fund
      '118989', // Kotak Bluechip Fund
      '119235', // Nippon India Large Cap Fund
      '120753', // Tata Large Cap Fund
      '119062', // DSP Top 100 Equity Fund
      '119815', // UTI Mastershare Unit Scheme
      '120243'  // L&T Large Cap Fund
    ];

    const fundsData = await Promise.allSettled(
      fundIds.map(async (id) => {
        try {
          console.log(`Fetching data for fund ${id}`);
          const response = await axios.get(`${BASE_URL}/mf/${id}`);
          
          if (!response.data?.data?.[0]) {
            console.error(`Invalid data structure received for fund ${id}`);
            return null;
          }

          const latestNAV = parseFloat(response.data.data[0].nav);
          const yearAgoIndex = Math.min(252, response.data.data.length - 1);
          const yearAgoNAV = parseFloat(response.data.data[yearAgoIndex].nav);
          const return1y = ((latestNAV - yearAgoNAV) / yearAgoNAV * 100).toFixed(2) + '%';
          
          return {
            id,
            name: response.data.meta.scheme_name || `Fund ${id}`,
            nav: latestNAV,
            aum: response.data.meta.aum || 'N/A',
            return1y,
            return3y: 'N/A',
            category: response.data.meta.scheme_category || 'N/A',
            riskLevel: 'Moderate'
          };
        } catch (error) {
          console.error(`Error fetching fund ${id}:`, error.message);
          return null;
        }
      })
    );

    // Filter out failed requests and null values
    const validFundsData = fundsData
      .filter((result): result is PromiseFulfilledResult<MutualFund | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as MutualFund);

    console.log(`Successfully fetched ${validFundsData.length} funds`);
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
    if (!response.data?.data) {
      throw new Error('Invalid response format');
    }
    
    const history = response.data.data
      .slice(0, 365)
      .map((item: any) => ({
        date: item.date,
        nav: parseFloat(item.nav)
      }))
      .reverse(); // Reverse to show oldest to newest

    console.log(`Successfully fetched history for fund ${fundId}: ${history.length} days`);
    return history;
  } catch (error) {
    console.error('Error fetching fund history:', error);
    throw error;
  }
}