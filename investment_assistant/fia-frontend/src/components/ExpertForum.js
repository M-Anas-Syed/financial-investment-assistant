import React, { useState, useEffect } from "react";
import { MDBInput, MDBBtn, MDBContainer } from "mdb-react-ui-kit";
import Axios from "axios";


function ExpertForum(props) {
  const [question, setQuestion] = useState("");
  const [qid, setQid] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showQuestion, setShowQuestion] = useState([]);
  const [showResponse, setShowResponse] = useState("");


  const postResponse = (event) => {
    event.preventDefault();
      Axios.post("http://127.0.0.1:8000/forumresponse", {
        response: answer,
        belongs_to: qid,
      })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    
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
                {/* {console.log(showResponse)} */}
                
                <form>
                
                  <MDBInput
                    wrapperClass="mb-4"
                    textarea
                    id="Answer"
                    rows={4}
                    label="Reply"
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setQid(x[0]);
                    }}
                  />
                  <MDBBtn className="mb-4" onClick={postResponse} block>
                    Post
                  </MDBBtn>
                </form>
              </div>
            ))}
        </div>
      </MDBContainer>
    </div>
  );
}

export default ExpertForum;
