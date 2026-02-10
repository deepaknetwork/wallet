import React, { useContext, useEffect, useState, useMemo } from "react";
import Navigator from "../component/navigator";
import Head from "../component/head";
import Item from "../component/item";
import { OfflineBalance, OfflineSpent, OnlineBalance,OnlineSpent, Theme } from "../data";
import html2pdf from 'html2pdf.js';
import Pdf from "../component/pdf";
import { useNavigate } from "react-router-dom";
import a from '../images/download.png';
import ItemAdd from "../component/itemadd";

export default function Summary()
{


    const {isDarkTheme,toggleTheme}=useContext(Theme)
    var nav=useNavigate()
    var month=0;
    var month_array=["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    // Get current date for defaults
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState("all");
    const [timeRange, setTimeRange] = useState(3); // Default 3 months
    const [specificMonth, setSpecificMonth] = useState("");
    const [specificYear, setSpecificYear] = useState("");
    const [filterMode, setFilterMode] = useState("timeRange"); // "timeRange" or "specific"
    

    
    // Get categories from localStorage
    const getCategories = () => {
        const storedCategories = localStorage.getItem("wallet.user.categories");
        return storedCategories ? JSON.parse(storedCategories) : ["Food", "Snacks", "Family", "Travel"];
    };
    const [categories] = useState(getCategories());
   
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)
    
    // Get all data
    const rawData = localStorage.getItem("wallet.user.data");
    const allData = rawData ? JSON.parse(rawData) : [];
    
    // Filter and process data
    const { filteredData, filteredTotals } = useMemo(() => {
        let filtered = [...allData];
        
        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(item => {
                const itemCategory = item.category || "";
                return itemCategory === selectedCategory;
            });
        }
        
        // Apply payment method filter
        if (selectedPayment !== "all") {
            filtered = filtered.filter(item => {
                return item.medium === selectedPayment;
            });
        }
        
        // Apply time-based filters
        const currentDate = new Date();
        if (filterMode === "timeRange") {
            // Filter by months range (default 3 months)
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
            
            filtered = filtered.filter(item => {
                const [day, month, year] = item.date.split("/");
                const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return itemDate >= cutoffDate;
            });
        } else if (filterMode === "specific") {
            // Filter by specific month-year (use current month/year if not selected)
            const yearToFilter = specificYear || currentYear.toString();
            const monthToFilter = specificMonth || currentMonth.toString();
            filtered = filtered.filter(item => {
                const [day, month, year] = item.date.split("/");
                return parseInt(month) === parseInt(monthToFilter) && parseInt(year) === parseInt(yearToFilter);
            });
        }
        
        // Calculate totals for filtered data
        const totals = filtered.reduce((acc, item) => {
            const price = parseInt(item.price);
            if (item.spent === "true") {
                acc.totalSpent += price;
            } else {
                acc.totalAdded += price;
            }
            return acc;
        }, { totalSpent: 0, totalAdded: 0 });
        
        // Sort by date (newest first), and within same date, by array index (newest added last appears first)
        filtered.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split("/");
            const [dayB, monthB, yearB] = b.date.split("/");
            const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
            const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
            
            // First sort by date
            const dateDiff = dateB - dateA;
            if (dateDiff !== 0) {
                return dateDiff;
            }
            
            // If same date, sort by original array index (newer items have higher index)
            const indexA = allData.findIndex(item => 
                item.item === a.item && 
                item.price === a.price && 
                item.medium === a.medium && 
                item.date === a.date
            );
            const indexB = allData.findIndex(item => 
                item.item === b.item && 
                item.price === b.price && 
                item.medium === b.medium && 
                item.date === b.date
            );
            
            // Higher index (newer) should appear first
            return indexB - indexA;
        });
        
        return { filteredData: filtered, filteredTotals: totals };
    }, [allData, selectedCategory, selectedPayment, timeRange, filterMode, specificMonth, specificYear]);
    
    // Generate unique years and months for dropdown
    const availableYears = useMemo(() => {
        const years = new Set();
        allData.forEach(item => {
            const [, , year] = item.date.split("/");
            years.add(parseInt(year));
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [allData]);
    
    const availableMonths = useMemo(() => {
        const yearToCheck = specificYear || currentYear.toString();
        const months = new Set();
        allData.forEach(item => {
            const [, month, year] = item.date.split("/");
            if (parseInt(year) === parseInt(yearToCheck)) {
                months.add(parseInt(month));
            }
        });
        return Array.from(months).sort((a, b) => b - a);
    }, [allData, specificYear, currentYear]);


  

    function download(){ 
        html2pdf( document.getElementById("pdf"),
        {filename:'wallet:'+new Date().getMonth()+"/"+new Date().getFullYear(),
        margin:15});   
     
     }

    // Render data with month groupings
    const renderFilteredData = () => {
        let currentMonth = 0;
        return filteredData.map((item, index) => {
            const [day, itemMonth, year] = item.date.toString().split("/");
            const monthNum = parseInt(itemMonth);
            
            if (currentMonth !== monthNum) {
                currentMonth = monthNum;
                return (
                    <React.Fragment key={`${item.date}-${index}`}>
                        <tr className={`row sum_body_title table ${!isDarkTheme?"table-light":"table-dark"}`}>
                            <th>{month_array[monthNum]} {year}</th>
                        </tr>
                        {item.spent === "false" ? 
                            <ItemAdd x={{data: item, new: true}} /> : 
                            <Item x={{data: item, new: true}} />
                        }
                    </React.Fragment>
                );
            } else {
                return item.spent === "false" ? 
                    <ItemAdd key={`${item.date}-${index}`} x={{data: item, new: false}} /> : 
                    <Item key={`${item.date}-${index}`} x={{data: item, new: false}} />;
            }
        });
    };
    
    return <div className="summary">
        {/* Minimalist Filter Controls */}
        <div className="minimal_filters">
            <select 
                className="minimal_select" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>

            <select 
                className="minimal_select" 
                value={selectedPayment} 
                onChange={(e) => setSelectedPayment(e.target.value)}
            >
                <option value="all">All Methods</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
            </select>

            <select 
                className="minimal_select" 
                value={filterMode} 
                onChange={(e) => {
                    setFilterMode(e.target.value);
                    if (e.target.value === "timeRange") {
                        setSpecificMonth("");
                        setSpecificYear("");
                    } else if (e.target.value === "specific") {
                        setSpecificYear(currentYear.toString());
                        setSpecificMonth(currentMonth.toString());
                    }
                }}
            >
                <option value="timeRange">Time Range</option>
                <option value="specific">Specific Month</option>
            </select>

            {filterMode === "timeRange" ? (
                <select 
                    className="minimal_select" 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={5}>5 Months</option>
                    <option value={6}>6 Months</option>
                </select>
            ) : (
                <>
                    <select 
                        className="minimal_select" 
                        value={specificYear || currentYear.toString()} 
                        onChange={(e) => {
                            setSpecificYear(e.target.value);
                            if (e.target.value !== currentYear.toString()) {
                                setSpecificMonth("");
                            }
                        }}
                    >
                        <option value={currentYear.toString()}>{currentYear} (Current)</option>
                        {availableYears.filter(year => year !== currentYear).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select 
                        className="minimal_select" 
                        value={specificMonth || currentMonth.toString()} 
                        onChange={(e) => setSpecificMonth(e.target.value)}
                    >
                        <option value={currentMonth.toString()}>{month_array[currentMonth]} (Current)</option>
                        {availableMonths.filter(month => month !== currentMonth).map(month => (
                            <option key={month} value={month}>{month_array[month]}</option>
                        ))}
                    </select>
                </>
            )}

            {(selectedCategory !== "all" || selectedPayment !== "all" || filterMode === "specific" || timeRange !== 3) && (
                <div className="minimal_totals">
                    {filteredTotals.totalSpent > 0 && (
                        <span className="minimal_total spent">Spent: ₹{filteredTotals.totalSpent}</span>
                    )}
                    {filteredTotals.totalAdded > 0 && (
                        <span className="minimal_total added">Added: ₹{filteredTotals.totalAdded}</span>
                    )}
                    {filteredTotals.totalSpent === 0 && filteredTotals.totalAdded === 0 && (
                        <span className="minimal_total no-transactions">No transactions</span>
                    )}
                </div>
            )}
        </div>

        {/* Data Table */}
        <table className={`summary_table ${!isDarkTheme?"table":"table table-striped"}`}>
            <thead >
                <tr className="row summary_head ">
                    <th className="col-3 summary_head_data" >Date</th>
                    <th className="col-4 summary_head_data">Purpose</th>
                    <th className="col-3 summary_head_data">Price</th>
                    <th className="col-2 summary_head_data">Medium</th>
                </tr>
            </thead>
            <tbody className={`summary_body`}>
                {filteredData.length > 0 ? renderFilteredData() : (
                    <tr className="row">
                        <td className="col-12 text-center no-data">
                            No expenses found for the selected filters.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>


    </div>
}