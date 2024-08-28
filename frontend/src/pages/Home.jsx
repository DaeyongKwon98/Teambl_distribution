import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import GoSearchIcon from "../assets/gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import NotiIconActive from "../assets/notiIconActive.svg";
import TeamblIcon from "../assets/teamblIcon.svg";
import CloseIcon from "../assets/closeIcon.svg";
import FriendCard from "../components/FriendCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const goToProjects = () => {
    navigate("/projects");
  };
  const goToFriends = () => {
    navigate("/friends");
  };
  const goToSearch = () => {
    navigate("/search");
  };
  const goToInvite = () => {
    navigate("/invite");
  };
  const goToProfile = async () => {
    try {
      const response = await api.get("/api/current-user/");
      const currentUserID = response.data.id;
      navigate(`/profile/${currentUserID}`);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };
  const goToNotification = () => {
    navigate("/notification");
  };
  const goToSetting = () => {
    navigate("/setting");
  };

  const [activeNav, setActiveNav] = useState("홈");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetFriends, setBottomSheetFriends] = useState([]);

  const [secondDegreeDiff, setSecondDegreeDiff] = useState(0); // 증가한 2촌 수
  const [keywordDiff, setKeywordDiff] = useState(0); // 증가한 같은 키워드 사용자 수
  const [recentSecondDegreeProfiles, setRecentSecondDegreeProfiles] = useState([]); // 증가한 2촌 프로필
  const [recentKeywordProfiles, setRecentKeywordProfiles] = useState([]); // 증가한 같은 키워드 사용자 프로필

  // Fetch statistics difference and recent profiles
  const fetchStatisticsDifference = async () => {
    try {
      const response = await api.get("/api/user-statistics-difference/");
      setSecondDegreeDiff(response.data.second_degree_difference);
      setKeywordDiff(response.data.keyword_difference);
      setRecentSecondDegreeProfiles(response.data.new_second_degree_profiles);
      setRecentKeywordProfiles(response.data.new_keyword_profiles);

      console.log("RecentSecondDegreeProfiles", response.data.new_second_degree_profiles);
      console.log("RecentKeywordProfiles", response.data.new_keyword_profiles);
    } catch (error) {
      console.error("Failed to fetch user statistics difference", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchStatisticsDifference();
    };
    fetchData();
  }, []);

  const openBottomSheet = (friends) => {
    setBottomSheetFriends(friends);
    setIsBottomSheetOpen(true);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    if (item === "1촌") {
      goToFriends();
    } else if (item === "초대") {
      goToInvite();
    } else if (item === "설정") {
      goToSetting();
    }
  };

  return (
    <div className="home-container">
      <Header />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />

      <section className="home-friend-recommendation">
        <div className="home-section-header">
          <h2>이번주 새로운 2촌</h2>
          <span
            className="home-view-all"
            onClick={() => openBottomSheet(recentSecondDegreeProfiles)}
          >
            모두 보기
          </span>
        </div>
        <div className="home-sub-header">
          <span className="home-sub-header-text">2촌이 </span>
          <span className="home-sub-header-num">{secondDegreeDiff}명 </span>
          <span className="home-sub-header-text">증가했어요!</span>
        </div>
        <div className="home-friends-list">
          {recentSecondDegreeProfiles.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </section>

      <section className="home-keyword-recommendation">
        <div className="home-section-header">
          <h2>내 키워드와 연관된</h2>
          <span
            className="home-view-all"
            onClick={() => openBottomSheet(recentKeywordProfiles)}
          >
            모두 보기
          </span>
        </div>
        <div className="home-sub-header">
          <span className="home-sub-header-text">가입자가 </span>
          <span className="home-sub-header-num">
            {keywordDiff}명{" "}
          </span>
          <span className="home-sub-header-text">증가했어요!</span>
        </div>
        <div className="home-friends-list">
          {recentKeywordProfiles.map((friend) => (
            <FriendCard key={friend.id} friend={friend} isKeywordFriend />
          ))}
        </div>
      </section>

      {isBottomSheetOpen && (
        <div className="home-bottom-sheet-overlay" onClick={closeBottomSheet}>
          <div
            className="home-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={CloseIcon}
              alt="닫기"
              className="home-close-icon"
              onClick={closeBottomSheet}
            />
            <h3>알아두면 좋은 친구</h3>
            <div className="home-bottom-sheet-content">
              {bottomSheetFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  isKeywordFriend={!!friend.sametag}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <h1>Home Page</h1>
      <button onClick={goToProjects} className="button1">
        프로젝트
      </button>
      <button onClick={goToFriends} className="button2">
        일촌
      </button>
      <button onClick={goToSearch} className="button3">
        탐색
      </button>
      <button onClick={goToInvite} className="button4">
        초대
      </button>
      <button onClick={goToProfile} className="button5">
        내 프로필
      </button>
      <button onClick={goToNotification} className="button6">
        알림
      </button>
    </div>
  );
}

export default Home;
