import React, { useContext, useState } from "react";
import { Theme } from "../data";

export default function Head(props)
{
    const {isDarkTheme,toggleTheme}=useContext(Theme)
  
    return <div className="head">
        <h1 >{props.head}</h1>
        <svg  onClick={toggleTheme} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle-half head_change1" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
</svg>
        {/* <button  onClick={toggleTheme} className="head_change1">change</button> */}
    </div>
}