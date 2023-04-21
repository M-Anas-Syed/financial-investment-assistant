import React, { useEffect, useState } from "react";
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
  MDBInput,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import Cookies from "js-cookie";
import { redirect } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

function Register() {
  Axios.defaults.withCredentials = true;
  Axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  Axios.defaults.xsrfCookieName = "csrftoken";

  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [confirmPasswordReg, setConfirmPasswordReg] = useState("");

  const [usernameLogin, setUsernameLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [basicModal, setBasicModal] = useState(false);

  const [resetEmail, setResetEmail] = useState("");

  const [show, setShow] = useState(true);
  const [errors, setErrors] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState([]);

  const navigate = useNavigate();

  const toggleShow = () => setBasicModal(!basicModal);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (passwordReg == confirmPasswordReg) {
      if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(usernameReg)) {
        Axios.post("http://127.0.0.1:8000/register", {
          username: usernameReg,
          password: passwordReg,
        })
          .then((response) => {
            console.log(response.data);
            navigate(0);
          })
          .catch((error) => {
            let error_msgs = [];
            if ("username" in error.response.data) {
              error_msgs.push("Email: " + error.response.data["username"][0]);
            }
            if ("password" in error.response.data) {
              console.log(error.response.data["password"]);
              error_msgs.push(
                "Password: " + error.response.data["password"][0]
              );
            }
            setMsg(error_msgs);
            setErrors(true);
            // setMsg(error);
          });
      } else {
        setErrors(true);
        setMsg(["Please enter a valid email!"]);
      }
    } else {
      setErrors(true);
      setMsg(["The passwords do not match!"]);
      // setErrors("The passwords you entered do not match!");
    }
  };

  const login = async () => {
    const csrftoken = Cookies.get("csrftoken");
    await Axios.post(
      "http://127.0.0.1:8000/login",
      {
        username: usernameLogin,
        password: passwordLogin,
      },
      {
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        console.log(response.data);
        navigate("/");
      })
      .catch((error) => {
        console.log(error.response.data);
        setMsg(["Invalid email or password!"]);
        setErrors(true);
      });
  };

  const [justifyActive, setJustifyActive] = useState("tab1");

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setJustifyActive(value);
  };

  const passwordResetForm = async () => {
    await Axios.post("http://127.0.0.1:8000/resetpassword", {
      resetEmail: resetEmail,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
        
        setErrors(true);
      });
  };

  //   const passwordValidation = (e) =>{
  //     setPasswordReg(e.target.value);
  //     if()
  //   }

  return (
    <div>
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
              Login
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => handleJustifyClick("tab2")}
              active={justifyActive === "tab2"}
            >
              Register
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>
      </MDBContainer>

      <MDBTabsContent className="p-3 my-5 d-flex flex-column w-50 mx-auto">
        <MDBTabsPane show={justifyActive === "tab1"}>
          {errors == true && (
              <Alert
                variant="danger"
                onClose={() => setErrors(false)}
                dismissible
              >
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                {msg.map((x) => (
                  <p>{x}</p>
                ))}
              </Alert>
            )}
          <MDBInput
            wrapperClass="mb-4"
            label="Email"
            type="email"
            onChange={(e) => {
              setUsernameLogin(e.target.value);
            }}
          />
          <MDBInput
            wrapperClass="mb-4"
            label="Password"
            type="password"
            onChange={(e) => {
              setPasswordLogin(e.target.value);
            }}
          />
          <a
            wrapperClass="mb-4"
            href="#"
            onClick={toggleShow}
            className="text-right"
          >
            Forgot Password?
          </a>

          <MDBModal show={basicModal} setShow={setBasicModal} tabIndex="-1">
            <MDBModalDialog>
              <MDBModalContent>
                <MDBModalHeader>
                  <MDBModalTitle>Forgot your Password?</MDBModalTitle>

                  <MDBBtn
                    className="btn-close"
                    color="none"
                    onClick={toggleShow}
                  ></MDBBtn>
                </MDBModalHeader>
                <MDBModalBody>
                  <p>Enter your email address. If an account has been registered, an email will be sent to reset your password.</p>
                  <MDBInput
                    wrapperClass="m-4"
                    label="Email"
                    type="email"
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                    }}
                  />
                </MDBModalBody>
                
                <MDBModalFooter>
                  <MDBBtn color="secondary" onClick={toggleShow}>
                    Close
                  </MDBBtn>
                  <MDBBtn onClick={passwordResetForm}>Submit</MDBBtn>
                </MDBModalFooter>
              </MDBModalContent>
            </MDBModalDialog>
          </MDBModal>

          <MDBBtn className="mb-4 w-100" onClick={login}>
            Sign in
          </MDBBtn>
          <p className="text-center">
            Not a member?{" "}
            <a
              href="#!"
              onClick={() => handleJustifyClick("tab2")}
              active={justifyActive === "tab2"}
            >
              Register
            </a>
          </p>
        </MDBTabsPane>

        <MDBTabsPane show={justifyActive === "tab2"}>
          {errors == true && (
            <Alert
              variant="danger"
              onClose={() => setErrors(false)}
              dismissible
            >
              <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
              {msg.map((x) => (
                <p>{x}</p>
              ))}
            </Alert>
          )}
          <form>
            <div className="invalid-feedback">
              Please provide a valid Email address.
            </div>
            <MDBInput
              wrapperClass="mb-4"
              label="Email *"
              type="email"
              name="email"
              onChange={(e) => {
                setUsernameReg(e.target.value);
              }}
              required="true"
            />

            <MDBInput
              wrapperClass="mb-4"
              label="Password *"
              type="password"
              onChange={(e) => {
                setConfirmPasswordReg(e.target.value);
              }}
              required="true"
            />

            <MDBInput
              wrapperClass="mb-4"
              label="Confirm Password *"
              type="password"
              onChange={(e) => {
                setPasswordReg(e.target.value);
              }}
              required="true"
            />

            <MDBBtn className="mb-4 w-100" onClick={handleSubmit} type="submit">
              Sign up
            </MDBBtn>
          </form>

          <p className="text-center">
            Already have an account?{" "}
            <a
              href="#!"
              onClick={() => handleJustifyClick("tab1")}
              active={justifyActive === "tab1"}
            >
              Sign In
            </a>
          </p>
        </MDBTabsPane>
      </MDBTabsContent>
    </div>
  );
}

export default Register;
