import React, { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving, Theme } from "../data";
import { syncWalletDataToDB } from "../utils/walletSync";
import CustomModal from "../component/CustomModal";
import { useCustomModal } from "../hooks/useCustomModal";
import { authenticatedFetch, performLogout } from "../utils/authUtils";
import { getApiUrl } from "../utils/apiConfig";

export default function Profile() {
    var { onlineBalance, changeOnlineBalance } = useContext(OnlineBalance);
    var { onlineSpent, changeOnlineSpent } = useContext(OnlineSpent);
    var { offlineBalance, changeOfflineBalance } = useContext(OfflineBalance);
    var { offlineSpent, changeOfflineSpent } = useContext(OfflineSpent);
    var { saving, changeSaving } = useContext(Saving);
    const { loggedin, login, logout, user } = useContext(AuthContext);
    const { isDarkTheme, toggleTheme } = useContext(Theme);
    
    var nav = useNavigate();
    var [syncing, setSyncing] = useState(false);
    
    // Categories management
    const [categories, setCategories] = useState(() => {
        const storedCategories = localStorage.getItem("wallet.user.categories");
        return storedCategories ? JSON.parse(storedCategories) : ["Food", "Snacks", "Family", "Travel"];
    });

    // External API keys management
    const [apiKeys, setApiKeys] = useState([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [revealedKeys, setRevealedKeys] = useState(new Set());

    // Custom modal hook
    const { modalState, closeModal, showAlert, showConfirm, showInput, showFileUpload, handleConfirm, updateInputValue } = useCustomModal();

    useEffect(() => {
        // Check if user is logged in via localStorage
        const localUser = localStorage.getItem("wallet.user.name");
        if (!localUser || !loggedin) {
            nav('/');
        } else {
            // Load API keys when user is logged in
            fetchApiKeys();
        }
    }, [loggedin, nav]);

    async function handleAddOnlineBalance() {
        const amount = await showInput(
            "Enter the amount to add to your online balance:",
            "Add Online Money",
            "Add Money",
            "Cancel",
            "Enter amount (₹)",
            "number"
        );
        
        if (!amount || amount <= 0) return;
        
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "", price: amount, medium: "Online", date: date, spent: "false", category: "" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOnlineBalance(parseInt(onlineBalance) + parseInt(amount));
        await showAlert("Online balance added successfully!", "Success");
    }

    async function handleAddOfflineBalance() {
        const amount = await showInput(
            "Enter the amount to add to your offline balance:",
            "Add Offline Money",
            "Add Money",
            "Cancel",
            "Enter amount (₹)",
            "number"
        );
        
        if (!amount || amount <= 0) return;
        
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "", price: amount, medium: "Offline", date: date, spent: "false", category: "" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOfflineBalance(parseInt(offlineBalance) + parseInt(amount));
        await showAlert("Offline balance added successfully!", "Success");
    }

    async function handleAddSaving() {
        const amount = await showInput(
            "Enter the amount to transfer from online balance to savings:",
            "Transfer to Savings",
            "Transfer",
            "Cancel",
            "Enter amount (₹)",
            "number"
        );
        
        if (!amount || amount <= 0) return;
        
        if (parseInt(amount) > parseInt(onlineBalance)) {
            await showAlert("Insufficient online balance! Cannot transfer more than your current online balance.", "Insufficient Balance");
            return;
        }
        
        const data = JSON.parse(localStorage.getItem("wallet.user.data") || "[]");
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
        var item = { item: "ADDED TO SAVINGS", price: amount, medium: "Online", date: date, spent: "true", category: "" };
        data.push(item);
        localStorage.setItem("wallet.user.data", JSON.stringify(data));
        changeOnlineBalance(parseInt(onlineBalance) - parseInt(amount));
        changeSaving(parseInt(saving) + parseInt(amount));
        await showAlert("Amount successfully transferred to savings!", "Transfer Successful");
    }

    async function handleSyncToDatabase() {
        const confirmSync = await showConfirm(
            "Are you sure you want to sync your data to the database?\n\nThis will upload your local wallet data to the cloud.",
            "Sync to Database",
            "Sync Now",
            "Cancel"
        );
        
        if (!confirmSync) return;

        setSyncing(true);
        try {
            console.log("Manual sync initiated...");
            const result = await syncWalletDataToDB();
            
            if (result.success) {
                await showAlert("✅ Data successfully synced to database!", "Sync Successful");
                console.log("Manual sync completed successfully:", result);
            } else {
                await showAlert("❌ Failed to sync data to database. Please try again.", "Sync Failed");
                console.error("Manual sync failed:", result);
            }
        } catch (error) {
            await showAlert("❌ Error syncing data to database. Please check your connection.", "Sync Error");
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
        const confirmLogout = await showConfirm(
            "Are you sure you want to log out?\n\nThis will clear all your local data and return you to the login page.",
            "Logout Confirmation",
            "Logout",
            "Cancel"
        );
        
        if (!confirmLogout) return;

        try {
            // Try to logout from backend
            await authenticatedFetch(getApiUrl('/auth/logout'), {
                method: 'POST'
            });
        } catch (error) {
            console.error('Backend logout error:', error);
        }
        
        // Use the centralized logout function
        performLogout();
    }

    async function exportdata() {
        const confirmExport = await showConfirm(
            "Are you sure you want to export your wallet data?\n\nThis will download a JSON file containing all your financial data to your device.",
            "Export Data",
            "Export",
            "Cancel"
        );
        
        if (!confirmExport) return;

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

    async function handleImportClick() {
        const confirmShowImport = await showConfirm(
            "Are you sure you want to import wallet data?\n\n⚠️ WARNING: Importing data will REPLACE all your current wallet data!\n\nBefore proceeding, make sure you have exported your current data as backup.\n\nDo you want to continue and select a file?",
            "Import Data Warning",
            "Continue",
            "Cancel"
        );
        
        if (confirmShowImport) {
            const file = await showFileUpload(
                "Select your wallet backup file to import:",
                "Import Wallet Data",
                "Cancel"
            );
            
            if (file) {
                await handleFileUpload({ target: { files: [file] } });
            }
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]; // Get the uploaded file
        if (!file) return;

        const confirmImport = await showConfirm(
            `Are you sure you want to import data from "${file.name}"?\n\n⚠️ FINAL WARNING: This will REPLACE all your current wallet data!\n\nThis action cannot be undone.`,
            "Final Import Confirmation",
            "Import Now",
            "Cancel"
        );
        
        if (!confirmImport) {
            // Clear the file input to allow selecting the same file again
            event.target.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                // Parse the file content
                const importdata = JSON.parse(e.target.result);

                // Validate and save each key back to localStorage
                if (importdata.data) localStorage.setItem("wallet.user.data", importdata.data);
                if (importdata.onlineBalance) localStorage.setItem("wallet.user.onlineBalance", importdata.onlineBalance);
                if (importdata.offlineBalance) localStorage.setItem("wallet.user.offlineBalance", importdata.offlineBalance);
                if (importdata.savings) { localStorage.setItem("wallet.user.saving", importdata.savings); }
                else { localStorage.setItem("wallet.user.saving", 0); }

                await showAlert("Data successfully imported! The page will refresh to update your wallet.", "Import Successful");
                window.location.reload(); // Refresh to update the context
            } catch (error) {
                await showAlert("Invalid file content. Please upload a valid JSON file.", "Import Error");
            }
        };

        reader.onerror = async () => {
            await showAlert("Error reading file. Please try again.", "File Error");
        };

        reader.readAsText(file); // Read the file as text
    };

    // Category management functions
    async function handleAddCategory() {
        const categoryName = await showInput(
            "Enter a new category name:",
            "Add Category",
            "Add",
            "Cancel",
            "Category name"
        );
        
        if (!categoryName || categoryName.trim() === "") return;
        
        const trimmedName = categoryName.trim();
        if (categories.includes(trimmedName)) {
            await showAlert("This category already exists!", "Duplicate Category");
            return;
        }
        
        const newCategories = [...categories, trimmedName];
        setCategories(newCategories);
        localStorage.setItem("wallet.user.categories", JSON.stringify(newCategories));
        await showAlert("Category added successfully!", "Success");
    }

    async function handleRemoveCategory(categoryToRemove) {
        const confirmRemove = await showConfirm(
            `Are you sure you want to remove the category "${categoryToRemove}"?\n\nThis won't affect existing expense data.`,
            "Remove Category",
            "Remove",
            "Cancel"
        );
        
        if (!confirmRemove) return;
        
        const newCategories = categories.filter(cat => cat !== categoryToRemove);
        setCategories(newCategories);
        localStorage.setItem("wallet.user.categories", JSON.stringify(newCategories));
        await showAlert("Category removed successfully!", "Success");
    }

    async function handleEditCategory(oldCategory) {
        const newCategoryName = await showInput(
            `Edit category name:`,
            "Edit Category",
            "Update",
            "Cancel",
            "Category name",
            "text",
            oldCategory
        );
        
        if (!newCategoryName || newCategoryName.trim() === "") return;
        
        const trimmedName = newCategoryName.trim();
        if (trimmedName === oldCategory) return; // No change
        
        if (categories.includes(trimmedName)) {
            await showAlert("This category already exists!", "Duplicate Category");
            return;
        }
        
        const newCategories = categories.map(cat => cat === oldCategory ? trimmedName : cat);
        setCategories(newCategories);
        localStorage.setItem("wallet.user.categories", JSON.stringify(newCategories));
        await showAlert("Category updated successfully!", "Success");
    }

    // External API key management functions
    async function fetchApiKeys() {
        try {
            setLoadingKeys(true);
            const response = await authenticatedFetch(getApiUrl('/external/keys'), {
                method: 'GET'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data.keys || []);
            } else {
                console.error('Failed to fetch API keys');
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
        } finally {
            setLoadingKeys(false);
        }
    }

    async function handleRevealKey(keyId, keyName) {
        const confirmReveal = await showConfirm(
            `Are you sure you want to reveal the full API key for "${keyName}"?\n\n⚠️ Make sure no one else can see your screen before proceeding.`,
            "Reveal API Key",
            "Show Key",
            "Cancel"
        );
        
        if (!confirmReveal) return;

        try {
            const response = await authenticatedFetch(getApiUrl(`/external/keys/${keyId}/reveal`), {
                method: 'GET'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                // Add this key to revealed keys and update the state
                setRevealedKeys(prev => new Set([...prev, keyId]));
                setApiKeys(prevKeys => prevKeys.map(key => 
                    key.id === keyId ? { ...key, fullKey: data.key } : key
                ));
            } else {
                await showAlert(`❌ Failed to reveal API key: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error revealing API key. Please check your connection.", "Error");
            console.error('Error revealing API key:', error);
        }
    }

    async function handleCopyKey(keyValue, keyName) {
        try {
            await navigator.clipboard.writeText(keyValue);
            await showAlert(`✅ API key "${keyName}" copied to clipboard!`, "Copied");
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = keyValue;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            await showAlert(`✅ API key "${keyName}" copied to clipboard!`, "Copied");
        }
    }

    function handleHideKey(keyId) {
        setRevealedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(keyId);
            return newSet;
        });
        setApiKeys(prevKeys => prevKeys.map(key => 
            key.id === keyId ? { ...key, fullKey: undefined } : key
        ));
    }

    async function handleCreateApiKey() {
        const keyName = await showInput(
            "Enter a name for this API key:",
            "Create API Key",
            "Create",
            "Cancel",
            "Key name (e.g., 'Mobile App', 'Automation Script')"
        );
        
        if (!keyName || keyName.trim() === "") return;
        
        try {
            const response = await authenticatedFetch(getApiUrl('/external/keys'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: keyName.trim() })
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                // Show the API key to user (only time they'll see it)
                await showAlert(
                    `✅ API Key created successfully!\n\n🔑 Key: ${data.key.key}\n\n⚠️ Important: Copy this key now - you won't be able to see it again!`,
                    "API Key Created"
                );
                
                // Refresh the keys list
                fetchApiKeys();
            } else {
                await showAlert(`❌ Failed to create API key: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error creating API key. Please check your connection.", "Error");
            console.error('Error creating API key:', error);
        }
    }

    async function handleDeleteApiKey(keyId, keyName) {
        const confirmDelete = await showConfirm(
            `Are you sure you want to delete the API key "${keyName}"?\n\n⚠️ This action cannot be undone and will immediately disable access for any applications using this key.`,
            "Delete API Key",
            "Delete",
            "Cancel"
        );
        
        if (!confirmDelete) return;
        
        try {
            const response = await authenticatedFetch(getApiUrl(`/external/keys/${keyId}`), {
                method: 'DELETE'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                await showAlert("✅ API key deleted successfully!", "Success");
                fetchApiKeys();
            } else {
                await showAlert(`❌ Failed to delete API key: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error deleting API key. Please check your connection.", "Error");
            console.error('Error deleting API key:', error);
        }
    }

    async function handleCopyEndpoint() {
        const endpoint = getApiUrl('/external/expense');
        
        try {
            await navigator.clipboard.writeText(endpoint);
            await showAlert("✅ Endpoint URL copied to clipboard!", "Copied");
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = endpoint;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            await showAlert("✅ Endpoint URL copied to clipboard!", "Copied");
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    async function handleShowUsageDetails() {
        const usageDetails = `🔗 ENDPOINT
POST ${getApiUrl('/external/expense')}

📋 HEADERS
Content-Type: application/json
X-API-Key: [your-api-key]

📝 SINGLE EXPENSE EXAMPLE
{
  "purpose": "Grocery shopping",
  "amount": 150,
  "medium": "Offline"
}

📝 MULTIPLE EXPENSES EXAMPLE
[
  {
    "purpose": "Coffee",
    "amount": 50,
    "medium": "Online"
  },
  {
    "description": "Bus fare", 
    "amount": 25
  }
]

📚 REQUIRED FIELDS
• purpose OR description: Item name (required)
• amount: Price in ₹ (required)

📚 OPTIONAL FIELDS  
• medium: "Online" or "Offline" (defaults to "Online")
• category: Expense category

✅ SUCCESS RESPONSE
Single expense:
{"success": true, "transactionId": "abc123"}

Multiple expenses:
{"success": true, "transactions": [{...}]}

🔄 APPROVAL WORKFLOW
1. Submit expense via API
2. Expense appears in "External Expenses" modal
3. Review and approve/edit/reject from home page
4. Approved expenses are added to your wallet

💡 TIP: Use either "purpose" or "description" for the item name. Both work the same way.`;

        await showAlert(usageDetails, "API Usage Guide");
    }

    if (!loggedin || !localStorage.getItem("wallet.user.name")) {
        nav('/');
        return null;
    }

    // Get user data from localStorage
    const userName = localStorage.getItem("wallet.user.name");
    const userEmail = localStorage.getItem("wallet.user.email");
    const userPicture = localStorage.getItem("wallet.user.picture");

    return (
        <div className="" style={{ margin: 0, padding: 0 }}>
            <div className="profile">
                <div className="pro_name">
                    <div className="d-flex align-items-center mb-2">
                        {userPicture && (
                            <img 
                                src={userPicture} 
                                alt="Profile" 
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    marginRight: '12px'
                                }}
                            />
                        )}
                        <div>
                            <h2 style={{ fontSize: '1.25rem', margin: '0', fontWeight: '600', color: 'var(--pro_name_text)' }}>Hey! {userName}</h2>
                            <p style={{ fontSize: '0.85rem', margin: '0', color: 'var(--modal_text)', opacity: '0.7' }}>{userEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-sections-container">
                    {/* Add Money Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Add Money</h3>
                        <div className="pro_button_row">
                            <button className="pro_card" onClick={handleAddOnlineBalance}>Add Online</button>
                            <button className="pro_card" onClick={handleAddOfflineBalance}>Add Offline</button>
                        </div>
                    </div>

                    {/* Savings Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Savings</h3>
                        <button className="pro_card" onClick={handleAddSaving}>Online to Savings</button>
                    </div>

                    {/* User Data Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">User Data</h3>
                        <div className="pro_button_row">
                            <button className="pro_card" onClick={exportdata}>Export Data</button>
                            <button className="pro_card" onClick={handleImportClick}>Import Data</button>
                        </div>
                    </div>
                    
                    {/* Sync to Cloud Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Sync to Cloud</h3>
                        <button 
                            className={`pro_card ${syncing ? "pro_card_syncing" : ""}`} 
                            onClick={handleSyncToDatabase}
                            disabled={syncing}
                        >
                            {syncing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Syncing to Cloud...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sync-alt me-2"></i>
                                    Sync to Cloud
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Theme Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Theme</h3>
                        <button 
                            className="pro_card"
                            onClick={handleThemeToggle}
                        >
                            {isDarkTheme ? (
                                <>
                                    <i className="fas fa-sun me-2"></i>
                                    Switch to Dark Theme
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-moon me-2"></i>
                                    Switch to Light Theme
                                </>
                            )}
                        </button>
                    </div>

                    {/* Categories Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Categories</h3>
                        <div className="minimal-categories-list">
                            {categories.map((category, index) => (
                                <div key={index} className="minimal-category-item">
                                    <span className="minimal-category-name">{category}</span>
                                    <div className="minimal-category-actions">
                                        <button 
                                            className="minimal-action-btn edit"
                                            onClick={() => handleEditCategory(category)}
                                            title="Edit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                            </svg>
                                        </button>
                                        <button 
                                            className="minimal-action-btn delete"
                                            onClick={() => handleRemoveCategory(category)}
                                            title="Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button className="minimal-add-category" onClick={handleAddCategory}>
                                + Add Category
                            </button>
                        </div>
                    </div>

                    {/* External Source Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">External Source</h3>
                        
                        {/* API Endpoint */}
                        <div className="external-endpoint-container">
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--modal_text)' }}>API Endpoint</h4>
                            <div className="external-endpoint">
                                <div style={{ 
                                    background: 'var(--modal_input_bg)', 
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'var(--modal_text)',
                                    border: '1px solid var(--modal_border)'
                                }}>
                                    <code style={{ 
                                        background: 'transparent',
                                        wordBreak: 'break-all',
                                        flex: 1,
                                        color: 'var(--modal_text)'
                                    }}>
                                        POST {getApiUrl('/external/expense')}
                                    </code>
                                    <button 
                                        onClick={handleCopyEndpoint} 
                                        style={{ 
                                            background: 'var(--modal_confirm_bg)',
                                            color: 'var(--modal_confirm_text)',
                                            border: '1px solid var(--modal_confirm_border)',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}
                                        title="Copy endpoint URL"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* API Keys Management */}
                        <div className="external-keys-container" style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <h4 style={{ fontSize: '0.9rem', margin: '0', color: 'var(--modal_text)' }}>API Keys</h4>
                                <svg 
                                    onClick={handleCreateApiKey}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="18" 
                                    height="18" 
                                    fill="currentColor" 
                                    className="bi bi-plus-circle-fill" 
                                    viewBox="0 0 16 16"
                                    style={{ 
                                        cursor: 'pointer', 
                                        color: 'var(--modal_text)',
                                        opacity: '0.8',
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.opacity = '1'}
                                    onMouseOut={(e) => e.target.style.opacity = '0.8'}
                                    title="Create API Key"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
                                </svg>
                            </div>
                            
                            {loadingKeys ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--modal_text)' }}>
                                    Loading keys...
                                </div>
                            ) : apiKeys.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--modal_text)', fontSize: '0.85rem', opacity: '0.7' }}>
                                    No API keys created yet. Create one to start receiving external expenses.
                                </div>
                            ) : (
                                <div className="external-keys-list">
                                    {apiKeys.map((key) => (
                                        <div key={key.id} className="external-key-item" style={{
                                            background: 'var(--modal_input_bg)',
                                            border: '1px solid var(--modal_border)',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            marginBottom: '6px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.8rem', marginBottom: '3px', color: 'var(--modal_text)' }}>
                                                        {key.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--modal_text)', fontFamily: 'monospace', marginBottom: '6px', opacity: '0.8' }}>
                                                        {revealedKeys.has(key.id) && key.fullKey ? (
                                                            <div style={{ 
                                                                background: 'var(--theme)', 
                                                                padding: '6px', 
                                                                borderRadius: '3px', 
                                                                border: '1px solid var(--modal_border)',
                                                                wordBreak: 'break-all',
                                                                position: 'relative'
                                                            }}>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--modal_text)', marginBottom: '3px', opacity: '0.7' }}>
                                                                    Full API Key:
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--modal_text)' }}>
                                                                    {key.fullKey}
                                                                </div>
                                                                <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                                                                    <button 
                                                                        onClick={() => handleCopyKey(key.fullKey, key.name)}
                                                                        style={{
                                                                            background: 'var(--modal_confirm_bg)',
                                                                            color: 'var(--modal_confirm_text)',
                                                                            border: '1px solid var(--modal_confirm_border)',
                                                                            borderRadius: '3px',
                                                                            padding: '2px 6px',
                                                                            fontSize: '0.65rem',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleHideKey(key.id)}
                                                                        style={{
                                                                            background: 'transparent',
                                                                            color: 'var(--modal_cancel_text)',
                                                                            border: '1px solid var(--modal_cancel_border)',
                                                                            borderRadius: '3px',
                                                                            padding: '2px 6px',
                                                                            fontSize: '0.65rem',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Hide
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: 'var(--modal_text)' }}>
                                                                {key.keyPreview}
                                                                <button 
                                                                    onClick={() => handleRevealKey(key.id, key.name)}
                                                                    style={{
                                                                        background: 'var(--modal_confirm_bg)',
                                                                        color: 'var(--modal_confirm_text)',
                                                                        border: '1px solid var(--modal_confirm_border)',
                                                                        borderRadius: '3px',
                                                                        padding: '1px 4px',
                                                                        fontSize: '0.6rem',
                                                                        cursor: 'pointer',
                                                                        marginLeft: '6px'
                                                                    }}
                                                                >
                                                                    Show
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--modal_text)', marginTop: '3px', opacity: '0.6' }}>
                                                        Created: {formatDate(key.createdAt)}
                                                        {key.lastUsed && (
                                                            <span> • Last used: {formatDate(key.lastUsed)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="minimal-action-btn delete"
                                                    onClick={() => handleDeleteApiKey(key.id, key.name)}
                                                    title="Delete Key"
                                                    style={{ marginLeft: '8px', padding: '4px' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Usage Instructions */}
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <a 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleShowUsageDetails();
                                }}
                                style={{ 
                                    color: 'var(--modal_text)',
                                    textDecoration: 'underline',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    opacity: '0.8'
                                }}
                                onMouseOver={(e) => e.target.style.opacity = '1'}
                                onMouseOut={(e) => e.target.style.opacity = '0.8'}
                            >
                                View API Usage Guide
                            </a>
                        </div>
                    </div>
                    
                    {/* Account Section */}
                    <div className="pro_section">
                        <h3 className="pro_section_title">Account</h3>
                        <button className="pro_card" onClick={handleLogout}>Log out</button>
                    </div>
                </div>
            </div>

            {/* Custom Modal */}
            <CustomModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                inputValue={modalState.inputValue}
                onInputChange={updateInputValue}
                inputPlaceholder={modalState.inputPlaceholder}
                inputType={modalState.inputType}
                onFileSelect={modalState.onFileSelect}
            />
        </div>
    );
}