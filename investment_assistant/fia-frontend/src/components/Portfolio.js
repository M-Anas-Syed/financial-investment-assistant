import React, { useEffect, useState } from "react";
import { MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from "mdb-react-ui-kit";
import Axios from "axios";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";

function Portfolio() {
  const [symbol, setSymbol] = useState({});
  const [price, setPrice] = useState({});
  const [quantity, setQuantity] = useState({});
  const [total, setTotal] = useState({});
  const [accountValue, setAccountValue] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(0);

  const navigate = useNavigate();

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

  const buy = (event, action, symbol) => {
    event.preventDefault();
    console.log(action)
    if (action == "Buy") {
      Axios.put("http://127.0.0.1:8000/buy", {
        stock_symbol: symbol,
        action: action,
        stock_quantity: 1,
      })
        .then((response) => {
          console.log(response.data);
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    } else if(action == "Sell"){
      Axios.put("http://127.0.0.1:8000/buy", {
        stock_symbol: symbol,
        action: action,
        stock_quantity: 1,
      })
        .then((response) => {
          console.log(response.data);
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

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
            {symbol.length > 0 && symbol.map((x) => <tr scope="row"><td className="py-2">{x}</td></tr>)}
          </td>
          <td>
            {purchaseDate.length > 0 &&
              purchaseDate.map((x) => <tr scope="row"><td className="py-2">{x}</td></tr>)}
          </td>
          <td>
            {price.length > 0 && price.map((x) => <tr scope="row"><td className="py-2">{x}</td></tr>)}
          </td>
          <td>
            {quantity.length > 0 &&
              quantity.map((x) => (
                <tr style={{ align: "center" }} scope="row">
                  <td className="py-2">{x}</td>
                </tr>
              ))}
          </td>
          <td>
            {total.length > 0 && total.map((x) => <tr scope="row"><td className="py-2">{x}</td></tr>)}
          </td>
          <td>
            {symbol.length > 0 &&
              symbol.map((x) => (
                <tr>
                  <button className="bg-success text-light" style={{margin: "0.35rem 0.5rem"}} onClick={(e) => {buy(e, 'Buy',x)}}>Quick Buy</button>
                  <button className="bg-danger text-light" style={{margin: "0.35rem 0.5rem"}} onClick={(e) => {buy(e, 'Sell',x)}}>Quick Sell</button>
                </tr>
              ))}
          </td>
        </MDBTableBody>
      </MDBTable>
    </div>
  );
}

export default Portfolio;
