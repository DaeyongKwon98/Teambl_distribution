import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import GoSearchIcon from "../assets/header_gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import NotiIconActive from "../assets/notiIconActive.svg";
import TeamblIcon from "../assets/teamblIcon.svg";
import api from "../api";
import defaultProfileImage from "../assets/default_profile_image.svg";
import SideMenu from './SideMenu';

const Header = ({ profileImage }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [unreadNotifications, setUnreadNotifications] = useState(0); // 읽지 않은 알림 수

  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);

  const goToSearch = () => { navigate("/search"); };
  const goToNotification = () => { navigate("/notification"); };
  const goToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: { prevPage: "home" },
    });
  };

  // 읽지 않은 알림 개수를 가져오는 함수
  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/api/notifications-unread-count/"); // 백엔드 API 호출
      setUnreadNotifications(response.data.unread_count); // 읽지 않은 알림 개수 상태 업데이트
      console.log("Unread notificatoin count", response.data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread notifications", error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications(); // 컴포넌트가 마운트될 때 읽지 않은 알림 개수 가져오기
  }, []);
  
  return (
    <header className="home-header">
      <div className="home-logo">
        <img
          src={TeamblIcon}
          alt="팀블로고"
          className="home-teambl-icon"
          onClick={() => {navigate("/home")}}
        />
      </div>
      <div className="home-search-noti-profile">
        <img
          src={GoSearchIcon}
          alt="검색화면이동"
          className="home-gosearch-icon"
          onClick={goToSearch}
        />
        <img
          src={unreadNotifications > 0 ? NotiIconActive : NotiIcon} // 조건에 따라 아이콘 변경
          alt="알림"
          className="home-noti-icon"
          onClick={goToNotification}
        />
        <img
          src={profileImage ? profileImage : defaultProfileImage}
          alt="내 프로필"
          className="home-profile-icon"
          onClick={() => setIsSlideMenuOpen(true)}
        />
      </div>
      {/** side menu */}
      <SideMenu
        isOpen={isSlideMenuOpen}
        setIsOpen={setIsSlideMenuOpen}
        profileImage={profileImage ? profileImage : defaultProfileImage}
        userId={userId}
      />
    </header>
  );
};

export default Header;
