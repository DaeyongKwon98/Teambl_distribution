import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
//규원's 뉴 홈페이지
import GoSearchIcon from "../assets/gosearchIcon.svg";
import NotiIcon from "../assets/notiIcon.svg";
import TeamblIcon from "../assets/teamblIcon.svg";
import CloseIcon from "../assets/closeIcon.svg";
import FriendCard from '../components/FriendCard';
//규원's 뉴 홈페이지

function Home() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const userId = localStorage.getItem("userId");
  console.log("Fetched userId:", userId);
  
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
  
  const goToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: {
        prevPage: "home",
      },
    });
  };

  const goToNotification = () => {
    navigate("/notification");
  };

  const goToSetting = () => {
    navigate("/setting");
  }
  
  // const handleChangePassword = async () => {
  //   try {
  //     const response = await api.patch("/api/change-password/", {
  //       new_password: newPassword,
  //     });
  //     setNewPassword(""); // 비밀번호 변경 후 입력 필드 초기화

  //     // 로그아웃 처리
  //     localStorage.removeItem("token"); // 토큰 제거
  //     alert("Password changed successfully. You will be logged out.");
  //     navigate("/login"); // 로그인 페이지로 이동
  //   } catch (error) {
  //     console.error("Password change failed:", error);
  //     alert("Password change failed");
  //   }
  // };

  // const handleDeleteAccount = async () => {
  //   if (
  //     window.confirm(
  //       "Are you sure you want to delete your account? This action cannot be undone."
  //     )
  //   ) {
  //     try {
  //       const response = await api.delete("/api/delete-user/");
  //       if (response && response.data && response.data.detail) {
  //         alert(response.data.detail);
  //       } else {
  //         alert("Account deleted successfully.");
  //       }
  //       navigate("/login"); // 계정 삭제 후 로그인 페이지로 이동
  //     } catch (error) {
  //       console.error("Account deletion failed:", error);
  //       alert("Account deletion failed");
  //     }
  //   }
  // };


//규원's 뉴 홈페이지
  const [activeNav, setActiveNav] = useState('홈');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetFriends, setBottomSheetFriends] = useState([]);

  const friendOfFriends = [
    { id: 1, user_name: '최지수', school: 'KAIST', current_academic_degree: '석사', year: '23학번', major: '산업디자인학과', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
    { id: 2, user_name: '김종현', school: 'KAIST', current_academic_degree: '학사', year: '19학번', major: '기계공학과', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
    { id: 3, user_name: '권대용', school: 'KAIST', current_academic_degree: '석사', year: '20학번', major: '전산학부', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
    { id: 4, user_name: '성대규', school: 'KAIST', current_academic_degree: '학사', year: '21학번', major: '전기및전자공학부', friendOf: '이규원', profilePic: 'https://via.placeholder.com/70' },
  ];

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
  //규원's 뉴 홈페이지

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
          <img src={'https://via.placeholder.com/50'} alt={`내 프로필`} className="home-profile-icon" onClick={goToProfile}/>
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
          <span className="home-view-all" onClick={() => openBottomSheet(friendOfFriends)}>모두 보기</span>
        </div>
        <div className="home-sub-header">
          <span className='home-sub-header-text'>2촌이 </span>
          <span className='home-sub-header-num'>{friendOfFriends.length}명 </span>
          <span className='home-sub-header-text'>증가했어요!</span>
        </div>
        <div className="home-friends-list">
          {friendOfFriends.map(friend => (
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
      {/* <div className="password-change-container">
        <h2>Change Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleChangePassword}>Change Password</button>
      </div>
      <div className="account-delete-container">
        <h2>Delete Account</h2>
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div> */}
  );
}

export default Home;
