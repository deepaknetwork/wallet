import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { useEffect } from "react";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent } from "../data";
export default function Profile()
{
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)
    const {loggedin,login,logout}=useContext(AuthContext)
    
    
    var balance=useRef(0)
    var newPassword=useRef("")
    var nav=useNavigate()

    var [showAddOnlineBalance,setShowAddOnlineBalance]=useState(false)
    var [showAddOfflineBalance,setShowAddOfflineBalance]=useState(false)
    var [showPassword,setShowPassword]=useState(false)

    function addOnlineBalance(){
        changeOnlineBalance(parseInt(onlineBalance)+parseInt(balance))
        alert("added")
        setShowAddOnlineBalance(false)
    }

    function addOfflineBalance(){
        changeOfflineBalance(parseInt(offlineBalance)+parseInt(balance))
        alert("added")
        setShowAddOfflineBalance(false)
    }

    function clear()
    {   localStorage.removeItem("wallet.user.data")
        localStorage.removeItem("wallet.user.onlineBalance")
        localStorage.removeItem("wallet.user.onlineSpent")
        localStorage.removeItem("wallet.user.offlineBalance")
        localStorage.removeItem("wallet.user.offlineSpent")
        localStorage.removeItem("wallet.user.name")
        localStorage.removeItem("wallet.user.password")
        logout()
        window.location.reload()
    }

    function changePassword(){
        if(newPassword.toString().length<4){
            alert("must contain above 4 digits")
            return
        }
        localStorage.setItem("wallet.user.password",newPassword)
        alert("changed")
        setShowPassword(false)
    }

    return <div className="">
        <Head head={"PROFILE"} />
        <div className="profile">

        
        <div className="pro_name" >
            <h1>Hey! {localStorage.getItem("wallet.user.name")}</h1>
        </div>

        <button className={`pro_card ${showAddOnlineBalance?"pro_card_dis":""}`}  onClick={()=>{setShowAddOnlineBalance(true)}} disabled={showAddOnlineBalance}  >Add online money</button>
        {showAddOnlineBalance&&<div className="pro_int_box">
            <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event)=>{balance=event.target.value}}></input>
            <button className="pro_btn_ok col-2" onClick={addOnlineBalance}>add</button> 
            <button className="pro_btn_no col-3" onClick={()=>{setShowAddOnlineBalance(false)}}>cancel</button>   
        </div>}

        <button className="pro_card" onClick={()=>{setShowAddOfflineBalance(true)}} disabled={showAddOfflineBalance}  >Add offline money</button>
        {showAddOfflineBalance&&<div className="pro_int_box">
            <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event)=>{balance=event.target.value}}></input>
            <button className="pro_btn_ok col-2" onClick={addOfflineBalance}>add</button>
            <button className="pro_btn_no col-3" onClick={()=>{setShowAddOfflineBalance(false)}}>cancel</button>    
        </div>}

        <button className="pro_card" onClick={clear}>Clear</button>
        <button className="pro_card" onClick={logout}>Log out</button>
        <button className="pro_card" onClick={()=>{setShowPassword(true)}} disabled={showPassword} >Reset password</button>
        {showPassword&&<div className="pro_int_box">
            <input className="pro_in col-6" type="text" placeholder="Enter new password" onChange={(event)=>{newPassword=event.target.value}}></input>
            <button className="pro_btn_ok col-2" onClick={changePassword}>Ok</button>
            <button className="pro_btn_no col-3" onClick={()=>{setShowPassword(false)}}>cancel</button>
            </div>}
        </div>
        
        <Navigator />   
    </div>
}