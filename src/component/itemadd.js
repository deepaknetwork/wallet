import React from "react";

export default function ItemAdd(props)
{

      return <tr className={`row sum_body`}>
        <td className="col-3 item_date add" >{props.x.data.date}</td>
        <td className="col-7 item_text add centre" >Ammount added : Rs.{props.x.data.price}</td>
        {/* <td className="col-3 item_price add">{props.x.data.price}</td> */}
        <td className="col-2 item_medium add">{props.x.data.medium}</td>
      </tr>
}