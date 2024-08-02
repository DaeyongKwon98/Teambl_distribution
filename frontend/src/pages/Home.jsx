import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const goToProjects = () => {
    navigate("/projects");
  };

  const goToFriends = () => {
    navigate("/friends");
  };

  const goToSearch = () => {
    navigate("/search");
  };

  return (
    <div className="home-container">
      <h1>Home Page</h1>
      <button onClick={goToProjects} className="button1">
        Project
      </button>
      <button onClick={goToFriends} className="button2">
        Friend
      </button>
      <button onClick={goToSearch} className="button3">
        Search
      </button>
    </div>
  );
}

export default Home;
