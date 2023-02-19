import React, { useState,useEffect } from 'react';
import User from '../components/User';
import Admin from '../components/Admin'
import Expert from '../components/Expert'
import Axios from 'axios';


function Main() {

    const [role, setRole] = useState('');

    // Axios.defaults.withCredentials = true;

    Axios.defaults.withCredentials = true;
    Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    Axios.defaults.xsrfCookieName = "csrftoken";

    useEffect( () => {
        Axios.get("http://127.0.0.1:8000/login").then((response) =>{
            setRole(response.data);
        })
    })

    // useEffect(() => {
    //     setRole('User');
    // }, []);

    
    return (
        <div>
            {role == 'Customer' && <User/>} {role == 'Admin' && <Admin/>} {role == 'Expert' && <Expert/>}
        </div>
    );
}

export default Main;