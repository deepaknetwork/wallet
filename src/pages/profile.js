import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { useEffect } from "react";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent, Saving } from "../data";
export default function Profile()
{
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)
    var{saving,changeSaving}=useContext(Saving)
    const {loggedin,login,logout}=useContext(AuthContext)
    
    
    var balance=useRef(0)
    var newPassword=useRef("")
    var nav=useNavigate()
    var items=useRef({item:"",price:0,medium:"",date:"",spent:"true"})

    var [showAddOnlineBalance,setShowAddOnlineBalance]=useState(false)
    var [showAddOfflineBalance,setShowAddOfflineBalance]=useState(false)
    var [showAddSaving,setShowAddSaving]=useState(false)
    var [showPassword,setShowPassword]=useState(false)
    var [showImport,setShowImport]=useState(false)

    function addOnlineBalance(){
        const data=JSON.parse(localStorage.getItem("wallet.user.data"))
        const date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear()
        var item={item:"",price:balance,medium:"Online",date:date,spent:"false"}
        data.push(item)
        localStorage.setItem("wallet.user.data",JSON.stringify(data))
        changeOnlineBalance(parseInt(onlineBalance)+parseInt(balance))
        alert("added")
        setShowAddOnlineBalance(false)
    }

    function addOfflineBalance(){
        const data=JSON.parse(localStorage.getItem("wallet.user.data"))
        const date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear()
        var item={item:"",price:balance,medium:"Offline",date:date,spent:"false"}
        data.push(item)
        localStorage.setItem("wallet.user.data",JSON.stringify(data))
        changeOfflineBalance(parseInt(offlineBalance)+parseInt(balance))
        alert("added")
        setShowAddOfflineBalance(false)
    }

    function addSaving(){
      const data=JSON.parse(localStorage.getItem("wallet.user.data"))
      const date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear()
      var item={item:"ADDED TO SAVINGS",price:balance,medium:"Online",date:date,spent:"true"}
      data.push(item)
      localStorage.setItem("wallet.user.data",JSON.stringify(data))
      changeOnlineBalance(parseInt(onlineBalance)-parseInt(balance))
      changeSaving(parseInt(saving)+parseInt(balance))
      setShowAddSaving(false)
    }

    function clear()
    {   localStorage.removeItem("wallet.user.data")
        localStorage.removeItem("wallet.user.onlineBalance")
        localStorage.removeItem("wallet.user.onlineSpent")
        localStorage.removeItem("wallet.user.offlineBalance")
        localStorage.removeItem("wallet.user.offlineSpent")
        localStorage.removeItem("wallet.user.name")
        localStorage.removeItem("wallet.user.password")
        localStorage.removeItem("wallet.user.saving")
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
    // function dlt(){
    //     var data=JSON.parse(localStorage.getItem("wallet.user.data"))
    //     data.splice(data.length-2,1);
    //     data.splice(data.length-2,1);
    //     // data.pop(data.length-2);\
    //     localStorage.setItem("wallet.user.data",JSON.stringify(data))
    //     alert("done")
    // }
    function exportdata(){
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
      const day = String(now.getDate())
      const month = String(now.getMonth() + 1) // Months are 0-based
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
    
      // Generate the file name
      const fileName = `wallet  ${day}-${month}-${year}  ${hours}-${minutes}.json`;
    
    
      link.download =fileName
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
            if (importdata.savings) {localStorage.setItem("wallet.user.saving", importdata.offlineBalance);}
            else{localStorage.setItem("wallet.user.saving", 0);}
    
            alert("Data successfully imported into localStorage!");
          } catch (error) {
            alert("Invalid file content. Please upload a valid JSON file.");
          }
        };
    
        reader.onerror = () => {
          alert("Error reading file");
        };
    
        reader.readAsText(file); // Read the file as text
      };
    

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

        <button className="pro_card" onClick={()=>{setShowAddSaving(true)}} disabled={showAddSaving}  >Online to Savings</button>
        {showAddSaving&&<div className="pro_int_box">
            <input className="pro_in col-6" type="number" placeholder="Rs" onChange={(event)=>{balance=event.target.value}}></input>
            <button className="pro_btn_ok col-2" onClick={addSaving}>add</button>
            <button className="pro_btn_no col-3" onClick={()=>{setShowAddSaving(false)}}>cancel</button>    
        </div>}

        {/* <button className="pro_card" onClick={clear}>Clear</button> */}
        <button className="pro_card" onClick={exportdata}>export data</button>
        <button className="pro_card" onClick={()=>setShowImport(!showImport)}>import data</button>
        {showImport&&<input type="file" className="pro_in" accept=".json" onChange={handleFileUpload} />}
        <button className="pro_card" onClick={logout}>Log out</button>
        <button className="pro_card" onClick={()=>{setShowPassword(true)}} disabled={showPassword} >Reset password</button>
        {showPassword&&<div className="pro_int_box">
            <input className="pro_in col-6" type="text" placeholder="Enter new password" onChange={(event)=>{newPassword=event.target.value}}></input>
            <button className="pro_btn_ok col-2" onClick={changePassword}>Ok</button>
            <button className="pro_btn_no col-3" onClick={()=>{setShowPassword(false)}}>cancel</button>
            </div>}
            {/* <button onClick={dlt}>dlt</button> */}
        </div>
        
        <Navigator />   
    </div>
}