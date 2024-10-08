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
  const [bottomSheetTitle, setBottomSheetTitle] = useState("");
  const [secondDegreeDiff, setSecondDegreeDiff] = useState(0); // 증가한 2촌 수
  const [keywordDiff, setKeywordDiff] = useState(0); // 증가한 같은 키워드 사용자 수
  const [SecondDegreeProfiles, setSecondDegreeProfiles] = useState([]); // 증가한 2촌 프로필
  const [KeywordProfiles, setKeywordProfiles] = useState([]); // 증가한 같은 키워드 사용자 프로필

  const [profileImage, setProfileImage] = useState(""); // 프로필 이미지

  // 프로필 이미지 가져오기
  const fetchProfileImage = async () => {
    try {
      const response = await api.get(`/api/profile/${userId}/`);
      setProfileImage(response.data.image); // Assuming the image field is 'image'
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  };

  // 2촌 프로필 정보 가져오기
  const fetchSecondDegreeProfiles = async () => {
    try {
      // 2촌 사용자 정보를 가져오는 API 호출
      const response = await api.get("/api/second-degree-friends/");

      // API로부터 받은 2촌 사용자 정보 목록
      const connections = response.data || [];

      console.log("connections", connections);

      // 중복된 second_degree_profile_id를 그룹화하여 numFriends 값을 계산
      const groupedConnections = connections.reduce((acc, connection) => {
        const { second_degree_profile_id, connector_friend_id } = connection;
        if (!acc[second_degree_profile_id]) {
          acc[second_degree_profile_id] = {
            second_degree_profile_id,
            connector_friend_ids: [connector_friend_id],
          };
        } else {
          acc[second_degree_profile_id].connector_friend_ids.push(
            connector_friend_id
          );
        }
        return acc;
      }, {});

      // 2촌 사용자 정보를 처리하기 위해 map을 사용
      const secondDegreeDetails = await Promise.all(
        Object.values(groupedConnections).map(async (group) => {
          try {
            const { second_degree_profile_id, connector_friend_ids } = group;

            // 2촌 사용자의 프로필 정보를 가져옴
            const userResponse = await api.get(
              `/api/profile/${second_degree_profile_id}/`
            );
            const userData = userResponse.data;

            // 첫 번째 1촌 사용자의 이름 정보 가져오기
            const firstDegreeNameResponse = await api.get(
              `/api/profile/${connector_friend_ids[0]}/`
            );
            const firstDegreeName = firstDegreeNameResponse.data.user_name;

            console.log("2촌 데이터:", userData);

            // 2촌 사용자의 데이터에 연결된 1촌 사용자의 이름과 친구 수를 추가하여 반환
            return {
              ...userData,
              friendOf: firstDegreeName, // 첫 번째 1촌 친구 이름
              numFriends: connector_friend_ids.length, // 친구 수
              id: second_degree_profile_id,
            };
          } catch (innerError) {
            console.error(
              "Failed to fetch data for second degree profile:",
              innerError
            );
            return null;
          }
        })
      );

      // 유효한 2촌 사용자 정보를 상태에 저장
      const validDetails = secondDegreeDetails.filter(
        (detail) => detail !== null
      );
      setSecondDegreeProfiles(validDetails);
      setSecondDegreeDiff(validDetails.length);
    } catch (error) {
      console.error("Failed to fetch second degree profiles", error);
    }
  };

  // 키워드와 연관된 사용자들을 가져오는 함수
  const fetchKeywordFriendProfiles = async () => {
    try {
      const response = await api.get("/api/user-similarity/");
      console.log("Keyword Friends Response:", response.data);

      const processedKeywordFriends = await Promise.all(
        response.data.map(async (friendData) => {
          try {
            const profileResponse = await api.get(
              `/api/profile/${friendData.user.id}/`
            );
            const userData = profileResponse.data;

            return {
              ...userData,
              sametag: friendData.common_keywords,
              similarity: friendData.similarity,
              id: friendData.user.id,
            };
          } catch (error) {
            console.error(
              `Failed to fetch profile for user ID ${friendData.user.id}`,
              error
            );
            return null;
          }
        })
      );

      const validKeywordFriends = processedKeywordFriends.filter(
        (friend) => friend !== null
      );
      setKeywordProfiles(validKeywordFriends);
      setKeywordDiff(validKeywordFriends.length);
    } catch (error) {
      console.error("Failed to fetch keyword friends", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfileImage();
      await fetchSecondDegreeProfiles();
      await fetchKeywordFriendProfiles();
    };
    fetchData();
  }, []);

  const openBottomSheet = ({ friends, bottomSheetTitle }) => {
    setBottomSheetFriends(friends);
    setBottomSheetTitle(bottomSheetTitle);
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
      <Header profileImage={profileImage} />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      <div className="home-incontainer">
        <section className="home-friend-recommendation">
          <div className="home-section-header">
            <h2>이번주 새로운 2촌</h2>
            <span
              className="home-view-all"
              onClick={() =>
                openBottomSheet({
                  friends: SecondDegreeProfiles,
                  bottomSheetTitle: "이번주 새로운 2촌",
                })
              }
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
            {SecondDegreeProfiles.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </section>

        <section className="home-keyword-recommendation">
          <div className="home-section-header">
            <h2>내 키워드와 연관된</h2>
            <span
              className="home-view-all"
              onClick={() =>
                openBottomSheet({
                  friends: KeywordProfiles,
                  bottomSheetTitle: "내 키워드와 연관된 가입자",
                })
              }
            >
              모두 보기
            </span>
          </div>
          <div className="home-sub-header">
            <span className="home-sub-header-text">가입자가 </span>
            <span className="home-sub-header-num">{keywordDiff}명 </span>
            <span className="home-sub-header-text">증가했어요!</span>
          </div>
          <div className="home-friends-list">
            {KeywordProfiles.map((friend) => (
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
              <h3>{bottomSheetTitle}</h3>
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

        {/* <h1>Home Page</h1>
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
        </button> */}
      </div>
    </div>
  );
}

export default Home;
