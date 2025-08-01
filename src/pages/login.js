import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../data";

export default function Login()
{
    var data=useRef({name:"",password:""})
    var navigate=useNavigate()
    const {loggedin,login,logout}=useContext(AuthContext)

    var dat=[]
        async function handle_login()
        {
            
           
            if(data.current.name!==""&&data.current.password!=="")
            {
                document.getElementById("login_box").classList.add("closedown")
                setTimeout(() => {
                    localStorage.setItem("wallet.user.name",data.current.name)
                    localStorage.setItem("wallet.user.passowrd",data.current.password)
                    localStorage.setItem("wallet.user.balance",0)
                    localStorage.setItem("wallet.user.amount",0)
                    localStorage.setItem("wallet.user.saving",0)
                    localStorage.setItem("wallet.user.spent",0)
                    if (localStorage.getItem("wallet.user.data")===null) {
                        localStorage.setItem("wallet.user.data",JSON.stringify(dat))
                    }
                    login()
                    navigate('/')
                }, 500);
                
                
            }
         else{ alert("Name and password should not be empty")}
           
        }

         function handle_login_p(){
            
            
                console.log(data.current.password,localStorage.getItem("wallet.user.passowrd").toString())
            if (data.current.password.toString()===localStorage.getItem("wallet.user.passowrd").toString()) {
                document.getElementById("login_box").classList.add("closedown")
                setTimeout(() => {
                    login()
                navigate('/')
                }, 500);
                
            }
            else 
            {
                 alert("password wrong")
             
            }
            
            
        }

        
        document.addEventListener('keydown',(x)=>{
            if (x.key==='Enter') {
                if (localStorage.getItem("wallet.user.name")) {
                    handle_login_p()
                }else{
                    handle_login()
                }
            }
        })
        
        if (localStorage.getItem("wallet.user.name")) {
            return <div className="row login">
        
        <div className="col-10 col-lg-4 login_heading">
        <span className="login_head">Dark Wallet</span>
        </div>
        
        <div id="login_box" className="col-10 col-lg-5 g-5 login_box">
        <div  class="form-text mb-2 name">Hey! {localStorage.getItem("wallet.user.name")}</div>
        <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" required onChange={x=>{data.current={...data.current,password:x.target.value}}} class="form-control"/>
            </div>
            <div  class="form-text mb-2">You have already started with Dark Wallet. Enter your password to restore the data</div>
            <button type="submit" onClick={handle_login_p} class="btn btn-dark">Enter</button>
        
        </div>
    </div>
        } else {
            return <div className="row login">

        <div className="col-10 col-lg-4 login_heading">
            <span className="login_head">Dark Wallet</span>
        </div>

        <div id="login_box" className="col-10 col-lg-5 g-5 login_box">
            <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" required onChange={x=>{data.current={...data.current,name:x.target.value}}} class="form-control"/>  
            </div>
            <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" required onChange={x=>{data.current={...data.current,password:x.target.value}}} class="form-control"/>
            </div>
            <div  class="form-text mb-2">All the collected data is being stored locally on the device</div>
            <button type="submit" onClick={handle_login} class="btn btn-dark">Get started</button>
        </div>
    </div>
        }
    
    

    
}