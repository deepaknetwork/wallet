import React, { useContext, useRef, useState } from "react";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { useNavigate } from "react-router-dom";
import {OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving } from "../data";
import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import CustomModal from "../component/CustomModal";
import { useCustomModal } from "../hooks/useCustomModal";
import PendingTransactionsModal from "../component/PendingTransactionsModal";
import { authenticatedFetch } from "../utils/authUtils";
import { getApiUrl } from "../utils/apiConfig";

export default function Home()
{
    
    var month_array=["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    // Get categories from localStorage or use defaults
    const getCategories = () => {
        const storedCategories = localStorage.getItem("wallet.user.categories");
        return storedCategories ? JSON.parse(storedCategories) : ["Food", "Snacks", "Family", "Travel"];
    };
    
    const [categories, setCategories] = useState(getCategories());
    const [purposeInput, setPurposeInput] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    var spent_month=0;
    var spent_year="";
    var spent_cal_sum=0;
    var spent_cal=[]
    var add_month=0;
    var add_year="";
    var add_cal_sum=0;
    var add_cal=[]
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)
    var {saving,changeSaving}=useContext(Saving)

    // Get data from localStorage with proper null checking
    const rawData = localStorage.getItem("wallet.user.data");
    const data = rawData ? JSON.parse(rawData) : [];
    
    // Only process data if it exists and has items
    if (data && data.length > 0) {
        data.map(i=>{
            if(i.spent=="true"){  
                if(parseInt(spent_month)===parseInt(parseInt(i.date.toString().split("/")[1]))){
                    spent_cal_sum=parseInt(spent_cal_sum)+parseInt(i.price)
                }else{
                    var str=i.date.toString().split("/")
                    spent_cal.push({month:month_array[parseInt(spent_month)],year:spent_year,ammount:spent_cal_sum})
                    spent_cal_sum=i.price
                    spent_month=parseInt(str[1])
                    spent_year=str[2]
                }}
            else{
                if(parseInt(add_month)===parseInt(parseInt(i.date.toString().split("/")[1]))){
                    add_cal_sum=parseInt(add_cal_sum)+parseInt(i.price)
                }else{
                    var str=i.date.toString().split("/")
                    add_cal.push({month:month_array[parseInt(add_month)],year:add_year,ammount:add_cal_sum})
                    add_cal_sum=i.price
                    add_month=parseInt(str[1])
                    add_year=str[2]
                }
            }
        });
    }
    
    // Add final entries (handle empty arrays)
    spent_cal.push({month:month_array[parseInt(spent_month)],year:spent_year,ammount:spent_cal_sum})
    add_cal.push({month:month_array[parseInt(add_month)],year:add_year,ammount:add_cal_sum})
    
    // Ensure arrays have at least one element with safe defaults
    if (spent_cal.length === 0) {
        spent_cal.push({month:"", year:"", ammount:0});
    }
    if (add_cal.length === 0) {
        add_cal.push({month:"", year:"", ammount:0});
    }
    
    var[curSpentMonth,setCurSpentMonth]=useState(Math.max(0, spent_cal.length-1))
    var[curAddMonth,setCurAddMonth]=useState(Math.max(0, add_cal.length-1))
    var nav=useNavigate()
    var items=useRef({item:"",price:0,medium:"",date:"",spent:"true",category:""})

    // Custom modal hook
    const { modalState, closeModal, showAlert, showConfirm, showInput, showFileUpload, handleConfirm, updateInputValue } = useCustomModal();

    // Pending transactions modal
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Listen for category changes in localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            setCategories(getCategories());
        };
        
        // Listen for storage events (cross-tab changes)
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for changes within the same tab
        const intervalId = setInterval(handleStorageChange, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
        }, []);

    // Fetch pending transactions count on component mount and periodically
    useEffect(() => {
        fetchPendingCount();
        
        // Also fetch every 30 seconds to keep it updated
        const interval = setInterval(fetchPendingCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (showPendingModal) {
            // Store current scroll position
            const scrollY = window.scrollY;
            
            // Add modal-open class to body and html for CSS-based scrollbar hiding
            document.body.classList.add('modal-open');
            document.documentElement.classList.add('modal-open');
            
            // Disable scrolling on the background
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = `-${scrollY}px`;
            
            // Disable webkit scrollbar interaction
            document.body.style.webkitOverflowScrolling = 'touch';
            document.body.style.msOverflowStyle = 'none';
            document.body.style.scrollbarWidth = 'none';
            
            // Also disable scrolling on html element for better mobile support
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.position = 'relative';
            document.documentElement.style.height = '100%';
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            document.documentElement.style.msOverflowStyle = 'none';
            document.documentElement.style.scrollbarWidth = 'none';
        } else {
            // Get the stored scroll position
            const scrollY = parseInt(document.body.style.top || '0') * -1;
            
            // Remove modal-open class from body and html
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
            
            // Re-enable scrolling
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            
            // Re-enable webkit scrollbar
            document.body.style.webkitOverflowScrolling = '';
            document.body.style.msOverflowStyle = '';
            document.body.style.scrollbarWidth = '';
            
            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
            document.documentElement.style.height = '';
            document.documentElement.style.webkitOverflowScrolling = '';
            document.documentElement.style.msOverflowStyle = '';
            document.documentElement.style.scrollbarWidth = '';
            
            // Restore scroll position
            window.scrollTo(0, scrollY);
        }

        // Cleanup on unmount
        return () => {
            // Remove CSS classes
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
            
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            document.body.style.webkitOverflowScrolling = '';
            document.body.style.msOverflowStyle = '';
            document.body.style.scrollbarWidth = '';
            
            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
            document.documentElement.style.height = '';
            document.documentElement.style.webkitOverflowScrolling = '';
            document.documentElement.style.msOverflowStyle = '';
            document.documentElement.style.scrollbarWidth = '';
        };
    }, [showPendingModal]);

    const fetchPendingCount = async () => {
        try {
            // Check if user is logged in
            const localUser = localStorage.getItem("wallet.user.name");
            if (!localUser) {
                console.log('User not logged in, skipping pending count fetch');
                setPendingCount(0);
                return;
            }
            console.log('getApiUrl',getApiUrl('/external/pending'));
            console.log('Fetching pending count...');
            const response = await authenticatedFetch(getApiUrl('/external/pending'), {
                method: 'GET'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Pending transactions data:', data);
                setPendingCount(data.pendingTransactions?.length || 0);
                console.log('Set pending count to:', data.pendingTransactions?.length || 0);
            } else {
                console.error('Failed to fetch pending count, status:', response.status);
                setPendingCount(0);
            }
        } catch (error) {
            console.error('Error fetching pending count:', error);
            setPendingCount(0);
        }
    };

    const handleModalClose = () => {
        setShowPendingModal(false);
        fetchPendingCount(); // Refresh count when modal closes
    };

    const handlePendingApproveReject = async () => {
        fetchPendingCount(); // Refresh count when actions are performed
        await refreshExpenseData(); // Refresh expense data to show approved transactions
    };

    const handlePendingEdit = async () => {
        fetchPendingCount(); // Only refresh count for edit actions
    };

    const refreshExpenseData = async () => {
        try {
            // Fetch updated wallet data from backend
            const response = await authenticatedFetch(getApiUrl('/wallet'), {
                method: 'GET'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.walletData) {
                    // Update localStorage with fresh data from backend
                    localStorage.setItem("wallet.user.data", JSON.stringify(data.walletData.transactions));
                    localStorage.setItem("wallet.user.onlineBalance", data.walletData.onlineBalance.toString());
                    localStorage.setItem("wallet.user.offlineBalance", data.walletData.offlineBalance.toString());
                    localStorage.setItem("wallet.user.onlineSpent", data.walletData.onlineSpent.toString());
                    localStorage.setItem("wallet.user.offlineSpent", data.walletData.offlineSpent.toString());
                    localStorage.setItem("wallet.user.saving", data.walletData.saving.toString());
                    
                    // Update context values
                    changeOnlineBalance(data.walletData.onlineBalance);
                    changeOfflineBalance(data.walletData.offlineBalance);
                    changeOnlineSpent(data.walletData.onlineSpent);
                    changeOfflineSpent(data.walletData.offlineSpent);
                    
                    console.log('✅ Expense data refreshed successfully');
                }
            }
        } catch (error) {
            console.error('Error refreshing expense data:', error);
        }
    };

    // Handle purpose input changes and category selection
    const handlePurposeChange = (value) => {
        setPurposeInput(value);
        
        // Extract category and purpose from the input
        if (value.includes(" - ")) {
            const [category, purpose] = value.split(" - ", 2);
            if (categories.includes(category)) {
                setSelectedCategory(category);
                items.current = {...items.current, category: category, item: purpose};
            } else {
                setSelectedCategory("");
                items.current = {...items.current, category: "", item: value};
            }
        } else {
            setSelectedCategory("");
            items.current = {...items.current, category: "", item: value};
        }
    };

    const handleCategorySelect = (category) => {
        const currentPurpose = purposeInput.includes(" - ") ? 
            purposeInput.split(" - ")[1] || "" : purposeInput;
        const newValue = `${category} - ${currentPurpose}`;
        setPurposeInput(newValue);
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
        items.current = {...items.current, category: category, item: currentPurpose};
        
        // Focus back on the input
        document.getElementById("what").focus();
    };

    const handleInputFocus = () => {
        setShowCategoryDropdown(true);
    };

    const handleInputBlur = () => {
        // Delay hiding to allow category selection
        setTimeout(() => setShowCategoryDropdown(false), 150);
    };

    async function add(){
        if (purposeInput.trim()===""||items.current.medium===""||items.current.price==="") {
            await showAlert("Please fill all fields before adding an expense.", "Missing Information");
            return
        }

        // Ensure items.current has the latest values from purposeInput
        if (purposeInput.includes(" - ")) {
            const [category, purpose] = purposeInput.split(" - ", 2);
            if (categories.includes(category)) {
                items.current.category = category;
                items.current.item = purpose || "";
            } else {
                items.current.category = "";
                items.current.item = purposeInput;
            }
        } else {
            items.current.category = "";
            items.current.item = purposeInput;
        }

        const currentData = JSON.parse(localStorage.getItem("wallet.user.data") || "[]")
        items.current.date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+(new Date().getFullYear())

        if(items.current.medium==="Online"){
            if(parseInt(onlineBalance)<parseInt(items.current.price)){
                await showAlert("Insufficient online balance! Please add money to your online account.", "Insufficient Balance");
                nav("/profile")
            }else{
                card1_rotate()
                document.getElementById("form").classList.add("zoom-out")
                setTimeout(() => {
                    document.getElementById("form").classList.remove("zoom-out")
                }, 500);
                
                    currentData.push(items.current)
                    localStorage.setItem("wallet.user.data",JSON.stringify(currentData))
                    changeOnlineBalance(parseInt(onlineBalance)-parseInt(items.current.price))
                    changeOnlineSpent(parseInt(onlineSpent)+parseInt(items.current.price))
                
           }
        }
        if(items.current.medium==="Offline"){
            if(parseInt(offlineBalance)<parseInt(items.current.price)){
                await showAlert("Insufficient offline balance! Please add money to your offline account.", "Insufficient Balance");
                nav("/profile")
            }else{
                document.getElementById("form").classList.add("zoom-out")
                card1_rotate()
                setTimeout(() => {
                    document.getElementById("form").classList.remove("zoom-out")
                   
                }, 500);
                
            currentData.push(items.current)
            localStorage.setItem("wallet.user.data",JSON.stringify(currentData))
            changeOfflineBalance(parseInt(offlineBalance)-parseInt(items.current.price))
            changeOfflineSpent(parseInt(offlineSpent)+parseInt(items.current.price))}
        }
        items.current.item=""
        items.current.price=""
        items.current.medium=""
        items.current.category=""
        setPurposeInput("")
        setSelectedCategory("")
        setShowCategoryDropdown(false)
        document.getElementById("how").value=""
        document.getElementById("medium").value=""
      
    }
    function dec_spent_month(){
        if((curSpentMonth-1)>0){
            setCurSpentMonth(curSpentMonth-1)
        }
    }
    function inc_spent_month(){
        if((curSpentMonth+1)<spent_cal.length){
            setCurSpentMonth(curSpentMonth+1)
        }
    }

    function dec_add_month(){
        if((curAddMonth-1)>0){
            setCurAddMonth(curAddMonth-1)
        }
    }
    function inc_add_month(){
        if((curAddMonth+1)<add_cal.length){
            setCurAddMonth(curAddMonth+1)
        }
    }
    function card1_rotate(){
        document.getElementById("balance_card").classList.add("rotate-rigth")
        setTimeout(() => {
            if(document.getElementById("balance_card")){
                document.getElementById("balance_card").classList.remove("rotate-rigth")
            }
            
        }, 1500);
    }
    return (
        <div className="home">
            <div className="modern_container">
                {/* Form Section */}
                <div className="home_form_section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="home_form_heading" style={{ margin: 0 }}>Add Expense</h1>
                        {/* External Pending Transactions Button */}
                        <button
                            onClick={() => {
                                console.log('External button clicked, pending count:', pendingCount);
                                setShowPendingModal(true);
                            }}
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'transparent',
                                color: 'var(--head_text)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                outline: 'none',
                                marginTop: '-2vh',
                                padding: 0
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.opacity = '0.7';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.opacity = '1';
                            }}
                            title={`External Expenses: ${pendingCount} pending expense${pendingCount !== 1 ? 's' : ''} awaiting approval`}
                        >
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m9-9h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm0-10a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM2 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2zm7 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM0 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.354.854a.5.5 0 1 0-.708-.708L3 3.793l-.646-.647a.5.5 0 1 0-.708.708l1 1a.5.5 0 0 0 .708 0z"/>
                                </svg>
                                {/* Only show count badge if there are pending transactions */}
                                {pendingCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '14px',
                                        height: '14px',
                                        fontSize: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600',
                                        border: '1px solid white',
                                        minWidth: '14px'
                                    }}>
                                        {pendingCount > 99 ? '99+' : pendingCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                    <div id="form" className="home_form">
                        <div className="mb-2 no-back" style={{ position: 'relative' }}>
                            <label className="form-label">Purpose</label>
                            <input  
                                type="text" 
                                id="what" 
                                className="home_form_input" 
                                placeholder="e.g. Food - dinner out, Travel - hotel booking" 
                                value={purposeInput}
                                onChange={e => handlePurposeChange(e.target.value)}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                autoComplete="off"
                            />
                            {showCategoryDropdown && categories.length > 0 && (
                                <div className="category-dropdown">
                                    <div className="category-dropdown-header">Select Category:</div>
                                    {categories.map((category, index) => (
                                        <div 
                                            key={index} 
                                            className="category-option"
                                            onClick={() => handleCategorySelect(category)}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Amount</label>
                            <input 
                                type="number" 
                                id="how" 
                                className="home_form_input" 
                                placeholder="e.g. 100" 
                                onChange={x=>{items.current={...items.current,price:x.target.value}}}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Payment Method</label>
                            <select 
                                className="home_form_input" 
                                defaultValue="" 
                                id="medium" 
                                onChange={x=>{items.current={...items.current,medium:x.target.value}}}
                            >
                                <option value="" disabled>Select payment method</option>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={add}>Add Expense</button>
                    </div>
                </div>

                {/* Dashboard Section */}
                <div className="home_dash">
                    {/* Balance Card */}
                    <div id="balance_card" onClick={card1_rotate} className="home_card preserve-3d">
                        <p className="home_card_var no-back">Total Balance</p>
                        <p className="home_card_val no-back">₹{parseInt(onlineBalance)+parseInt(offlineBalance)}</p>
                        <div className="home_mini_dash no-back">
                            <div className="home_mini_card">
                                <p className="home_mini_card_var">Online</p>
                                <p className="home_mini_card_val">₹{onlineBalance}</p>
                            </div>
                            <div className="home_mini_card">
                                <p className="home_mini_card_var">Offline</p>
                                <p className="home_mini_card_val">₹{offlineBalance}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Spent Card */}
                    <div className="home_card home_card_2">
                        <div className="home_card2_title">
                            <p className="home_card_var">Monthly Spent</p>
                            <div className="home_card2_month_div">
                                {parseInt(curSpentMonth)>1?
                                    <svg onClick={dec_spent_month} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
                                        <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                                    </svg>:
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-left" viewBox="0 0 16 16">
                                        <path d="M10 12.796V3.204L4.519 8zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753"/>
                                    </svg>
                                }
                                <p className="home_card_var1">{spent_cal[parseInt(curSpentMonth)]?.month || "No Data"} {spent_cal[parseInt(curSpentMonth)]?.year || ""}</p>
                                {parseInt(curSpentMonth)<spent_cal.length-1?
                                    <svg onClick={inc_spent_month} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                                        <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                                    </svg>:
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-right" viewBox="0 0 16 16">
                                        <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753"/>
                                    </svg>
                                }
                            </div> 
                        </div>
                        <p className="home_card_val">₹{spent_cal[parseInt(curSpentMonth)]?.ammount || 0}</p>
                    </div>

                    {/* Added Card */}
                    <div className="home_card home_card_3">
                        <div className="home_card2_title">
                            <p className="home_card_var">Monthly Added</p>
                            <div className="home_card2_month_div">
                                {parseInt(curAddMonth)>1?
                                    <svg onClick={dec_add_month} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
                                        <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                                    </svg>:
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-left" viewBox="0 0 16 16">
                                        <path d="M10 12.796V3.204L4.519 8zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753"/>
                                    </svg>
                                }
                                <p className="home_card_var1">{add_cal[parseInt(curAddMonth)]?.month || "No Data"} {add_cal[parseInt(curAddMonth)]?.year || ""}</p>
                                {parseInt(curAddMonth)<add_cal.length-1?
                                    <svg onClick={inc_add_month} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                                        <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                                    </svg>:
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-right" viewBox="0 0 16 16">
                                        <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753"/>
                                    </svg>
                                }
                            </div> 
                        </div>
                        <p className="home_card_val">₹{add_cal[parseInt(curAddMonth)]?.ammount || 0}</p>
                    </div>

                    {/* Savings Card */}
                    <div className="home_card home_card_4">
                        <div className="home_card2_title">
                            <p className="home_card_var">Total Savings</p>
                        </div>
                        <p className="home_card_val">₹{saving}</p>
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

            {/* Pending Transactions Modal */}
            <PendingTransactionsModal
                isOpen={showPendingModal}
                onClose={handleModalClose}
                onApprove={handlePendingApproveReject}
                onReject={handlePendingApproveReject}
                onEdit={handlePendingEdit}
            />
        </div>
    )
}