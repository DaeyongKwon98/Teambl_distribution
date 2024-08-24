import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import GoSearchIcon from "../assets/gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import TeamblIcon from "../assets/teamblIcon.svg";
import CloseIcon from "../assets/closeIcon.svg";
import FriendCard from '../components/FriendCard';

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

  // 1촌 및 2촌 수를 가져오는 함수
  const fetchFriendCounts = async () => {
    try {
      const response = await api.get("/api/current-user/");
      setFirstDegreeCount(response.data.first_degree_count);
      setSecondDegreeCount(response.data.second_degree_count);
    } catch (error) {
      console.error("Failed to fetch friend counts", error);
    }
  };

  const fetchSecondDegreeFriends = async () => {
      try {
          const response = await api.get("/api/current-user/");
          const secondDegreeIds = response.data.second_degree_ids;
          console.log('response.data.second_degree_ids', secondDegreeIds);
  
          const secondDegreeConnections = await Promise.all(
              secondDegreeIds.map(async (secondDegreeId) => {
                  const invitationResponse = await api.get(`/api/invitation-links/?invitee_id=${secondDegreeId}`);
                  console.log(`Invitation Response for ID ${secondDegreeId}:`, invitationResponse.data);
  
                  // Filter out entries where invitee_id is null
                  const validInvitations = invitationResponse.data.filter(invitation => invitation.invitee_id !== null);
  
                  if (validInvitations.length > 0) {
                      const connectionDetails = await Promise.all(
                          validInvitations.map(async (invitation) => {
                              if (secondDegreeId === invitation.invitee_id) {
                                  console.warn(`Skipping connection where secondDegreeId and invitee_id are the same: ${secondDegreeId}`);
                                  return null;
                              }  
                            
                              const inviterProfileResponse = await api.get(`/api/profile/${invitation.invitee_id}/`);
                              const inviterName = inviterProfileResponse.data.user_name;
                              return {
                                  secondDegreeId,
                                  firstDegreeId: invitation.invitee_id,
                                  firstDegreeName: inviterName
                              };
                          })
                      );
                      return connectionDetails;
                  } else {
                      return [{
                          secondDegreeId,
                          firstDegreeId: null,
                          firstDegreeName: 'Unknown'
                      }];
                  }
              })
          );
          // Flatten the array since Promise.all will return an array of arrays
          const flattenedConnections = secondDegreeConnections.flat();
          console.log('Second Degree Connections:', flattenedConnections);
          setSecondDegreeConnections(flattenedConnections);  // 상태 업데이트
          return flattenedConnections;  // 결과 반환
      } catch (error) {
          console.error("Failed to fetch second degree friends", error);
          return [];
      }
  };
  
  const fetchSecondDegreeDetails = async (connections) => {
      try {
          const response = await api.get("/api/current-user/");
          const secondDegreeIds = response.data.second_degree_ids;
  
          const secondDegreeDetails = await Promise.all(
              secondDegreeIds.map(async (id) => {
                  const userResponse = await api.get(`/api/profile/${id}/`);
                  const userData = userResponse.data;
                  return {
                      ...userData,
                      id: id  // id 필드를 명시적으로 추가
                  };
              })
          );
  
          // Safeguard against null or undefined connections
          const detailedSecondDegreeFriends = secondDegreeDetails.map(friend => {
              const connection = connections.find(conn => conn?.secondDegreeId === friend.id);
  
              if (connection) {
                  return {
                      ...friend,
                      friendOf: connection.firstDegreeName || 'Unknown'  // Use the name if available, otherwise 'Unknown'
                  };
              } else {
                  return {
                      ...friend,
                      friendOf: 'Unknown'
                  };
              }
          });
  
          setSecondDegreeDetails(detailedSecondDegreeFriends);
      } catch (error) {
          console.error("Failed to fetch second degree details", error);
      }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchFriendCounts();
      const connections = await fetchSecondDegreeFriends();  // 결과를 받아옴
      await fetchSecondDegreeDetails(connections);  // connections을 전달
    };
    fetchData();
  }, []);
  
  // const friendOfFriends = [
  //   { id: 1, user_name: '최지수', school: 'KAIST', current_academic_degree: '석사', year: '23학번', major: '산업디자인학과', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
  //   { id: 2, user_name: '김종현', school: 'KAIST', current_academic_degree: '학사', year: '19학번', major: '기계공학과', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
  //   { id: 3, user_name: '권대용', school: 'KAIST', current_academic_degree: '석사', year: '20학번', major: '전산학부', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
  //   { id: 4, user_name: '성대규', school: 'KAIST', current_academic_degree: '학사', year: '21학번', major: '전기및전자공학부', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
  // ];

  const keywordFriends = [
    { id: 1, user_name: '최미나', school: 'KAIST', current_academic_degree: '학사', year: '22학번', major: '산업디자인학과', sametag: '축구', profilePic: 'https://via.placeholder.com/70' },
    { id: 2, user_name: '강승현', school: 'KAIST', current_academic_degree: '석사', year: '24학번', major: '산업시스템공학과', sametag: '파이썬', profilePic: 'https://via.placeholder.com/70' },
  ];

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

      <nav className="home-navbar">
        {['홈', '1촌', '초대', '설정'].map((item) => (
          <span
            key={item}
            className={`home-nav-item ${activeNav === item ? 'home-active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            {item}
          </span>
        ))}
      </nav>

      <section className="home-friend-recommendation">
        <div className="home-section-header">
          <h2>이번주 새로운 2촌</h2>
          <span className="home-view-all" onClick={() => openBottomSheet(SecondDegreeDetails)}>모두 보기</span>
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
      <p>1촌 친구 수: {firstDegreeCount}</p>
      <p>2촌 친구 수: {secondDegreeCount}</p>
      <h2>2촌 리스트</h2>
      <ul>
        {secondDegreeConnections.map((connection) => (
          <li key={connection.secondDegreeId}>
            2촌 ID: {connection.secondDegreeId} - 1촌 ID: {connection.firstDegreeId}
          </li>
        ))}
      </ul>
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
