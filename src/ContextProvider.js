import { useEffect, useState } from "react";
import App from "./App";
import { AuthContext, OfflineBalance, OfflineSpent, OnlineBalance, OnlineSpent,Saving, Theme } from "./data";

export default function ContextProvider(){
    const [loggedin,setLoggedin]=useState(localStorage.getItem("wallet.user.logged")==="1")
    var [onlineBalance,setOnlineBalance]=useState(localStorage.getItem("wallet.user.onlineBalance")!==null?localStorage.getItem("wallet.user.onlineBalance"):0);
    var [onlineSpent,setOnlineSpent]=useState(localStorage.getItem("wallet.user.onlineSpent")!==null?localStorage.getItem("wallet.user.onlineSpent"):0);
    var [offlineBalance,setOfflineBalance]=useState(localStorage.getItem("wallet.user.offlineBalance")!==null?localStorage.getItem("wallet.user.offlineBalance"):0);
    var [offlineSpent,setOfflineSpent]=useState(localStorage.getItem("wallet.user.offlineSpent")!==null?localStorage.getItem("wallet.user.offlineSpent"):0);
    var [saving,setSaving]=useState(localStorage.getItem("wallet.user.saving")!==null?localStorage.getItem("wallet.user.saving"):0);

    // Automatic theme control
    const [isDarkTheme, setIsDarkTheme] = useState(parseInt(new Date().getHours())>=parseInt(6)&&parseInt(new Date().getHours())<=parseInt(15)?true:false);

    useEffect(()=>{
        const root = document.documentElement; // Access the <html> element
        if (!isDarkTheme) {
          root.classList.remove("dark_theme");// Remove the dark theme class
        } else {
          root.classList.add("dark_theme"); // Add the dark theme class
        }
    },[isDarkTheme])
    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
       // Toggle the state
    };

    const changeOnlineBalance=(value)=>{
        localStorage.setItem("wallet.user.onlineBalance",value)
        setOnlineBalance(value)
    }
    
    const changeOnlineSpent=(value)=>{
        localStorage.setItem("wallet.user.onlineSpent",value)
        setOnlineSpent(value)
    }

    const changeOfflineBalance=(value)=>{
        localStorage.setItem("wallet.user.offlineBalance",value)
        setOfflineBalance(value)
    }
    
    const changeOfflineSpent=(value)=>{
        localStorage.setItem("wallet.user.offlineSpent",value)
        setOfflineSpent(value)
    }

    const changeSaving=(value)=>{
        localStorage.setItem("wallet.user.saving",value)
        setSaving(value)
    }

    const login=()=>{
        localStorage.setItem("wallet.user.logged","1");
        setLoggedin(true)
    }
    const logout=()=>{
        localStorage.removeItem("wallet.user.logged");
        setLoggedin(false)
    }
    return(
        <AuthContext.Provider value={{loggedin,login,logout}}>
           <OnlineBalance.Provider value={{onlineBalance,changeOnlineBalance}}>
           <OnlineSpent.Provider value={{onlineSpent,changeOnlineSpent}}>
                <OfflineBalance.Provider value={{offlineBalance,changeOfflineBalance}}>
                <OfflineSpent.Provider value={{offlineSpent,changeOfflineSpent}}>
                    <Saving.Provider value={{saving,changeSaving}}>
                    <Theme.Provider value={{isDarkTheme,toggleTheme}}>
                    <App/>
                    </Theme.Provider>
                    </Saving.Provider>
                </OfflineSpent.Provider>
                </OfflineBalance.Provider>
            </OnlineSpent.Provider>
            </OnlineBalance.Provider>  
        </AuthContext.Provider>

    )
}