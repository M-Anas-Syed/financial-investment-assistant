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
  MDBTable, MDBTableHead, MDBTableBody,MDBSpinner, MDBListGroup, MDBListGroupItem
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
  const [items, setItems] = useState('');
  const [dates, setDates] = useState([]);
  const [open, setOpen] = useState([]);
  const [close, setClose] = useState([]);
  const [volume, setVolume] = useState({});
  const [high, setHigh] = useState([]);
  const [low, setLow] = useState([]);
  const [price, setPrice] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [lisData, setLisData] = useState([]);


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

  var data;

  const chart_data = (S) => {
    // setTimeout(() => {
    Axios.post("http://127.0.0.1:8000/chart", {
      symbol: S
    })
    .then((response) => {
      console.log(response.data.open);
      setDates(response.data.chart_date);
      setOpen(response.data.open);
      setClose(response.data.chart_close);
      setVolume(response.data.volume);
      setHigh(response.data.high);
      setLow(response.data.low);
      setPrice(response.data.curr_price);
      setPrediction(response.data.prediction);

      setLisData(response.data.lisData);
    })
    .catch((error) => {
      console.log(error);
    });
  }


  const handleOnSearch = (string, results) => {
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

  // const dataPreprocessing = (dates, open, low, close, high) =>{
  //   let lisData = [["Year","","","",""]];
  //   for(let i = 0; i < dates.length; i ++){
  //     let temp = [];
  //     temp.push(dates[i]);
  //     temp.push(open[i]);
  //     temp.push(low[i]);
  //     temp.push(close[i]);
  //     temp.push(high[i]);
  //     lisData.push(temp);
  //   }
  //   return lisData;
  // }

  // const data = dataPreprocessing(dates, open, low, close, high);

  const options = {
    legend: "none",
    explorer: { 
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 4.0},
      series: {
        1: {type: 'line'}
      }
  
  }


  return (
    <div>
      <MDBContainer className="p-3 my-5 d-flex flex-column ">
        <form>
          {console.log(items)}
          <ReactSearchAutocomplete
            items={items}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            onClear={handleOnClear}
            autoFocus
          />
          {/* <div style={{display: 'flex', width: '100%'}}>
          <div className="w-100 position-relative">
          <MDBInput
            wrapperClass="w-100"
            label="Symbol Ex: IBM"
              type="text"
              style={{width:'100%'}}
              onChange={(e) => {
                setSymbol(e.target.value)
              }}
            />
            <MDBListGroup className="position-absolute" style={{ minWidthL: '22rem', zIndex: '5' }} light>
              {items.length > 0 && items.map((x) => <MDBListGroupItem>{x['name']}</MDBListGroupItem>)}
            </MDBListGroup>
            </div>
            <MDBBtn onClick={stock_search}>Search</MDBBtn>
          </div> */}
          
          <p>{prediction}</p>
          <div style={{display: 'flex', width: '100%'}}>
          {/* {console.log(lisData)} */}
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
                  {/* <td><tr scope="row">{volume}</tr></td>
                  <td><tr scope="row">{high}</tr></td>
                  <td><tr scope="row">{low}</tr></td>
                  <td><tr scope="row">{price}</tr></td> */}
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

            <Chart
              chartType="CandlestickChart"
              width="900px"
              height="500px"
              data={lisData}
              options={options}
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
