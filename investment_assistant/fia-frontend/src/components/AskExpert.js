import React, { useState, useEffect } from "react";
import { MDBInput, MDBBtn, MDBContainer } from "mdb-react-ui-kit";
import Axios from "axios";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";


function AskExpert(props) {
  const [question, setQuestion] = useState("");
  const [qid, setQid] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showQuestion, setShowQuestion] = useState([]);
  const [showResponse, setShowResponse] = useState("");

  const [errors, setErrors] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const postQuestion = (event) => {
    event.preventDefault();
    if(question.trim()){
      Axios.post("http://127.0.0.1:8000/forumquestion", {
        question: question,
      })
        .then((response) => {
          console.log(response.data);
          navigate(0);
        })
        .catch((error) => {
          console.log(error);
        });
    }else{
      setErrors(true);
      setMsg("Please enter a valid question!");
    }
  };


  useEffect(() => {
    Axios.get("http://127.0.0.1:8000/forumquestion").then((response) => {
      console.log(response.data.questions);
      setShowQuestion(response.data.questions);
    });
  }, []);

  useEffect(() => {
    Axios.get("http://127.0.0.1:8000/forumresponse").then((response) => {
      console.log(response.data.response);
      setShowResponse(response.data.response);
    });
  }, []);


  return (
    <div>
      <Layout />
      <MDBContainer className="px-5 my-5 d-flex flex-column ">
        <div>
          {showQuestion.length > 0 &&
            showQuestion.map((x) => (
              <div className="bg-blue-gray-100 shadow-2 position-relative ">
                <p className="fs-5 p-2" style={{ backgroundColor: "#CFD8DC" }}>
                  {x[2]}: {x[1]}
                </p>
                {showResponse.length > 0 &&
                  showResponse.map((r) =>
                    x[0] === r[0] ? (
                      <p
                        className="px-5 my-2"
                        style={{ backgroundColor: "#FAFAFA" }}
                      >
                        {r[2]}: {r[1]}
                      </p>
                    ) : (
                      <p></p>
                    )
                  )}
              </div>
            ))}
        </div>
        <form>
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
            textarea
            id="Question"
            rows={4}
            label="Question"
            onChange={(e) => {
              setQuestion(e.target.value);
            }}
          />

          <MDBBtn className="mb-4" onClick={postQuestion} block>
            Post
          </MDBBtn>
        </form>
      </MDBContainer>
    </div>
  );
}

export default AskExpert;
