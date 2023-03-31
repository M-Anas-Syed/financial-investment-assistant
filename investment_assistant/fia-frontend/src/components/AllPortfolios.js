import React, { useState, useEffect } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import Axios from "axios";

function AllPortfolios(props) {

    const [portfolioList, setPortfolioList] = useState({});
    const [symbol, setSymbol] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [user, setUser] = useState('');

    useEffect(() => {
        Axios.get("http://127.0.0.1:8000/allportfolios").then((response) => {
          console.log(response.data.portfolios);
          setSymbol(response.data.portfolios[0]);
          setPurchaseDate(response.data.portfolios[1]);
          setPrice(response.data.portfolios[2]);
          setQuantity(response.data.portfolios[3]);
          setUser(response.data.portfolios[4]);

        });
      }, []);

    return (

        <div>
            <MDBTable>
                <MDBTableHead>
                    <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Purchase Date</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">User</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    <tr>
                        {symbol.length > 0 && symbol.map((x) => <td scope="row">{x}</td>)}
                    </tr>
                    <tr>
                        {purchaseDate.length > 0 &&
                        purchaseDate.map((x) => <td scope="row">{x}</td>)}
                    </tr>
                    <tr>
                        {price.length > 0 && price.map((x) => <td scope="row">{x}</td>)}
                    </tr>
                    <tr>
                        {quantity.length > 0 &&
                        quantity.map((x) => <td style={{align:"center"}} scope="row">{x}</td>)}
                    </tr>
                    <tr>
                        {user.length > 0 && user.map((x) => <td scope="row">{x}</td>)}
                    </tr>
                </MDBTableBody>
            </MDBTable>
        </div>

    );
}

export default AllPortfolios;