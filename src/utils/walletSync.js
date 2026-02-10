// Utility functions to sync wallet data with backend
import { getApiBaseUrl } from './apiConfig';

// const API_BASE = 'http://localhost:5000';
const API_BASE = getApiBaseUrl();

// Sync all wallet data from localStorage to database
export const syncWalletDataToDB = async () => {
  try {
    const walletData = {
      onlineBalance: parseInt(localStorage.getItem("wallet.user.onlineBalance") || "0"),
      offlineBalance: parseInt(localStorage.getItem("wallet.user.offlineBalance") || "0"),
      onlineSpent: parseInt(localStorage.getItem("wallet.user.onlineSpent") || "0"),
      offlineSpent: parseInt(localStorage.getItem("wallet.user.offlineSpent") || "0"),
      saving: parseInt(localStorage.getItem("wallet.user.saving") || "0"),
      transactions: JSON.parse(localStorage.getItem("wallet.user.data") || "[]")
    };

    const response = await fetch(`${API_BASE}/wallet/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ walletData })
    });

    const data = await response.json();
    console.log('Wallet data synced to DB:', data);
    return data;
  } catch (error) {
    console.error('Error syncing wallet data to DB:', error);
    return { success: false, error };
  }
};

// Load wallet data from database to localStorage
export const loadWalletDataFromDB = async () => {
  try {
    const response = await fetch(`${API_BASE}/wallet`, {
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.success && data.walletData) {
      // Update localStorage with database data
      localStorage.setItem("wallet.user.onlineBalance", data.walletData.onlineBalance.toString());
      localStorage.setItem("wallet.user.offlineBalance", data.walletData.offlineBalance.toString());
      localStorage.setItem("wallet.user.onlineSpent", data.walletData.onlineSpent.toString());
      localStorage.setItem("wallet.user.offlineSpent", data.walletData.offlineSpent.toString());
      localStorage.setItem("wallet.user.saving", data.walletData.saving.toString());
      localStorage.setItem("wallet.user.data", JSON.stringify(data.walletData.transactions));
      
      console.log('Wallet data loaded from DB:', data.walletData);
      return data.walletData;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading wallet data from DB:', error);
    return null;
  }
};

// Add a transaction to database
export const addTransactionToDB = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE}/wallet/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(transaction)
    });

    const data = await response.json();
    
    if (data.success && data.walletData) {
      // Update localStorage with new data from database
      localStorage.setItem("wallet.user.onlineBalance", data.walletData.onlineBalance.toString());
      localStorage.setItem("wallet.user.offlineBalance", data.walletData.offlineBalance.toString());
      localStorage.setItem("wallet.user.onlineSpent", data.walletData.onlineSpent.toString());
      localStorage.setItem("wallet.user.offlineSpent", data.walletData.offlineSpent.toString());
      localStorage.setItem("wallet.user.saving", data.walletData.saving.toString());
      localStorage.setItem("wallet.user.data", JSON.stringify(data.walletData.transactions));
    }
    
    console.log('Transaction added to DB:', data);
    return data;
  } catch (error) {
    console.error('Error adding transaction to DB:', error);
    return { success: false, error };
  }
};

// Update wallet balances in database
export const updateWalletBalances = async (balances) => {
  try {
    const response = await fetch(`${API_BASE}/wallet`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(balances)
    });

    const data = await response.json();
    console.log('Wallet balances updated in DB:', data);
    return data;
  } catch (error) {
    console.error('Error updating wallet balances in DB:', error);
    return { success: false, error };
  }
}; 