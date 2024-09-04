import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Friend.css";
import api from "../api";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProfileDefaultImg from "../assets/default_profile_image.svg"; 

function Friend() {
  /*
  const [friendList, setFriendList] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    getCurrentUser();
    getFriends();
  }, []);

  const getCurrentUser = () => {
    api
      .get("/api/current-user/")
      .then((res) => res.data)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => alert(err));
  };

  const getFriends = () => {
    api
      .get("/api/friends/")
      .then((res) => res.data)
      .then((data) => {
        setFriendList(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  // const goToInvitePage = () => {
  //   navigate("/invite");
  // };

  const addFriend = (e) => {
    e.preventDefault();
    api
      .post("/api/friends/", {
        to_user_email: friendEmail,
      })
      .then((res) => {
        if (res.status === 201) alert("친구 추가 완료!");
        else alert("친구 추가 실패");
        getFriends();
        setFriendEmail("");
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

  const updateFriendStatus = (id, status) => {
    api
      .patch(`/api/friends/update/${id}/`, { status })
      .then((response) => {
        alert("친구 업데이트 완료");
        getFriends();
      })
      .catch((error) => {
        console.error("There was an error updating the friend status!", error);
      });
  };

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
  const [activeTab, setActiveTab] = useState("myChons");
  const [myChonsRequests, setMyChonsRequests] = useState([]);
  const [myAcceptedChons, setMyAcceptedChons] = useState([]);
  const [requestsToMe, setRequestsToMe] = useState([]);
  const [email, setEmail] = useState("");
  const [activeNav, setActiveNav] = useState("1촌");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleNavClick = (item) => {
    setActiveNav(item);
    switch (item) {
      case '초대':
        navigate("/invite");
        break;
      case '설정':
        navigate("/setting");
        break;
      case '홈':
        navigate("/");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchMyChonsRequests = [
      {
        id: 1,
        image: null,
        profile: {
          user_name: "박지성",
          school: "카이스트",
          current_academic_degree: "학사",
          year: 2021,
          major1: "산업디자인",
          major2: "산업공학",
          keywords: ["창의력", "협업", "데이터분석", "운동", "프랑스어ㄴㅇㄹㄴㅇㄹ"],
        },
        relationshipDegree: 2,
      }
    ];

    const fetchMyAcceptedChons = [
      {
        id: 1,
        image: null,
        profile: {
          user_name: "최성희",
          school: "카이스트",
          current_academic_degree: "석사",
          year: 2022,
          major1: "산업디자인",
          keywords: ["창의력", "협업"],
        },
        relationshipDegree: 1,
      },
      {
        id: 2,
        image: null,
        profile: {
          user_name: "최성희",
          school: "카이스트",
          current_academic_degree: "석사",
          year: 2022,
          major1: "산업디자인",
          keywords: ["창의력", "협업", "데이터분석", "운동", "프랑스어ㄴㅇㄹㄴㅇㄹ"],
        },
        relationshipDegree: 1,
      }
    ];

    const fetchRequestsToMe = [
      {
        id: 1,
        image: null,
        profile: {
          user_name: "최대기",
          school: "카이스트",
          current_academic_degree: "박사",
          year: 2023,
          major1: "산업디자인",
          major2: "산업공학",
          keywords: ["창의력", "협업", "데이터분석", "운동", "프랑스어ㄴㅇㄹㄴㅇㄹ"],
        },
        relationshipDegree: 2,
      },
      {
        id: 2,
        image: null,
        profile: {
          user_name: "최대기",
          school: "카이스트",
          current_academic_degree: "박사",
          year: 2023,
          major1: "산업디자인",
          major2: "산업공학",
          keywords: ["관리", "리더십"],
        },
        relationshipDegree: 2,
      },
      {
        id: 3,
        image: null,
        profile: {
          user_name: "최대기",
          school: "카이스트",
          current_academic_degree: "박사",
          year: 2023,
          major1: "산업디자인",
          major2: "산업공학",
          keywords: ["관리", "리더십"],
        },
        relationshipDegree: 2,
      },
    ];

    setMyChonsRequests(fetchMyChonsRequests);
    setMyAcceptedChons(fetchMyAcceptedChons);
    setRequestsToMe(fetchRequestsToMe);
  }, []);

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
          className={`friend-tab ${activeTab === "requestsToMe" ? "active" : ""}`}
          onClick={() => setActiveTab("requestsToMe")}
        >
          내게 신청한
        </div>
      </div>

      {activeTab === "myChons" && (
        <div className="friend-myChons-content">
          <p className="friend-total-count">{myAcceptedChons.length}명</p>
          <div className="friend-team-member-results">
            {myAcceptedChons.map((chon) => (
              <div
                className="friend-team-member"
                key={chon.id}
              >
                <img
                  src={chon.image ? chon.image : ProfileDefaultImg}
                  alt={chon.profile.user_name}
                  className="friend-profile-image"
                />
                <div className="friend-member-info">
                  <p className="friend-member-name-relation">
                    <strong className="friend-member-name">
                      {chon.profile.user_name}
                    </strong>
                  </p>
                  <p className="friend-member-details">
                    {chon.profile.school} | {chon.profile.current_academic_degree}{" "}
                    | {chon.profile.year % 100}학번
                  </p>
                  <p className="friend-member-details">{chon.profile.major1}</p>
                  <p className="friend-member-keywords">
                    {chon.profile.keywords.join(" / ")}
                  </p>
                </div>
              </div>
            ))}
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
              value={email}
              onChange={handleEmailChange}
            />
            <button
              className={`friend-addChons-btn ${email ? "active" : ""}`}
              disabled={!email}
            >
              1촌 맺기 요청
            </button>
          </div>
          <p className="friend-total-count">{myChonsRequests.length}명</p>
          <div className="friend-team-member-results">
            {myChonsRequests.map((chon) => (
              <div
                className="friend-team-member"
                key={chon.id}
              >
                <img
                  src={chon.image ? chon.image : ProfileDefaultImg}
                  alt={chon.profile.user_name}
                  className="friend-profile-image"
                />
                <div className="friend-member-info">
                  <p className="friend-member-name-relation">
                    <strong className="friend-member-name">
                      {chon.profile.user_name}
                    </strong>
                    <span className="friend-member-relation">
                      {" "}
                      · {chon.relationshipDegree}촌
                    </span>
                  </p>
                  <p className="friend-member-details">
                    {chon.profile.school} | {chon.profile.current_academic_degree}{" "}
                    | {chon.profile.year % 100}학번
                  </p>
                  <p className="friend-member-details">
                    {chon.profile.major1}
                    {chon.profile.major2 && ` • ${chon.profile.major2}`}
                  </p>
                  <p className="friend-member-keywords">
                    {chon.profile.keywords.join(" / ")}
                  </p>
                </div>
                <div className="friend-wait-acceptance"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "requestsToMe" && (
        <div className="friend-requestsToMe-content">
          <div className="friend-instructions">
            신청 수락은 신뢰를 바탕으로 신중히 결정해 주세요<br />믿을 수 있는 팀을 커뮤니티, 함께 만들어 가요!
          </div>
          <p className="friend-total-count">{requestsToMe.length}명</p>
          <div className="friend-team-member-results">
            {requestsToMe.map((chon) => (
              <div
                className="friend-team-member"
                key={chon.id}
              >
                <img
                  src={chon.image ? chon.image : ProfileDefaultImg}
                  alt={chon.profile.user_name}
                  className="friend-profile-image"
                />
                <div className="friend-member-info">
                  <p className="friend-member-name-relation">
                    <strong className="friend-member-name">
                      {chon.profile.user_name}
                    </strong>
                    <span className="friend-member-relation">
                      {" "}
                      · {chon.relationshipDegree}촌
                    </span>
                  </p>
                  <p className="friend-member-details">
                    {chon.profile.school} | {chon.profile.current_academic_degree}{" "}
                    | {chon.profile.year % 100}학번
                  </p>
                  <p className="friend-member-details">
                    {chon.profile.major1}
                    {chon.profile.major2 && ` • ${chon.profile.major2}`}
                  </p>
                  <p className="friend-member-keywords">
                    {chon.profile.keywords.join(" / ")}
                  </p>
                </div>
                <div className="friend-action-buttons">
                  <button className="friend-accept-button"></button>
                  <button className="friend-reject-button"></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Friend;
