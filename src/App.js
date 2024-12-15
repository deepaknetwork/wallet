import React, { useContext, useState } from "react";
import { BrowserRouter as Router,Routes,Route, Navigate} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Summary from "./pages/summary";
import Profile from "./pages/profile";
import { AuthContext } from "./data";




export default function App() {

  const {loggedin,login,logout}=useContext(AuthContext)
  
  return (
  <Router>
    <Routes>
      {loggedin?<Route path="/wallet" element={<Navigate to="/wallet/home" replace />} />:<Route path="/wallet" element={<Login />}></Route>}
      {loggedin&&<Route path="/wallet/home" element={<Home />}></Route>}
      {loggedin&&<Route path="/wallet/profile" element={<Profile />}></Route>}
      {loggedin&&<Route path="/wallet/summary" element={<Summary />}></Route>}
      <Route path="*" element={<Navigate to="/wallet" />}></Route>
    </Routes>
  </Router>
  )
}