import { useEffect, useState } from "react";
import App from "./App";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving, Theme } from "./data";
import { syncWalletDataToDB, updateWalletBalances } from "./utils/walletSync";

export default function ContextProvider() {
    const [loggedin, setLoggedin] = useState(() => {
        // Check if user exists in localStorage on initialization
        const hasUser = localStorage.getItem("wallet.user.name") !== null;
        console.log("ContextProvider initializing, user exists in localStorage:", hasUser);
        return hasUser;
    });
    const [user, setUser] = useState(() => {
        // Initialize user from localStorage if available
        const userName = localStorage.getItem("wallet.user.name");
        if (userName) {
            const userData = {
                name: userName,
                email: localStorage.getItem("wallet.user.email"),
                picture: localStorage.getItem("wallet.user.picture"),
                id: localStorage.getItem("wallet.user.id"),
                googleId: localStorage.getItem("wallet.user.googleId")
            };
            console.log("ContextProvider initializing with user data:", userData);
            return userData;
        }
        console.log("ContextProvider initializing with no user data");
        return null;
    });
    
    // Flag to prevent auto-sync during initial data loading
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    
    var [onlineBalance, setOnlineBalance] = useState(localStorage.getItem("wallet.user.onlineBalance") !== null ? localStorage.getItem("wallet.user.onlineBalance") : 0);
    var [onlineSpent, setOnlineSpent] = useState(localStorage.getItem("wallet.user.onlineSpent") !== null ? localStorage.getItem("wallet.user.onlineSpent") : 0);
    var [offlineBalance, setOfflineBalance] = useState(localStorage.getItem("wallet.user.offlineBalance") !== null ? localStorage.getItem("wallet.user.offlineBalance") : 0);
    var [offlineSpent, setOfflineSpent] = useState(localStorage.getItem("wallet.user.offlineSpent") !== null ? localStorage.getItem("wallet.user.offlineSpent") : 0);
    var [saving, setSaving] = useState(localStorage.getItem("wallet.user.saving") !== null ? localStorage.getItem("wallet.user.saving") : 0);

    // Automatic theme control
    const [isDarkTheme, setIsDarkTheme] = useState(parseInt(new Date().getHours()) >= parseInt(6) && parseInt(new Date().getHours()) <= parseInt(15) ? true : false);

    // Debug effect to track state changes
    useEffect(() => {
        console.log("ContextProvider state changed - loggedin:", loggedin, "user:", user);
        // Mark initial load as complete after first render
        if (!initialLoadComplete) {
            setTimeout(() => setInitialLoadComplete(true), 1000);
        }
    }, [loggedin, user]);

    useEffect(() => {
        const root = document.documentElement; // Access the <html> element
        if (!isDarkTheme) {
            root.classList.remove("dark_theme");// Remove the dark theme class
        } else {
            root.classList.add("dark_theme"); // Add the dark theme class
        }
    }, [isDarkTheme])

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
        // Toggle the state
    };

    const changeOnlineBalance = async (value) => {
        localStorage.setItem("wallet.user.onlineBalance", value)
        setOnlineBalance(value)
        
        // Only sync to database if initial load is complete and user is logged in
        if (loggedin && initialLoadComplete) {
            try {
                await updateWalletBalances({ onlineBalance: parseInt(value) });
            } catch (error) {
                console.error("Failed to sync onlineBalance to DB:", error);
            }
        }
    }

    const changeOnlineSpent = async (value) => {
        localStorage.setItem("wallet.user.onlineSpent", value)
        setOnlineSpent(value)
        
        // Only sync to database if initial load is complete and user is logged in
        if (loggedin && initialLoadComplete) {
            try {
                await updateWalletBalances({ onlineSpent: parseInt(value) });
            } catch (error) {
                console.error("Failed to sync onlineSpent to DB:", error);
            }
        }
    }

    const changeOfflineBalance = async (value) => {
        localStorage.setItem("wallet.user.offlineBalance", value)
        setOfflineBalance(value)
        
        // Only sync to database if initial load is complete and user is logged in
        if (loggedin && initialLoadComplete) {
            try {
                await updateWalletBalances({ offlineBalance: parseInt(value) });
            } catch (error) {
                console.error("Failed to sync offlineBalance to DB:", error);
            }
        }
    }

    const changeOfflineSpent = async (value) => {
        localStorage.setItem("wallet.user.offlineSpent", value)
        setOfflineSpent(value)
        
        // Only sync to database if initial load is complete and user is logged in
        if (loggedin && initialLoadComplete) {
            try {
                await updateWalletBalances({ offlineSpent: parseInt(value) });
            } catch (error) {
                console.error("Failed to sync offlineSpent to DB:", error);
            }
        }
    }

    const changeSaving = async (value) => {
        localStorage.setItem("wallet.user.saving", value)
        setSaving(value)
        
        // Only sync to database if initial load is complete and user is logged in
        if (loggedin && initialLoadComplete) {
            try {
                await updateWalletBalances({ saving: parseInt(value) });
            } catch (error) {
                console.error("Failed to sync saving to DB:", error);
            }
        }
    }

    const login = (userData = null) => {
        console.log("ContextProvider login called with userData:", userData);
        setLoggedin(true);
        setInitialLoadComplete(false); // Reset to allow data loading without sync
        if (userData) {
            setUser(userData);
        }
        
        // Refresh wallet data from localStorage after login
        refreshWalletDataFromStorage();
    }
    
    const refreshWalletDataFromStorage = () => {
        setOnlineBalance(localStorage.getItem("wallet.user.onlineBalance") || "0");
        setOfflineBalance(localStorage.getItem("wallet.user.offlineBalance") || "0");
        setOnlineSpent(localStorage.getItem("wallet.user.onlineSpent") || "0");
        setOfflineSpent(localStorage.getItem("wallet.user.offlineSpent") || "0");
        setSaving(localStorage.getItem("wallet.user.saving") || "0");
    }

    const logout = async () => {
        console.log("ContextProvider logout called");
        
        // // Sync final wallet data to database before logout
        // if (loggedin && initialLoadComplete) {
        //     try {
        //         console.log("Syncing final wallet data to database...");
        //         await syncWalletDataToDB();
        //     } catch (error) {
        //         console.error("Failed to sync wallet data to DB on logout:", error);
        //     }
        // }
        
        setLoggedin(false);
        setUser(null);
        setInitialLoadComplete(false);
        // Clear all local storage data
        localStorage.removeItem("wallet.user.name");
        localStorage.removeItem("wallet.user.email");
        localStorage.removeItem("wallet.user.picture");
        localStorage.removeItem("wallet.user.id");
        localStorage.removeItem("wallet.user.googleId");
        localStorage.removeItem("wallet.user.onlineBalance");
        localStorage.removeItem("wallet.user.onlineSpent");
        localStorage.removeItem("wallet.user.offlineBalance");
        localStorage.removeItem("wallet.user.offlineSpent");
        localStorage.removeItem("wallet.user.saving");
        localStorage.removeItem("wallet.user.data");
        
        // Reset state values
        setOnlineBalance(0);
        setOnlineSpent(0);
        setOfflineBalance(0);
        setOfflineSpent(0);
        setSaving(0);
    }

    return (
        <AuthContext.Provider value={{ loggedin, login, logout, user }}>
            <OnlineBalance.Provider value={{ onlineBalance, changeOnlineBalance }}>
                <OnlineSpent.Provider value={{ onlineSpent, changeOnlineSpent }}>
                    <OfflineBalance.Provider value={{ offlineBalance, changeOfflineBalance }}>
                        <OfflineSpent.Provider value={{ offlineSpent, changeOfflineSpent }}>
                            <Saving.Provider value={{ saving, changeSaving }}>
                                <Theme.Provider value={{ isDarkTheme, toggleTheme }}>
                                    <App />
                                </Theme.Provider>
                            </Saving.Provider>
                        </OfflineSpent.Provider>
                    </OfflineBalance.Provider>
                </OnlineSpent.Provider>
            </OnlineBalance.Provider>
        </AuthContext.Provider>
    )
}