import React, { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving, Theme } from "../data";
import { syncWalletDataToDB } from "../utils/walletSync";

export default function Profile() {
    var { onlineBalance, changeOnlineBalance } = useContext(OnlineBalance);
    var { onlineSpent, changeOnlineSpent } = useContext(OnlineSpent);
    var { offlineBalance, changeOfflineBalance } = useContext(OfflineBalance);
    var { offlineSpent, changeOfflineSpent } = useContext(OfflineSpent);
    var { saving, changeSaving } = useContext(Saving);
    const { loggedin, login, logout, user } = useContext(AuthContext);
    const { isDarkTheme, toggleTheme } = useContext(Theme);
    
    var balance = useRef(0);
    var nav = useNavigate();
    var items = useRef({ item: "", price: 0, medium: "", date: "", spent: "true" });

    var [showAddOnlineBalance, setShowAddOnlineBalance] = useState(false);
    var [showAddOfflineBalance, setShowAddOfflineBalance] = useState(false);
    var [showAddSaving, setShowAddSaving] = useState(false);
    var [showImport, setShowImport] = useState(false);
    var [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Check if user is logged in via localStorage
        const localUser = localStorage.getItem("wallet.user.name");
        if (!localUser || !loggedin) {
            nav('/login');
        }
    }, [loggedin, nav]);

    function addOnlineBalance() {
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "", price: balance.current, medium: "Online", date: date, spent: "false" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOnlineBalance(parseInt(onlineBalance) + parseInt(balance.current));
        alert("added");
        setShowAddOnlineBalance(false);
    }

    function addOfflineBalance() {
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "", price: balance.current, medium: "Offline", date: date, spent: "false" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOfflineBalance(parseInt(offlineBalance) + parseInt(balance.current));
        alert("added");
        setShowAddOfflineBalance(false);
    }

    function addSaving() {
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "ADDED TO SAVINGS", price: balance.current, medium: "Online", date: date, spent: "true" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOnlineBalance(parseInt(onlineBalance) - parseInt(balance.current));
        changeSaving(parseInt(saving) + parseInt(balance.current));
        setShowAddSaving(false);
    }

    async function handleSyncToDatabase() {
        setSyncing(true);
        try {
            console.log("Manual sync initiated...");
            const result = await syncWalletDataToDB();
            
            if (result.success) {
                alert("✅ Data successfully synced to database!");
                console.log("Manual sync completed successfully:", result);
            } else {
                alert("❌ Failed to sync data to database. Please try again.");
                console.error("Manual sync failed:", result);
            }
        } catch (error) {
            alert("❌ Error syncing data to database. Please check your connection.");
            console.error("Manual sync error:", error);
        } finally {
            setSyncing(false);
        }
    }

    function handleThemeToggle() {
        toggleTheme();
        // Show feedback message
        const newTheme = !isDarkTheme ? 'Dark' : 'Light';
        setTimeout(() => {
            console.log(`Switched to ${newTheme} theme`);
        }, 100);
    }

    async function handleLogout() {
        try {
            // Try to logout from backend
            await fetch('http://localhost:5000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Backend logout error:', error);
        }
        
        // Always clear local storage and logout locally
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
        
        logout();
        nav('/login');
    }

    function exportdata() {
        // Step 1: Retrieve the data for multiple keys
        const dataToExport = {
            data: localStorage.getItem("wallet.user.data") || "",
            onlineBalance: localStorage.getItem("wallet.user.onlineBalance") || "",
            offlineBalance: localStorage.getItem("wallet.user.offlineBalance") || "",
            savings: localStorage.getItem("wallet.user.saving") || "",
        };

        // Step 2: Create a Blob object for the JSON string
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: "application/json",
        });

        // Step 3: Generate a downloadable link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const now = new Date(); // Use a single Date instance

        // Format the date and time
        const day = String(now.getDate());
        const month = String(now.getMonth() + 1); // Months are 0-based
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        // Generate the file name
        const fileName = `wallet  ${day}-${month}-${year}  ${hours}-${minutes}.json`;

        link.download = fileName;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]; // Get the uploaded file
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                // Parse the file content
                const importdata = JSON.parse(e.target.result);

                // Validate and save each key back to localStorage
                if (importdata.data) localStorage.setItem("wallet.user.data", importdata.data);
                if (importdata.onlineBalance) localStorage.setItem("wallet.user.onlineBalance", importdata.onlineBalance);
                if (importdata.offlineBalance) localStorage.setItem("wallet.user.offlineBalance", importdata.offlineBalance);
                if (importdata.savings) { localStorage.setItem("wallet.user.saving", importdata.savings); }
                else { localStorage.setItem("wallet.user.saving", 0); }

                alert("Data successfully imported into localStorage!");
                window.location.reload(); // Refresh to update the context
            } catch (error) {
                alert("Invalid file content. Please upload a valid JSON file.");
            }
        };

        reader.onerror = () => {
            alert("Error reading file");
        };

        reader.readAsText(file); // Read the file as text
    };

    if (!loggedin || !localStorage.getItem("wallet.user.name")) {
        nav('/login');
        return null;
    }

    // Get user data from localStorage
    const userName = localStorage.getItem("wallet.user.name");
    const userEmail = localStorage.getItem("wallet.user.email");
    const userPicture = localStorage.getItem("wallet.user.picture");

    return (
        <div className="">
            <div className="profile">
                <div className="pro_name">
                    <div className="d-flex align-items-center mb-3">
                        {userPicture && (
                            <img 
                                src={userPicture} 
                                alt="Profile" 
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    marginRight: '15px'
                                }}
                            />
                        )}
                        <div>
                            <h1>Hey! {userName}</h1>
                            <p className="text-muted mb-0">{userEmail}</p>
                        </div>
                    </div>
                </div>

                <button className={`pro_card ${showAddOnlineBalance ? "pro_card_dis" : ""}`} onClick={() => { setShowAddOnlineBalance(true) }} disabled={showAddOnlineBalance}>Add online money</button>
                {showAddOnlineBalance && <div className="pro_int_box">
                    <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event) => { balance.current = event.target.value }}></input>
                    <button className="pro_btn_ok col-2" onClick={addOnlineBalance}>add</button>
                    <button className="pro_btn_no col-3" onClick={() => { setShowAddOnlineBalance(false) }}>cancel</button>
                </div>}

                <button className="pro_card" onClick={() => { setShowAddOfflineBalance(true) }} disabled={showAddOfflineBalance}>Add offline money</button>
                {showAddOfflineBalance && <div className="pro_int_box">
                    <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event) => { balance.current = event.target.value }}></input>
                    <button className="pro_btn_ok col-2" onClick={addOfflineBalance}>add</button>
                    <button className="pro_btn_no col-3" onClick={() => { setShowAddOfflineBalance(false) }}>cancel</button>
                </div>}

                <button className="pro_card" onClick={() => { setShowAddSaving(true) }} disabled={showAddSaving}>Online to Savings</button>
                {showAddSaving && <div className="pro_int_box">
                    <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event) => { balance.current = event.target.value }}></input>
                    <button className="pro_btn_ok col-2" onClick={addSaving}>add</button>
                    <button className="pro_btn_no col-3" onClick={() => { setShowAddSaving(false) }}>cancel</button>
                </div>}

                <button className="pro_card" onClick={exportdata}>export data</button>
                <button className="pro_card" onClick={() => setShowImport(!showImport)}>import data</button>
                {showImport && <input type="file" className="pro_in" accept=".json" onChange={handleFileUpload} />}
                
                {/* Theme Toggle Button */}
                <button 
                    className="pro_card"
                    onClick={handleThemeToggle}
                    style={{
                        backgroundColor: isDarkTheme ? '#ffc107' : '#6f42c1',
                        borderColor: isDarkTheme ? '#ffc107' : '#6f42c1',
                        color: isDarkTheme ? '#000' : '#fff'
                    }}
                >
                    {isDarkTheme ? (
                        <>
                            <i className="fas fa-sun me-2"></i>
                            Switch to Light Theme
                        </>
                    ) : (
                        <>
                            <i className="fas fa-moon me-2"></i>
                            Switch to Dark Theme
                        </>
                    )}
                </button>
                
                {/* Manual Sync Button */}
                <button 
                    className={`pro_card ${syncing ? "pro_card_dis" : ""}`} 
                    onClick={handleSyncToDatabase}
                    disabled={syncing}
                    style={{
                        backgroundColor: syncing ? '#6c757d' : '#17a2b8',
                        borderColor: syncing ? '#6c757d' : '#17a2b8',
                        color: 'white'
                    }}
                >
                    {syncing ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Syncing to Database...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-sync-alt me-2"></i>
                            Sync to Database
                        </>
                    )}
                </button>
                
                <button className="pro_card" onClick={handleLogout}>Log out</button>
            </div>
        </div>
    );
}