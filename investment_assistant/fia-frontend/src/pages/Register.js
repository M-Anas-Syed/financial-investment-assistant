import React, {useEffect, useState} from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    MDBContainer,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBBtn,
    MDBInput
  }
  from 'mdb-react-ui-kit';
  import Cookies from 'js-cookie';
  import { redirect } from "react-router-dom";

function Register() {

    Axios.defaults.withCredentials = true;
    Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    Axios.defaults.xsrfCookieName = "csrftoken";

    const [usernameReg, setUsernameReg] = useState('');
    const [passwordReg, setPasswordReg] = useState('');    

    const [usernameLogin, setUsernameLogin] = useState('');
    const [passwordLogin, setPasswordLogin] = useState('');

    const navigate = useNavigate();


    const handleSubmit = (event) => {
        event.preventDefault();
        Axios.post('http://127.0.0.1:8000/register',{
            username: usernameReg,
            password: passwordReg
        })
        .then(response => {
            console.log(response.data)
            navigate(0);
        })
        .catch(error => {
            console.log(error)
        });
    };

    const login = async() => {
        const csrftoken = Cookies.get('csrftoken');
        await Axios.post("http://127.0.0.1:8000/login", {
        username: usernameLogin,
        password: passwordLogin
        }, {
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        }
        })
        .then(response => {
            console.log(response.data);
            navigate("/");
        })
        .catch(error => {
            console.log(error);
        });
    }

    const [justifyActive, setJustifyActive] = useState('tab1');;

    const handleJustifyClick = (value) => {
        if (value === justifyActive) {
        return;
        }
        setJustifyActive(value);
    };

    return (
        <div>
            <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
                <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                            Login
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                            Register
                        </MDBTabsLink>
                    </MDBTabsItem>
                </MDBTabs>
            </MDBContainer>

            <MDBTabsContent className="p-3 my-5 d-flex flex-column w-50 mx-auto">

                <MDBTabsPane show={justifyActive === 'tab1'}>

                    <MDBInput wrapperClass='mb-4' label='Email' type='email' onChange={(e) => {setUsernameLogin(e.target.value);}}/>
                    <MDBInput wrapperClass='mb-4' label='Password' type='password' onChange={(e) => {setPasswordLogin(e.target.value);}}/>

                    <MDBBtn className="mb-4 w-100" onClick={login}>Sign in</MDBBtn>
                    <p className="text-center">Not a member? <a href="#!" onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'} >Register</a></p>

                </MDBTabsPane>

                <MDBTabsPane show={justifyActive === 'tab2'}>

                    <MDBInput wrapperClass='mb-4' label='Email' type='email' onChange={(e) => {setUsernameReg(e.target.value)}}/>
                    {/* <MDBInput wrapperClass='mb-4' label='Email' type='email'  onChange={handleInputChange}/> */}
                    <MDBInput wrapperClass='mb-4' label='Password' type='password' onChange={(e) => {setPasswordReg(e.target.value)}}/>

                    <MDBBtn className="mb-4 w-100" onClick={handleSubmit}>Sign up</MDBBtn>

                    <p className="text-center">Already have an account? <a href="#!" onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'} >Sign In</a></p>


                </MDBTabsPane>

            </MDBTabsContent>
        </div>
    );
}

export default Register;