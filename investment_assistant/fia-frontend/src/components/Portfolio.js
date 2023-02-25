import React, { useEffect, useState } from "react";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import Axios from "axios";
import Plot from "react-plotly.js";

function Portfolio() {
  const [symbol, setSymbol] = useState({});
  const [price, setPrice] = useState({});
  const [quantity, setQuantity] = useState({});
  const [total, setTotal] = useState({});
  const [accountValue, setAccountValue] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(0);

  useEffect(() => {
    Axios.get("http://127.0.0.1:8000/portfolio").then((response) => {
      console.log(response.data);
      setSymbol(response.data.symbol);
      setPrice(response.data.stock_price);
      setQuantity(response.data.stock_quantity);
      setTotal(response.data.total);
      setAccountValue(response.data.acc);
      // setCurrentPrice(response.data.curr_price);
      setPurchaseDate(response.data.purchase_date);
    });
  }, []);

  return (
    <div>
      <h3 className="text-center">Your Performance</h3>
      <Plot
        data={[
          {
            x: purchaseDate,
            y: total,
            fill: "tozeroy",
            type: "scatter",
          },
        ]}
        layout={{ width: 800, height: 500, title: "" }}
        style={{ position: "relative", zIndex: "-2", marginTop: "20px" }}
      />

      <h3 className="text-center">Your Portfolio</h3>
      <h4>Account Value: £{accountValue}</h4>
      <MDBTable>
        <MDBTableHead>
          <tr>
            <th scope="col">Symbol</th>
            <th scope="col">Purchase Date</th>
            <th scope="col">Price</th>
            {/* <th scope="col">Current Price</th> */}
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
            {symbol.length > 0 && symbol.map((x) => <tr scope="row">{x}</tr>)}
          </td>
          <td>
            {purchaseDate.length > 0 &&
              purchaseDate.map((x) => <tr scope="row">{x}</tr>)}
          </td>
          <td>
            {price.length > 0 && price.map((x) => <tr scope="row">{x}</tr>)}
          </td>
          {/* <td>
            {currentPrice.length > 0 &&
              currentPrice.map((x) => <tr scope="row">{x}</tr>)}
          </td> */}
          <td>
            {quantity.length > 0 &&
              quantity.map((x) => <tr style={{align:"center"}} scope="row">{x}</tr>)}
          </td>
          <td>
            {total.length > 0 && total.map((x) => <tr scope="row">{x}</tr>)}
          </td>
        </MDBTableBody>
      </MDBTable>
    </div>
  );
}

export default Portfolio;
