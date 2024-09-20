import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import profileDefaultImg from "../../assets/ProfileOther/defaultProfile.svg";
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import friendIcon from "../../assets/ProfileOther/friend.svg";
import "../../styles/ProfilePage/ProfileOther.css";
import api from "../../api";
import FriendRequestPopup from "../FriendPage/FriendRequestPopup";

const ProfileOther = ({ userId }) => {
  const [profile, setProfile] = useState({
    user_name: "",
    school: "",
    current_academic_degree: "",
    year: 0,
    major1: "",
    major2: "",
    one_degree_count: 0,
    introduction: "",
    image: profileDefaultImg,
    keywords: [],
    tools: [],
    experiences: [],
    portfolio_links: [],
  });
  const [paths, setPaths] = useState([]); // 여러 경로 상태 추가
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 오류 상태 추가
  const [currentUserId, setCurrentUserId] = useState("");
  const [showFinalDelete, setShowFinalDelete] = useState(false); // 최종 확인 팝업 상태 추가
  const [isFriendRequestPending, setIsFriendRequestPending] = useState(false); // 현재 일촌 신청 대기 여부
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const [relationshipDegree, setRelationshipDegree] = useState(null);

  const closeFriendDeleteModal = () => {
    setShowFinalDelete(false);
  };

  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    try {
      const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
      const degree = response.data.distance;
      setRelationshipDegree(degree);
    } catch (error) {
      console.error("Error fetching relationship degree:", error);
      return null;
    }
  };

  useEffect(() => {
    getRelationshipDegree(userId);
    fetchProfile(userId);
    fetchUserPaths(userId);
  }, [userId]);

  /* 해당 사용자의 정보를 가져오는 함수 */
  /* 정보 수신이 완료되면, 일촌 신청 대기 여부를 확인(일촌 리스트 수신) */
  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/api/user/${userId}/`);
      setProfile(response.data.profile);
      setError(null); // 오류 상태 초기화
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("존재하지 않는 사용자입니다."); // 404 오류 메시지 설정
      } else {
        setError("사용자 정보를 불러오지 못했습니다.");
      }
    }
    
    /* 현재 일촌 신청 대기 여부 확인 */
    api
    .get("/api/friends/")
    .then((res) => res.data)
    .then(async (data) => {
      let friendList = data['results'];
      let isPending = false;
      for (let i=0 ; i<friendList.length ; i++) {
        if (friendList[i]["to_user"]["id"] == userId) { // str & integer comparision
          isPending = friendList[i]["status"] === "pending";
        }
      }
      await setIsFriendRequestPending(isPending);
    })
    .catch((err) => {
      alert(err);
    })
    .finally(async () => {
      await setLoading(false);
    });
  };

  // 1촌을 추가하는 함수 (userId를 사용)
  const addFriend = async (e) => {
    e.preventDefault();
    try {
      const userResponse = await api.get(`/api/profile/${currentUserId}/`);
      const oneDegreeCount = userResponse.data.one_degree_count;

      if (oneDegreeCount >= 50) {
        alert("1촌 수가 50명을 초과하여 더 이상 일촌 추가가 불가능합니다.");
        return; // 친구 추가 중단
      }

      const response = await api.post("/api/friends/", {
        to_user_id: userId, // Ensure this is the correct field
      });
      console.log(response);

      if (response.status === 201) {
        alert("1촌 신청 완료!");
        setShowFinalDelete(false); // 팝업 닫기
        fetchProfile(userId); // 정보 갱신
        // getChons(); // 친구 목록 갱신
      }
    } catch (error) {
      console.error(
        "Error in addFriend:",
        error.response ? error.response.data : error.message
      );

      // 서버로부터 받은 에러 메시지를 표시
      if (error.response && error.response.data) {
        alert(
          `${error.response.data.detail || "1촌 신청 중 오류가 발생했습니다."}`
        );
      } else {
        alert("1촌 신청 중 오류가 발생했습니다.");
      }
    }
  };

  // 모든 경로를 가져오는 함수
  const fetchUserPaths = async (userId) => {
    try {
      const response = await api.get(`/api/path/${userId}/`);
      setCurrentUserId(response.data.current_user_id);
      setPaths(response.data.paths);
      // console.log(response.data.paths);
      // console.log(response.data.paths[0]);
      // console.log(`촌수는: ${response.data.paths[0].length - 1}`);
    } catch (error) {
      console.error("유저 경로를 불러오는 중 오류가 발생했습니다.", error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="profileOther-body">
        <div className="profileOther-container">
          <button
            className="profileOther-backbutton"
            onClick={() => window.history.back()}
          >
            <img src={backIcon} alt="back" />
          </button>
          <div className="profileOther-error">
            <h2>{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profileOther-body">
      <div className="profileOther-container">
        <button
          className="profileOther-backbutton"
          onClick={() => window.history.back()}
        >
          <img src={backIcon}></img>
        </button>

        <div className="profileOther-top">
          <div className="profileOther-profile-image">
            <img
              src={profile.image ? profile.image : profileDefaultImg}
              alt="Profile Image"
            />
          </div>

          <div className="profileOther-profile-detail">
            <div className="profileOther-profile-row1">
              <div className="profileOther-profile-name">
                {profile.user_name}
              </div>
              <div className="profileOther-profile-relationshipDegree">
                ・ {relationshipDegree ? `${relationshipDegree}촌` : "4촌 이상"}
              </div>
              {relationshipDegree === 1 ? (
                <span></span>
              ) : (
                <button
                  className={
                    "profileOther-oneDegree-button" +
                    (isFriendRequestPending ?
                    " to-disabled-button"
                    :
                    "")
                  }
                  onClick={() => {
                    if (!isFriendRequestPending) {
                      setShowFinalDelete(true);
                    }
                  }} // 버튼 클릭 시 팝업 열기
                >
                  {
                    isFriendRequestPending ?
                      "수락 대기"
                      :
                      "1촌 신청"
                  }
                </button>
              )}

              {showFinalDelete && (
                <FriendRequestPopup
                  profile={profile}
                  closeFriendDeleteModal={closeFriendDeleteModal}
                  addFriend={addFriend}
                />
              )}
            </div>

            <div className="profileOther-profile-row2">
              {profile.school} | {profile.current_academic_degree} |{" "}
              {profile.year % 100} 학번
            </div>
            <div className="profileOther-profile-row3">
              {profile.major1}
              {profile.major2 &&
                profile.major2.trim() !== "" &&
                ` ・ ${profile.major2}`}
            </div>
            <div className="profileOther-profile-row4">
              <div
                className="profileOther-profile-one_degree_count"
                onClick={() => {
                  if (profile.one_degree_count > 0) {
                    navigate(`/profile/${userId}/friends`);
                  }
                }}
              >
                <div>1촌 {profile.one_degree_count}명</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profileOther-title-path">나와의 관계</div>
        <div className="profileOther-path">
          {paths.length === 0 ? (
            <div className="profileOther-path-container">
              <div className="profileOther-path-title">
                <span className="profileOther-path-title-number">3명 이상</span>
                <span className="profileOther-path-title-text">
                  을 거쳐야 하므로 관계도를 표시하지 않습니다.
                </span>
              </div>
            </div>
          ) : paths[0].length - 1 === 1 ? (
            <div className="profileOther-path-container">
              <div className="profileOther-path-title">
                <span className="profileOther-path-title-name">
                  {paths[0][0]}
                </span>
                <span className="profileOther-path-title-text">님과 </span>
                <span className="profileOther-path-title-name">
                  {paths[0][paths[0].length - 1]}
                </span>
                <span className="profileOther-path-title-text">님은 </span>
                <span className="profileOther-path-title-number">1촌</span>
                <span className="profileOther-path-title-text">입니다.</span>
              </div>
            </div>
          ) : (
            <div className="profileOther-path-container">
              <div className="profileOther-path-title">
                <span className="profileOther-path-title-name">
                  {paths[0][0]}
                </span>
                <span className="profileOther-path-title-text">님과 </span>
                <span className="profileOther-path-title-name">
                  {paths[0][paths[0].length - 1]}
                </span>
                <span className="profileOther-path-title-text">님은 </span>
                <span className="profileOther-path-title-number">
                  {paths[0].length - 2}명
                </span>
                <span className="profileOther-path-title-text">
                  을 거치면 아는 사이입니다.
                </span>
              </div>
              <div className="profileOther-path-content">
                <div className="profileOther-path-name-end">{paths[0][0]}</div>
                <div className="profileOther-scroll-container" ref={scrollRef}>
                  {paths.map((path, index) => (
                    <div key={index} className="profileOther-scroll-item">
                      {path.slice(1, -1).join(" → ")}
                    </div>
                  ))}
                </div>
                <div className="profileOther-path-name-end">
                  {paths[0][paths[0].length - 1]}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profileOther-keyword-title">키워드</div>
        <div className="profileOther-keywords">
          {profile.keywords.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 키워드를 아직 입력하지 않았어요.
            </div>
          ) : (
            profile.keywords.map((keyword, index) => (
              <div className="profileOther-keyword" key={index}>
                {keyword}
              </div>
            ))
          )}
        </div>

        <div className="profileOther-flexbox">
          <div className="profileOther-experiences-title">경험</div>

          <div className="profileOther-experiences">
            {profile.experiences.length === 0 ? (
              <div className="profileOther-row">
                <div className="profileOther-gray-separator"></div>
                <div className="profileOther-list-element">
                  상대방이 경험을 아직 입력하지 않았어요.
                </div>
              </div>
            ) : (
              profile.experiences.map((experience, index) => (
                <div className="profileOther-row" key={index}>
                  <div className="profileOther-gray-separator"></div>
                  <div className="profileOther-list-element" key={index}>
                    {experience.experience}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profileOther-flexbox">
          <div className="profileOther-tools-title">툴</div>

          <div className="profileOther-tools">
            {profile.tools.length === 0 ? (
              <div className="profileOther-row">
                <div className="profileOther-gray-separator"></div>
                <div className="profileOther-list-element">
                  상대방이 툴을 아직 입력하지 않았어요.
                </div>
              </div>
            ) : (
              profile.tools.map((tool, index) => (
                <div className="profileOther-row" key={index}>
                  <div className="profileOther-gray-separator"></div>
                  <div className="profileOther-list-element" key={index}>
                    {tool.tool}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profileOther-introduction-title">소개</div>
        <div className="profileOther-introduction">
          {profile.introduction.length === 0 ? (
            <div className="profileOther-introduction-body">
              상대방이 소개를 아직 입력하지 않았어요.
            </div>
          ) : (
            <div className="profileOther-introduction-body">
              {profile.introduction}
            </div>
          )}
        </div>

        <div className="profileOther-portfolioLinks-title">포트폴리오</div>
        <div className="profileOther-protfolioLinks">
          {profile.portfolio_links.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 포트폴리오를 아직 입력하지 않았어요.
            </div>
          ) : (
            profile.portfolio_links.map((portfolio_links, index) => (
              <div className="profileOther-list-element" key={index}>
                {portfolio_links.portfolioLink}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOther;
