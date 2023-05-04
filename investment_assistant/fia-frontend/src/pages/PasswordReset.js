import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from "axios";
import {
    MDBContainer,
    MDBInput,
    MDBBtn
} from "mdb-react-ui-kit";

function PasswordReset(props) {

    const {id}  = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if(newPassword == newPasswordConfirm){
            Axios.put("http://127.0.0.1:8000/resetpassword", {
            userid: id,
            password: newPasswordConfirm,
            })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
        }else{
            console.log("The passwords do not match!");
        }
    };

    return (
        <div>
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50 text-center">
            <h2>Reset Your Password</h2>
            <MDBInput
            wrapperClass="mb-4"
            label="New Password"
            type="password"
            onChange={(e) => {setNewPassword(e.target.value);}}
                />
            <MDBInput
            wrapperClass="mb-4"
            label="Confirm Password"
            type="password"
            onChange={(e) => {setNewPasswordConfirm(e.target.value);}}
           />
            <MDBBtn className="mb-4 w-100" onClick={handleSubmit}>Submit</MDBBtn>

        </MDBContainer>
            
        </div>
    );
}

export default PasswordReset;