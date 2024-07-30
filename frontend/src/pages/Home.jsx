import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const goToProjects = () => {
    navigate('/projects');
  };

  const goToFriends = () => {
    navigate('/friends');
  };

  return (
    <div className="home-container">
      <h1>Home Page</h1>
      <button onClick={goToProjects}>Project</button>
      <button onClick={goToFriends}>Friend</button>
    </div>
  );
}

export default Home;
