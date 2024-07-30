import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Friend.css";

function Friend() {
  const navigate = useNavigate();

  const goToInvitePage = () => {
    navigate("/invite");
  };

  return (
    <div className="friend-container">
      <h1>This is friends page.</h1>
      <button onClick={goToInvitePage}>Go to Invite Page</button>
    </div>
  );
}

export default Friend;
