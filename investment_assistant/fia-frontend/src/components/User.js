import { React, useState, useEffect } from "react";
import Layout from "./Layout";
import Buy from "./Buy";
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
} from "mdb-react-ui-kit";
import Portfolio from "./Portfolio";
import Axios from "axios";


function User() {
  const [justifyActive, setJustifyActive] = useState("tab1");

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setJustifyActive(value);
  };

  return (
    <div>
      <Layout />

      <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
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
              Portfolio
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => handleJustifyClick("tab2")}
              active={justifyActive === "tab2"}
            >
              Trade
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>
      </MDBContainer>
      <MDBTabsContent className="p-3 my-5 d-flex flex-column w-50 mx-auto">
        <MDBTabsPane show={justifyActive === "tab1"}>
          
          <Portfolio />
        </MDBTabsPane>

        <MDBTabsPane show={justifyActive === "tab2"}>
          <Buy />
        </MDBTabsPane>
      </MDBTabsContent>
    </div>
  );
}

export default User;
