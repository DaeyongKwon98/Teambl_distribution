import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Friend.css";
import api from "../api";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import FriendItem from "../components/FriendItem";

function Friend() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "myChons"
  );
  const [myAcceptedChons, setMyAcceptedChons] = useState([]); // 나의 1촌
  const [myChonsRequests, setMyChonsRequests] = useState([]); // 1촌 추가
  const [requestsToMe, setRequestsToMe] = useState([]); // 내게 신청한
  const [inputEmail, setInputEmail] = useState("");
  const [activeNav, setActiveNav] = useState("1촌");

  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(""); // 프로필 이미지
  const userId = localStorage.getItem("userId");

  // 1촌 삭제 함수는 pages/FriendPage/FriendDeletePopup.jsx에 구현

  // 현재 로그인 유저를 가져오는 함수
  const getCurrentUser = () => {
    api
      .get("/api/current-user/")
      .then((res) => res.data)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => alert(err));
  };

  // 유저의 1촌 리스트를 가져오는 함수
  const getChons = () => {
    api
      .get("/api/friends/")
      .then((res) => res.data)
      .then((data) => {
        console.log(data);

        // 1촌 중 accept인 경우 나의 1촌
        const myAcceptedChons = data.filter(
          (friend) => friend.status === "accepted"
        );
        setMyAcceptedChons(myAcceptedChons);

        // 1촌 중 from_user가 current_user인 경우
        const myChonsRequests = data.filter(
          (friend) =>
            friend.status === "pending" &&
            friend.from_user.id === currentUser.id
        );
        setMyChonsRequests(myChonsRequests);

        // 1촌 중 to_user가 current_user인 경우
        const requestsToMe = data.filter(
          (friend) =>
            friend.status === "pending" && friend.to_user.id === currentUser.id
        );
        setRequestsToMe(requestsToMe);
      })
      .catch((err) => alert(err));
  };

  const handleInputEmailChange = (e) => {
    setInputEmail(e.target.value);
  };

  // 1촌을 추가하는 함수
  const addFriend = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/friends/", {
        to_user_email: inputEmail,
      });
      console.log(response);

      if (response.status === 201) alert("1촌 신청 완료!");
      getChons();
      setInputEmail("");
    } catch (error) {
      console.log(error);
      if (error.response.data.message) {
        alert(`${error.response.data.message}`);
      } else {
        alert(`${error.response.data.to_user_email}`);
      }
    }
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    switch (item) {
      case "초대":
        navigate("/invite");
        break;
      case "설정":
        navigate("/setting");
        break;
      case "홈":
        navigate("/home");
        break;
      default:
        break;
    }
  };

  // 프로필 이미지 가져오기
  const fetchProfileImage = async () => {
    try {
      const response = await api.get(`/api/profile/${userId}/`);
      setProfileImage(response.data.image); // Assuming the image field is 'image'
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      getChons();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfileImage();
    };
    fetchData();
  }, []);

  return (
    <div className="friend-container">
      <Header profileImage={profileImage} />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      <div className="friend-incontainer">
        <div className="friend-tabs">
          <div
            className={`friend-tab ${activeTab === "myChons" ? "active" : ""}`}
            onClick={() => setActiveTab("myChons")}
          >
            나의 1촌
          </div>
          {/* <div
            className={`friend-tab ${activeTab === "addChons" ? "active" : ""}`}
            onClick={() => setActiveTab("addChons")}
          >
            1촌 추가
          </div> */}
          <div
            className={`friend-tab ${
              activeTab === "requestsToMe" ? "active" : ""
            }`}
            onClick={() => setActiveTab("requestsToMe")}
          >
            내게 신청한
          </div>
        </div>

        {activeTab === "myChons" && (
          <div className="friend-myChons-content">
            <p className="friend-total-count">
              {myAcceptedChons.length + myChonsRequests.length}명
            </p>
            <div className="friend-team-member-results">
              {myChonsRequests.map((chon) => {
                const otherUser =
                  chon.from_user.id === currentUser.id
                    ? chon.to_user
                    : chon.from_user;

                return (
                  <FriendItem
                    activeTab={"addChons"}
                    chon={chon}
                    currentUser={currentUser}
                    getChons={getChons}
                    key={chon.id}
                  ></FriendItem>
                );
              })}
            </div>
            <div className="friend-team-member-results">
              {myAcceptedChons.map((chon) => {
                return (
                  <FriendItem
                    activeTab={"myChons"}
                    chon={chon}
                    currentUser={currentUser}
                    getChons={getChons}
                    key={chon.id}
                  ></FriendItem>
                );
              })}
            </div>
          </div>
        )}

        {/* {activeTab === "addChons" && (
          <div className="friend-addChons-content">
            <div className="friend-addChons-form">
              <input
                type="text"
                placeholder="이메일을 입력하세요."
                className="friend-email-input"
                value={inputEmail}
                onChange={handleInputEmailChange}
              />
              <button
                className={`friend-addChons-btn ${inputEmail ? "active" : ""}`}
                onClick={addFriend}
                disabled={!inputEmail}
              >
                1촌 맺기 요청
              </button>
            </div>
            <p className="friend-total-count">{myChonsRequests.length}명</p>
            <div className="friend-team-member-results">
              {myChonsRequests.map((chon) => {
                const otherUser =
                  chon.from_user.id === currentUser.id
                    ? chon.to_user
                    : chon.from_user;

                return (
                  <FriendItem
                    activeTab={"addChons"}
                    chon={chon}
                    currentUser={currentUser}
                    getChons={getChons}
                    key={chon.id}
                  ></FriendItem>
                );
              })}
            </div>
          </div>
        )} */}

        {activeTab === "requestsToMe" && (
          <div className="friend-requestsToMe-content">
            <div className="friend-instructions">
              신청 수락은 신뢰를 바탕으로 신중히 결정해 주세요
              <br />
              믿을 수 있는 팀블 커뮤니티, 함께 만들어 가요!
            </div>
            <p className="friend-total-count">{requestsToMe.length}명</p>
            <div className="friend-team-member-results">
              {requestsToMe.map((chon) => {
                const otherUser =
                  chon.from_user.id === currentUser.id
                    ? chon.to_user
                    : chon.from_user;

                return (
                  <FriendItem
                    activeTab={"requestsToMe"}
                    chon={chon}
                    currentUser={currentUser}
                    getChons={getChons}
                    key={chon.id}
                  ></FriendItem>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Friend;
