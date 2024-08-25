import React from 'react';
import { useNavigate } from "react-router-dom";
import GoSearchIcon from "../assets/gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import TeamblIcon from "../assets/teamblIcon.svg";

const Header = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const goToSearch = () => { navigate("/search"); };
  const goToNotification = () => { navigate("/notification"); };
  const goToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: { prevPage: "home" },
    });
  };

  return (
    <header className="home-header">
      <div className="home-search">
        <img
          src={GoSearchIcon}
          alt="검색화면이동"
          className="home-gosearch-icon"
          onClick={goToSearch}
        />
      </div>
      <div className="home-logo">
        <img
          src={TeamblIcon}
          alt="팀블로고"
          className="home-teambl-icon"
        />
      </div>
      <div className="home-profile-and-notifications">
        <img
          src={NotiIcon}
          alt="알림"
          className="home-noti-icon"
          onClick={goToNotification}
        />
        <img
          src={'https://via.placeholder.com/50'}
          alt="내 프로필"
          className="home-profile-icon"
          onClick={goToProfile}
        />
      </div>
    </header>
  );
};

export default Header;
