import React, { useState, useEffect } from "react";
import Axios from "axios";
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBCheckbox,
  MDBBtn,
  MDBContainer,
  MDBSelect,
} from "mdb-react-ui-kit";

function Buy() {
  Axios.defaults.withCredentials = true;
  Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  Axios.defaults.xsrfCookieName = "csrftoken";

  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [action, setAction] = useState("");
  const [quantity, setQuantity] = useState(0);

  const buy = (event) => {
    event.preventDefault();
    if (action == "Buy") {
      Axios.post("http://127.0.0.1:8000/buy", {
        stock_symbol: symbol,
        action: action,
        stock_quantity: quantity,
      })
        .then((response) => {
          console.log(response.data);
          setPrice(response.data.price);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      Axios.put("http://127.0.0.1:8000/buy", {
        stock_symbol: symbol,
        action: action,
        stock_quantity: quantity,
      })
        .then((response) => {
          console.log(response.data);
          setPrice(response.data.price);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div>
      <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
        <form>
          <MDBInput
            wrapperClass="mb-4"
            label="Search Symbol (Example: IBM)"
            type="text"
            onChange={(e) => {
              setSymbol(e.target.value);
            }}
          />
          <select 
            onChange={(e) => {
              setAction(e.target.value);
            }}
          >
            <option value={"Buy"}>Buy</option>
            <option value={"Sell"}>Sell</option>
          </select>
          <MDBInput
            wrapperClass="mb-4"
            label="Quantity"
            type="number"
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
          />
          <MDBBtn onClick={buy} block>
            Confirm
          </MDBBtn>
        </form>
      </MDBContainer>
    </div>
  );
}

export default Buy;
