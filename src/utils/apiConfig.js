/**
 * API Configuration utilities for handling API base URL
 */
const baseUrl="https://darkwallet-api-o07s.onrender.com";
console.log('baseUrl',baseUrl);

// Function to get the API base URL with proper fallback logic
 export const getApiBaseUrl = () => {
        return baseUrl;
  
};

// Function to build API endpoint URL
export const getApiUrl = (endpoint) => {
   
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

// Export the base URL as a constant (will be evaluated at runtime)
export const API_BASE_URL = baseUrl; 