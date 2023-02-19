import React, { useState } from "react";
import { MDBRow, MDBCol } from "mdb-react-ui-kit";
import Layout from "./Layout";

function Portfolio() {
  return (
    <div>
      <Layout />
      <MDBRow>
        <MDBCol md="4">md="4"</MDBCol>
        <MDBCol md="8">md="8"</MDBCol>
      </MDBRow>
    </div>
  );
}

export default Portfolio;
