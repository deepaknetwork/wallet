import React, { useContext, useRef, useState } from "react";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { useNavigate } from "react-router-dom";
import {OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving } from "../data";
import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";

export default function Home()
{
    
    var month_array=["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
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
    var items=useRef({item:"",price:0,medium:"",date:"",spent:"true"})
 

    async function add(){
        if (items.current.item===""||items.current.medium===""||items.current.price==="") {
            alert("please fill all feilds")
            return
        }

        const currentData = JSON.parse(localStorage.getItem("wallet.user.data") || "[]")
        items.current.date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+(new Date().getFullYear())

        if(items.current.medium==="Online"){
            if(parseInt(onlineBalance)<parseInt(items.current.price)){
                alert("please add money : online")
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
                alert("please add money : offline")
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
        document.getElementById("what").value=""
        document.getElementById("how").value=""
        document.getElementById("medium").value=""
      
    }
    function dec_spent_month(){
        if((curSpentMonth-1)>=0){
            setCurSpentMonth(curSpentMonth-1)
        }
    }
    function inc_spent_month(){
        if((curSpentMonth+1)<spent_cal.length){
            setCurSpentMonth(curSpentMonth+1)
        }
    }

    function dec_add_month(){
        if((curAddMonth-1)>=0){
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
                    <h1 className="home_form_heading">Add Expense</h1>
                    <div id="form" className="home_form">
                        <div className="mb-3 no-back">
                            <label className="form-label">Purpose</label>
                            <input  
                                type="text" 
                                id="what" 
                                className="home_form_input" 
                                placeholder="e.g. dinner out, groceries" 
                                onChange={x=>{items.current={...items.current,item:x.target.value}}} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Amount</label>
                            <input 
                                type="number" 
                                id="how" 
                                className="home_form_input" 
                                placeholder="e.g. 100" 
                                onChange={x=>{items.current={...items.current,price:x.target.value}}}
                            />
                        </div>
                        <div className="mb-3">
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
                                {parseInt(curSpentMonth)>0?
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
                                {parseInt(curAddMonth)>0?
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
        </div>
    )
}