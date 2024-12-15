import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../data";

export default function Login()
{
    var data=useRef({name:"",password:""})
    var navigate=useNavigate()
    const {loggedin,login,logout}=useContext(AuthContext)

    var dat=[]
        function handle_login()
        {
            if(data.current.name!==""&&data.current.password!=="")
            {
                login()
                localStorage.setItem("wallet.user.name",data.current.name)
                localStorage.setItem("wallet.user.passowrd",data.current.password)
                localStorage.setItem("wallet.user.balance",0)
                localStorage.setItem("wallet.user.amount",0)
                localStorage.setItem("wallet.user.spent",0)
                if (localStorage.getItem("wallet.user.data")===null) {
                    localStorage.setItem("wallet.user.data",JSON.stringify(dat))
                }
                navigate('/wallet/home')
            }
         else{ alert("Name and password should not be empty")}
           
        }

        function handle_login_p(){
            console.log(data.current.password,localStorage.getItem("wallet.user.passowrd").toString())
            if (data.current.password.toString()===localStorage.getItem("wallet.user.passowrd").toString()) {
                login()
                navigate('/wallet/home')
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
            return <div className="login">
        
        <div className="login_heading">
        <span className="login_head">Expense tracker</span>
        </div>
        
        <div className="login_box">
        
        <h1 className="name">hey! {localStorage.getItem("wallet.user.name")}</h1>
        <input className="login_input" type="password" required onChange={x=>{data.current={...data.current,password:x.target.value}}} placeholder="Password"></input>
        <button className="login_btn" onClick={handle_login_p} type="submit" >Login</button>
        </div>
    </div>
        } else {
            return <div className="login">
        
        <div className="login_heading">
        <span className="login_head">Expense tracker</span>
        </div>
        
        <div className="login_box">
        
        <input className="login_input" required onChange={x=>{data.current={...data.current,name:x.target.value}}} placeholder="Name" ></input>
        <input className="login_input" type="password" required onChange={x=>{data.current={...data.current,password:x.target.value}}} placeholder="Password"></input>
        <button className="login_btn" onClick={handle_login} type="submit" >Login</button>
        </div>
    </div>
        }
    
    

    
}