import React, { useEffect, useState } from "react";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import Axios from "axios";


function Portfolio() {

    const [symbol, setSymbol] = useState({});
    const [price, setPrice] = useState({});
    const [quantity, setQuantity] = useState({});
    const [total, setTotal] = useState({});
    const [accountValue, setAccountValue] = useState(0);

    useEffect(() => {
        Axios.get("http://127.0.0.1:8000/portfolio").then((response) =>{
            console.log(response.data);
            setSymbol(response.data.symbol);
            setPrice(response.data.stock_price);
            setQuantity(response.data.stock_quantity);
            setTotal(response.data.total);
            setAccountValue(response.data.acc);
        });
    }, []);


  return (
    <div>
      <h3 className="text-center">Your Portfolio</h3>
      <h4>Account Value: £{accountValue}</h4>
      <MDBTable>
        <MDBTableHead>
          <tr>
            <th scope="col">Symbol</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Total</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          <td>
            {/* <th scope="row">{symbol}</th>
            <td>{price}</td>
            <td>{quantity}</td>
            <td>{total}</td> */}
            {symbol.length > 0 && symbol.map((x) => 
                <tr scope="row">{x}</tr>
            )}
            
          </td>
          <td>
          {price.length > 0 && price.map((x) => 
                <tr scope="row">{x}</tr>
            )}
          </td>
          <td>
          {quantity.length > 0 && quantity.map((x) => 
                <tr scope="row">{x}</tr>
            )}
          </td>
          <td>
          {total.length > 0 && total.map((x) => 
                <tr scope="row">{x}</tr>
            )}
          </td>
          
        </MDBTableBody>
      </MDBTable>
    </div>
  );
}

export default Portfolio;
