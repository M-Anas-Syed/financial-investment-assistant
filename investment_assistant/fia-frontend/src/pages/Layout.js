import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  MDBNavbar,
  MDBContainer,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBNavbarToggler,
  MDBCollapse,
  MDBBtn,
  MDBNavbarBrand
} from 'mdb-react-ui-kit';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {

  const navigate = useNavigate();

  const [showNavRight, setShowNavRight] = useState(false);


  const signout = () => {
    navigate("/register");
  }

  return (
    <>

      <MDBNavbar expand='lg' dark bgColor='primary'>
      <MDBContainer fluid>
        <MDBNavbarBrand href='/'>Financial Investment Assistant</MDBNavbarBrand>

        <MDBNavbarToggler
          type='button'
          data-target='#navbarRightAlignExample'
          aria-controls='navbarRightAlignExample'
          aria-expanded='false'
          aria-label='Toggle navigation'
          onClick={() => setShowNavRight(!showNavRight)}
        >
          <MDBIcon icon='bars' fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar show={showNavRight}>
          <MDBNavbarNav right fullWidth={false} className='mb-2 mb-lg-0'>
            <MDBNavbarItem>
              <MDBNavbarLink active aria-current='page' href='/'>
                Home
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink href='/portfolio'>Portfolio</MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink href='#'>Ask an Expert</MDBNavbarLink>
            </MDBNavbarItem>
            
            <MDBBtn onClick={signout} outline color="light" className='bg-danger' size="sm" type='button'>
              Sign Out
            </MDBBtn>
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>

      <Outlet />
    </>
  )
};

export default Layout;
