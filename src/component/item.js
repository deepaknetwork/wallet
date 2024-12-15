import React from "react";

export default function Item(props)
{

      return <tr className={`row sum_body`}>
        <td className="col-3 item_date" >{props.x.data.date}</td>
        <td className="col-4 item_text" >{props.x.data.item}</td>
        <td className="col-3 item_price">{props.x.data.price}</td>
        <td className="col-2 item_medium">{props.x.data.medium}</td>
      </tr>
}