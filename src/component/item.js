import React from "react";

export default function Item(props)
{

      const displayPurpose = () => {
        if (props.x.data.category && props.x.data.category.trim() !== "") {
          return `${props.x.data.category} - ${props.x.data.item}`;
        }
        return props.x.data.item;
      };

      return <tr className={`row sum_body`}>
        <td className="col-3 item_date" >{props.x.data.date}</td>
        <td className="col-4 item_text" >{displayPurpose()}</td>
        <td className="col-3 item_price">{props.x.data.price}</td>
        <td className="col-2 item_medium">{props.x.data.medium}</td>
      </tr>
}