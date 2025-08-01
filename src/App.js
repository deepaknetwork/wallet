import React, { useContext, useState } from "react";
import { HashRouter as Router,Routes,Route, Navigate} from "react-router-dom";
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
      {loggedin?<Route path="/" element={<Home />} />:<Route path="/" element={<Login />}></Route>}
      {loggedin&&<Route path="/profile" element={<Profile />}></Route>}
      {loggedin&&<Route path="/summary" element={<Summary />}></Route>}
      <Route path="*" element={<Navigate to="/" />}></Route>
    </Routes>
  </Router>
  )
}