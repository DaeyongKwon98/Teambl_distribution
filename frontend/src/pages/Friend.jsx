import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Friend.css";
import api from "../api";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import FriendItem from "../components/FriendItem";

function Friend() {
  /*
  TODO: 1촌을 삭제하는 기능도 넣어야할 것 같음!

  const deleteFriend = (id) => {
    api
      .delete(`/api/friends/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) alert("친구 삭제 완료");
        else alert("Failed to delete Friend.");
        getFriends();
      })
      .catch((error) => alert(error));
  };
  */

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("myChons");
  const [myAcceptedChons, setMyAcceptedChons] = useState([]); // 나의 1촌
  const [myChonsRequests, setMyChonsRequests] = useState([]); // 1촌 추가
  const [requestsToMe, setRequestsToMe] = useState([]); // 내게 신청한
  const [inputEmail, setInputEmail] = useState("");
  const [activeNav, setActiveNav] = useState("1촌");

  const navigate = useNavigate();

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
            friend.status !== "accepted" &&
            friend.from_user.id === currentUser.id
        );
        setMyChonsRequests(myChonsRequests);

        // 1촌 중 to_user가 current_user인 경우
        const requestsToMe = data.filter(
          (friend) =>
            friend.status !== "accepted" && friend.to_user.id === currentUser.id
        );
        setRequestsToMe(requestsToMe);
      })
      .catch((err) => alert(err));
  };

  const handleInputEmailChange = (e) => {
    setInputEmail(e.target.value);
  };

  // 1촌을 추가하는 함수
  const addFriend = (e) => {
    e.preventDefault();
    api
      .post("/api/friends/", {
        to_user_email: inputEmail,
      })
      .then((res) => {
        if (res.status === 201) alert("친구 추가 완료!");
        else alert("친구 추가 실패");
        getChons();
        setInputEmail("");
      })
      .catch((error) => {
        console.log(error.response);
        console.log(error.message);
        if (error.response) {
          alert(`친구 추가 실패: ${error.response.data}`);
        } else {
          alert(`친구 추가 실패: ${error.message}`);
        }
      });
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
        navigate("/");
        break;
      default:
        break;
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

  return (
    <div className="friend-container">
      <Header />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      <div className="friend-tabs">
        <div
          className={`friend-tab ${activeTab === "myChons" ? "active" : ""}`}
          onClick={() => setActiveTab("myChons")}
        >
          나의 1촌
        </div>
        <div
          className={`friend-tab ${activeTab === "addChons" ? "active" : ""}`}
          onClick={() => setActiveTab("addChons")}
        >
          1촌 추가
        </div>
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
          <p className="friend-total-count">{myAcceptedChons.length}명</p>
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

      {activeTab === "addChons" && (
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
      )}

      {activeTab === "requestsToMe" && (
        <div className="friend-requestsToMe-content">
          <div className="friend-instructions">
            신청 수락은 신뢰를 바탕으로 신중히 결정해 주세요
            <br />
            믿을 수 있는 팀을 커뮤니티, 함께 만들어 가요!
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
  );
}

export default Friend;
