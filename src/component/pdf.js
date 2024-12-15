import React from "react";
export default function Pdf(){
   
   
    return  <div className="pdf_gap"><div className="pdf-box">
   
        </div>
    
        <div className="print-pdf">
        <table className="pdf" id="pdf">
            <thead>
        <tr><th className="pdf">date</th><th className="pdf" >usage</th><th className="pdf"> expence</th></tr>
        </thead>
        <tbody>
        {JSON.parse(localStorage.getItem("wallet.user.data")).map(x=>{
            return <tr><td className="pdf">{x.date}</td><td className="pdf">{x.item}</td><td className="pdf">{x.price}</td></tr>
        })}
        </tbody>
    </table>
    </div>
    </div>

}