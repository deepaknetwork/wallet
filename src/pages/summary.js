import React, { useContext, useEffect } from "react";
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
   
    var {onlineBalance,changeOnlineBalance}=useContext(OnlineBalance)
    var {onlineSpent,changeOnlineSpent}=useContext(OnlineSpent)
    var {offlineBalance,changeOfflineBalance}=useContext(OfflineBalance)
    var {offlineSpent,changeOfflineSpent}=useContext(OfflineSpent)
    var total_spent=0
    var data=JSON.parse(localStorage.getItem("wallet.user.data"))
    data.reverse()
  

    function download(){ 
        html2pdf( document.getElementById("pdf"),
        {filename:'wallet:'+new Date().getMonth()+"/"+new Date().getFullYear(),
        margin:15});   
     
     }

    
    return <div className="summary">
        {/* <Head  head={"SUMMARY"}/> */}
        {/* <div id="hh" className="row summary_dash">
            <div className="col-5 summary_card">
                <span className=" summary_card_heading">Balance</span>
                <span className=" summary_card_text">{parseInt(onlineBalance)+parseInt(offlineBalance)}</span>
            </div>
            <div className="col-5 summary_card">
                <span className=" summary_card_heading">Spent</span>
                <span className=" summary_card_text">{parseInt(onlineSpent)+parseInt(offlineSpent) }</span>
            </div>
            
        </div> */}
        {/* <div className="down" onClick={download}><img className="down_icon" src={a} alt="a"></img></div> */}
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
            {data.map(i=>{
                
                if(parseInt(month)===parseInt(parseInt(i.date.toString().split("/")[1]))){
                    return i.spent=="false"?<ItemAdd x={{data:i,new:false}}/>:<Item x={{data:i,new:false}}/>
                   
                }else{
                    var str=i.date.toString().split("/")
                    month=parseInt(str[1])
                    return <>
                        <tr className={`row sum_body_title table ${!isDarkTheme?"table-light":"table-dark"}`}><th>{month_array[parseInt(str[1])]} {str[2]}</th></tr>
                        {i.spent=="false"?<ItemAdd x={{data:i,new:true}}/>:<Item x={{data:i,new:true}}/>}
                        </>
                }
                
            })}
            </tbody>
            </table>
        {/* <Pdf /> */}
         {/* <Navigator /> */}
       
    </div>
}