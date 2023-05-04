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
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBSpinner,
  MDBListGroup,
  MDBListGroupItem,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
} from "mdb-react-ui-kit";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import Chart from "react-google-charts";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";

function Buy() {
  Axios.defaults.withCredentials = true;
  Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  Axios.defaults.xsrfCookieName = "csrftoken";

  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("");
  const [action, setAction] = useState("Buy");
  const [quantity, setQuantity] = useState(0);
  const [items, setItems] = useState("");
  const [dates, setDates] = useState([]);
  const [open, setOpen] = useState([]);
  const [close, setClose] = useState([]);
  const [volume, setVolume] = useState([]);
  const [high, setHigh] = useState([]);
  const [low, setLow] = useState([]);
  const [price, setPrice] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [lisData, setLisData] = useState([]);

  const [justifyActive, setJustifyActive] = useState("tab1");

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setJustifyActive(value);
  };

  const [errors, setErrors] = useState(false);
  const [msg, setMsg] = useState("");

  const buy = (event) => {
    event.preventDefault();
    console.log(action);
    if (quantity > 0 && quantity < 1000) {
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
      } else if (action == "Sell") {
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
    } else {
      setErrors(true);
      setMsg("Please enter a valid quantity amount!");
    }
  };

  const stock_search = (s) => {
    Axios.post("http://127.0.0.1:8000/search", {
      stock_symbol: s,
    })
      .then((response) => {
        console.log(response.data);
        setItems(response.data.suggested_symbols);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  var data;

  const chart_data = (S) => {
    Axios.post("http://127.0.0.1:8000/chart", {
      symbol: S,
    })
      .then((response) => {
        console.log(response.data);
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
  };

  const handleOnSearch = (string, results) => {
    console.log("searched");
    console.log(string);
    stock_search(string);
  };

  const handleOnHover = (result) => {
    // the item hovered
    console.log(result);
  };

  const handleOnSelect = (item) => {
    // the item selected
    console.log("the selected item");
    console.log(item["name"]);
    setSymbol(item["name"]);
    chart_data(item["name"]);
  };

  const handleOnFocus = () => {
    console.log("Focused");
  };

  const handleOnClear = () => {
    console.log("Cleared");
  };

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
      actions: ["dragToZoom", "rightClickToReset"],
      axis: "horizontal",
      keepInBounds: true,
      maxZoomIn: 4.0,
    },
    series: {
      1: { type: "line" },
    },
  };

  return (
    <div>
      <MDBContainer
        className="p-3 my-5 d-flex flex-column "
        style={{ maxWidth: "1400px" }}
      >
        <form>
          {/* {console.log(items)} */}

          <div>
            <ReactSearchAutocomplete
              items={items}
              onSearch={handleOnSearch}
              onHover={handleOnHover}
              onSelect={handleOnSelect}
              onFocus={handleOnFocus}
              onClear={handleOnClear}
              autoFocus
            />
          </div>

          <h2 style={{textAlign:"center", margin:"40px"}}>{prediction}</h2>
          <div>
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
                  <td><tr scope="row">{high[0]}</tr></td>
                  <td><tr scope="row">{low[0]}</tr></td>
                  <td><tr scope="row">{price}</tr></td>
              </MDBTableBody>
            </MDBTable>
            <div>
              <MDBContainer className="p-3 d-flex flex-column">
                <MDBTabs
                  pills
                  justify
                  className="mb-3 d-flex flex-row justify-content-between"
                >
                  <MDBTabsItem>
                    <MDBTabsLink
                      onClick={() => handleJustifyClick("tab1")}
                      active={justifyActive === "tab1"}
                    >
                      Normal
                    </MDBTabsLink>
                  </MDBTabsItem>
                  <MDBTabsItem>
                    <MDBTabsLink
                      onClick={() => handleJustifyClick("tab2")}
                      active={justifyActive === "tab2"}
                    >
                      Candlestick
                    </MDBTabsLink>
                  </MDBTabsItem>
                </MDBTabs>
              </MDBContainer>
              <MDBTabsContent className="p-3 d-flex flex-column  mx-auto">
                <MDBTabsPane show={justifyActive === "tab1"}>
                  <Plot
                    data={[
                      {
                        x: dates,
                        y: close,
                        fill: "tozeroy",
                        type: "scatter",
                      },
                    ]}
                    layout={{
                      width: 800,
                      height: 500,
                      title: "",
                      xaxis: { title: "Timeline" },
                      yaxis: { title: "Value" },
                    }}
                    style={{
                      position: "relative",
                      zIndex: "1"
                    }}
                  />
                </MDBTabsPane>

                <MDBTabsPane show={justifyActive === "tab2"}>
                  <Chart
                    chartType="CandlestickChart"
                    width="800px"
                    height="500px"
                    data={lisData}
                    options={options}
                  />
                </MDBTabsPane>
              </MDBTabsContent>
            </div>
          </div>

          {/* <MDBInput
            wrapperClass="mb-4"
            label="Search Symbol (Example: IBM)"
            type="text"
            onChange={(e) => {
              setSymbol(e.target.value);
            }}
          /> */}
          <select
            defaultValue={Buy}
            onChange={(e) => {
              setAction(e.target.value);
            }}
          >
            <option value={"Buy"} selected>
              Buy
            </option>
            <option value={"Sell"}>Sell</option>
          </select>
          {errors == true && (
            <Alert
              variant="danger"
              onClose={() => setErrors(false)}
              dismissible
            >
              <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
              {msg}
            </Alert>
          )}
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
