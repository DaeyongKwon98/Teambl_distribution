import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import GoSearchIcon from "../assets/gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import NotiIconActive from "../assets/notiIconActive.svg";
import TeamblIcon from "../assets/teamblIcon.svg";
import CloseIcon from "../assets/closeIcon.svg";
import FriendCard from '../components/FriendCard';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  const goToProjects = () => {navigate("/projects")};
  const goToFriends = () => {navigate("/friends")};
  const goToSearch = () => {navigate("/search")};
  const goToInvite = () => {navigate("/invite")};
  const goToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: { prevPage: "home" },
    });
  };
  const goToNotification = () => {navigate("/notification")};
  const goToSetting = () => {navigate("/setting")};
  
  const [activeNav, setActiveNav] = useState('홈');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetFriends, setBottomSheetFriends] = useState([]);

  const [firstDegreeCount, setFirstDegreeCount] = useState(0);
  const [secondDegreeCount, setSecondDegreeCount] = useState(0);
  const [secondDegreeConnections, setSecondDegreeConnections] = useState([]);
  const [secondDegreeDetails, setSecondDegreeDetails] = useState([]);
  const [keywordFriends, setKeywordFriends] = useState([]);

  // 1촌 및 2촌 수를 가져오는 함수
  const fetchFriendCounts = async () => {
    try {
      const response = await api.get("/api/current-user/");
      console.log("API Response:", response.data);
      setFirstDegreeCount(response.data.first_degree_count);
      setSecondDegreeCount(response.data.second_degree_count);
      setSecondDegreeConnections(response.data.second_degree_connections);
      
      // secondDegreeConnections이 설정된 후에 바로 fetchSecondDegreeDetails 호출
      if (response.data.second_degree_connections.length > 0) {
          await fetchSecondDegreeDetails(response.data.second_degree_connections);
      }
    } catch (error) {
      console.error("Failed to fetch friend counts", error);
    }
  };
    
  const fetchSecondDegreeDetails = async (connections) => {
      try {
          console.log("fetchSecondDegreeDetails called");
          console.log("secondDegreeConnections:", connections);
  
          if (connections.length === 0) {
              console.log("No second-degree connections found.");
              return;
          }
  
          const secondDegreeDetails = await Promise.all(
              connections.map(async (connection, index) => {
                  try {
                      const secondDegreeId = connection[0]; // 2촌 ID
                      const firstDegreeId = connection[1];  // 1촌 ID
  
                      console.log(`Fetching profile for second degree ID: ${secondDegreeId}`);
                      const userResponse = await api.get(`/api/profile/${secondDegreeId}/`);
                      const userData = userResponse.data;
  
                      console.log(`Fetching profile for first degree ID: ${firstDegreeId}`);
                      const firstDegreeResponse = await api.get(`/api/profile/${firstDegreeId}/`);
                      const firstDegreeName = firstDegreeResponse.data.user_name;
  
                      return {
                          ...userData,
                          friendOf: firstDegreeName  // 1촌의 이름을 포함
                      };
                  } catch (innerError) {
                      console.error(`Failed to fetch data for connection index ${index}:`, innerError);
                      return null;
                  }
              })
          );
  
          const validDetails = secondDegreeDetails.filter(detail => detail !== null);
          setSecondDegreeDetails(validDetails);
      } catch (error) {
          console.error("Failed to fetch second degree details", error);
      }
  };

  // 키워드와 연관된 사용자들을 가져오는 함수
  const fetchKeywordFriends = async () => {
      try {
          const response = await api.get("/api/user-similarity/");
          console.log("Keyword Friends Response:", response.data);
  
          // 각 사용자에 대해 프로필 정보를 추가로 가져오기
          const processedKeywordFriends = await Promise.all(
              response.data.map(async (friendData) => {
                  try {
                      const profileResponse = await api.get(`/api/profile/${friendData.user.id}/`);
                      const userData = profileResponse.data;
  
                      return {
                          ...userData, // userData의 모든 필드를 포함
                          sametag: friendData.common_keywords[0] || '', // 공통 키워드 중 첫 번째를 sametag로 사용 (추후 수정 필요)
                          similarity: friendData.similarity, // 유사도
                      };
                  } catch (error) {
                      console.error(`Failed to fetch profile for user ID ${friendData.user.id}`, error);
                      return null; // 프로필 정보를 가져오는 데 실패한 경우
                  }
              })
          );
  
          // 유효한 프로필 정보만 상태에 저장
          const validKeywordFriends = processedKeywordFriends.filter(friend => friend !== null);
          setKeywordFriends(validKeywordFriends);
      } catch (error) {
          console.error("Failed to fetch keyword friends", error);
      }
  };
  
  useEffect(() => {
    const fetchData = async () => {
        await fetchFriendCounts();
        await fetchKeywordFriends();
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
    if (item === '1촌') {
      goToFriends();
    } else if (item === '초대') {
      goToInvite();
    } else if (item === '설정') {
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
          <span className="home-view-all" onClick={() => openBottomSheet(secondDegreeDetails)}>모두 보기</span>
        </div>
        <div className="home-sub-header">
          <span className='home-sub-header-text'>2촌이 </span>
          <span className='home-sub-header-num'>{secondDegreeCount}명 </span>
          <span className='home-sub-header-text'>증가했어요!</span>
        </div>
        <div className="home-friends-list">
          {secondDegreeDetails.map(friend => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </section>

      <section className="home-keyword-recommendation">
        <div className="home-section-header">
          <h2>내 키워드와 연관된</h2>
          <span className="home-view-all" onClick={() => openBottomSheet(keywordFriends)}>모두 보기</span>
        </div>
        <div className="home-sub-header">
          <span className='home-sub-header-text'>가입자가 </span>
          <span className='home-sub-header-num'>{keywordFriends.length}명 </span>
          <span className='home-sub-header-text'>증가했어요!</span>
        </div>
        <div className="home-friends-list">
          {keywordFriends.map(friend => (
            <FriendCard key={friend.id} friend={friend} isKeywordFriend />
          ))}
        </div>
      </section>

      {isBottomSheetOpen && (
        <div className="home-bottom-sheet-overlay" onClick={closeBottomSheet}>
          <div className="home-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <img src={CloseIcon} alt="닫기" className="home-close-icon" onClick={closeBottomSheet}/>
            <h3>알아두면 좋은 친구</h3>
            <div className="home-bottom-sheet-content">
              {bottomSheetFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} isKeywordFriend={!!friend.sametag} />
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
