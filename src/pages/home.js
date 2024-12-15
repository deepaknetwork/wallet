import React, { useContext, useRef } from "react";
import Navigator from "../component/navigator";
import Head from "../component/head";
import { useNavigate } from "react-router-dom";
import {OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent } from "../data";
import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";

export default function Home()
{
   
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)

   
    var nav=useNavigate()
    var items=useRef({item:"",price:0,medium:"",date:""})
 

    async function add(){
        if (items.current.item===""||items.current.medium===""||items.current.price==="") {
            alert("please fill all feilds")
            return
        }

        const data=JSON.parse(localStorage.getItem("wallet.user.data"))
        items.current.date=new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear()

        if(items.current.medium==="Online"){
            if(parseInt(onlineBalance)<parseInt(items.current.price)){
                alert("please add money : online")
                nav("/wallet/profile")
            }else{
            data.push(items.current)
            localStorage.setItem("wallet.user.data",JSON.stringify(data))
            changeOnlineBalance(parseInt(onlineBalance)-parseInt(items.current.price))
            changeOnlineSpent(parseInt(onlineSpent)+parseInt(items.current.price))}
        }
        if(items.current.medium==="Offline"){
            if(parseInt(offlineBalance)<parseInt(items.current.price)){
                alert("please add money : offline")
                nav("/wallet/profile")
            }else{
            data.push(items.current)
            localStorage.setItem("wallet.user.data",JSON.stringify(data))
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
    return <div>
        <Head head={"Dark Wallet"}/>
        <div class="container-fluid home">
        
            <p className="home_form_heading">What’s This For?</p>

<div className="home_form_box">
<div className="col-lg-5 home_form">
  <div class="mb-3">
    <label class="form-label">Purpose</label>
    <input  type="text" id="what" class="home_form_input" placeholder="Eg. dinner out" onChange={x=>{items.current={...items.current,item:x.target.value}}} />
  </div>
  <div class="mb-3">
    <label class="form-label">Amount</label>
    <input type="number" id="how" class=" home_form_input" placeholder="Eg. 100Rs" onChange={x=>{items.current={...items.current,price:x.target.value}}}/>
  </div>
  <div class="mb-3">
    <label class="form-label">Medium</label>
        <select class="home_form_input" defaultValue="" id="medium" onChange={x=>{items.current={...items.current,medium:x.target.value}}}>
            <option value="" disabled>Eg. online</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
        </select>
  </div>
  <button   class="btn btn-primary" onClick={add}>Spent</button>
</div>
</div>


        <div className="row home_dash">
                <div className="col-11 col-lg-4 home_card">
                    <p className="home_card_var">Balance</p>
                    <p className="home_card_val">{parseInt(onlineBalance)+parseInt(offlineBalance)}</p>
                    <div className="row home_mini_dash">
                        <div className="col-6 col-lg-4 home_mini_card">
                            <p className="home_mini_card_var">Online</p>
                            <p className="home_mini_card_val">{onlineBalance}</p>
                        </div>
                        <div className="col-6 col-lg-4 home_mini_card">
                            <p className="home_mini_card_var">Offline</p>
                            <p className="home_mini_card_val">{offlineBalance}</p>
                        </div>
                    </div>
                 </div>
                 
                 <div className="col-11 col-lg-4 home_card home_card_2">
                    <p className="home_card_var">Spent</p>
                    <p className="home_card_val">{parseInt(onlineSpent)+parseInt(offlineSpent)}</p>
                </div>
                 
                 </div>
                 </div>
        
        <Navigator />
        
    </div>
}