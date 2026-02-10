/**
 * Authentication utilities for handling API calls and automatic logout
 */

// Function to clear all user data and redirect to login
export const performLogout = () => {
    // Clear all localStorage data
    localStorage.removeItem("wallet.user.name");
    localStorage.removeItem("wallet.user.email");
    localStorage.removeItem("wallet.user.picture");
    localStorage.removeItem("wallet.user.id");
    localStorage.removeItem("wallet.user.googleId");
    localStorage.removeItem("wallet.user.data");
    localStorage.removeItem("wallet.user.onlineBalance");
    localStorage.removeItem("wallet.user.onlineSpent");
    localStorage.removeItem("wallet.user.offlineBalance");
    localStorage.removeItem("wallet.user.offlineSpent");
    localStorage.removeItem("wallet.user.saving");
    localStorage.removeItem("wallet.user.categories");
    
    // Redirect to login page
    window.location.href = '/';
};

// Enhanced fetch function that automatically handles 401 responses
export const authenticatedFetch = async (url, options = {}) => {
    try {
        // Ensure credentials are included
        const fetchOptions = {
            ...options,
            credentials: 'include'
        };

        const response = await fetch(url, fetchOptions);

        // Check for unauthorized response
        if (response.status === 401) {
            console.warn('Unauthorized response received. Logging out...');
            performLogout();
            return null; // Return null to indicate the request was aborted due to logout
        }

        return response;
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
};

// Function to check if user is logged in
export const isUserLoggedIn = () => {
    return localStorage.getItem("wallet.user.name") !== null;
};

// Function to get current user info
export const getCurrentUser = () => {
    return {
        name: localStorage.getItem("wallet.user.name"),
        email: localStorage.getItem("wallet.user.email"),
        picture: localStorage.getItem("wallet.user.picture"),
        id: localStorage.getItem("wallet.user.id"),
        googleId: localStorage.getItem("wallet.user.googleId")
    };
}; 