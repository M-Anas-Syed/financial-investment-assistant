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
  MDBTable, MDBTableHead, MDBTableBody
} from "mdb-react-ui-kit";
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import Chart from "react-google-charts";
import Plot from 'react-plotly.js';
import { useNavigate } from "react-router-dom";


function Buy() {
  Axios.defaults.withCredentials = true;
  Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  Axios.defaults.xsrfCookieName = "csrftoken";

  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("");
  const [action, setAction] = useState("Buy");
  const [quantity, setQuantity] = useState(0);
  const [items, setItems] = useState("");
  const [dates, setDates] = useState({});
  const [close, setClose] = useState({});
  const [volume, setVolume] = useState(0);
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);
  const [price, setPrice] = useState(0);
  const [prediction, setPrediction] = useState("");


  const buy = (event) => {
    event.preventDefault();
    console.log(action)
    if (action == "Buy") {
      Axios.post("http://127.0.0.1:8000/buy", {
        stock_symbol: symbol,
        action: action,
        stock_quantity: quantity,
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
        stock_quantity: quantity,
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

  const stock_search = (s) => {
    Axios.post("http://127.0.0.1:8000/search", {
      stock_symbol: s
    })
    .then((response) => {
      console.log(response.data);
      setItems(response.data.suggested_symbols);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const chart_data = async (S) => {
    await Axios.post("http://127.0.0.1:8000/chart", {
      symbol: S
    })
    .then((response) => {
      console.log(response.data.chart_date);
      setDates(response.data.chart_date);
      setClose(response.data.chart_close);
      setVolume(response.data.volume);
      setHigh(response.data.high);
      setLow(response.data.low);
      setPrice(response.data.curr_price);
      setPrediction(response.data.prediction);
    })
    .catch((error) => {
      console.log(error);
    });
  }


  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    console.log("searched");
    console.log(string);
    stock_search(string);
  }

  const handleOnHover = (result) => {
    // the item hovered
    console.log(result)
  }

  const handleOnSelect = (item) => {
    // the item selected
    console.log("the selected item");
    console.log(item['name']);
    setSymbol(item['name']);
    chart_data(item['name']);
  }

  const handleOnFocus = () => {
    console.log('Focused')
  }

  const handleOnClear = () => {
    console.log('Cleared');
  }

  return (
    <div>
      <MDBContainer className="p-3 my-5 d-flex flex-column ">
        <form>

          <ReactSearchAutocomplete
            items={items}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            onClear={handleOnClear}
            autoFocus
            
          />
          <p>{prediction}</p>
          <div style={{display: 'flex', width: '100%'}}>
          
          <MDBTable>
            <MDBTableHead>
            <tr>
                <th scope="col">Volume</th>
                <th scope="col">Days High</th>
                <th scope="col">Days Low</th>
                <th scope="col">Current Price</th>
                
            </tr>
            </MDBTableHead>
            <MDBTableBody>
                  <td><tr scope="row">{volume}</tr></td>
                  <td><tr scope="row">{high}</tr></td>
                  <td><tr scope="row">{low}</tr></td>
                  <td><tr scope="row">{price}</tr></td>
            </MDBTableBody>
          </MDBTable>
            <Plot
              data={[
                {
                  x: dates,
                  y: close,
                  fill: 'tozeroy',
                  type: 'scatter',
                }
              ]}
              layout={{width: 800, height: 500, title:'', xaxis:{title:"Timeline"}, yaxis:{title:"Value"}} }
              style={{ position: 'relative', zIndex: '-2', marginTop:'20px'}}
              />
            </div>
          
          {/* <MDBInput
            wrapperClass="mb-4"
            label="Search Symbol (Example: IBM)"
            type="text"
            onChange={(e) => {
              setSymbol(e.target.value);
            }}
          /> */}
          <select defaultValue={Buy}
            onChange={(e) => {
              setAction(e.target.value);
            }}
          >
            <option value={"Buy"} selected>Buy</option>
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
