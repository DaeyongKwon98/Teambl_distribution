import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Axios 인스턴스 import
import Profile1 from "../assets/NewSearch/profile1.jpg";
import Profile2 from "../assets/NewSearch/profile2.jpg";
import CheckIcon from "../assets/NewSearch/checkIcon.svg";
import NoCheckIcon from "../assets/NewSearch/nocheckIcon.svg";
import ProfileDefaultImg from "../assets/default_profile_image.svg";
import BluePlusIcon from "../assets/Friend/blue_plus_icon.svg";
import "../styles/NewSearch.css";

// 포함되어야 하는 정보
// 프로필 이미지, 이름, 촌수, 입학년도, 학교, 전공, 키워드들

const NewUserSearchItem = ({ user, onAddRelationShip }) => {
  const [relationshipDegree, setRelationshipDegree] = useState(null);
  const [showFriendAdd, setShowFriendAdd] = useState(false);
  const navigate = useNavigate();
  
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
    getRelationshipDegree(user.id);
  }, [user.id]);

  const handleProfileClick = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleAddButtonClick = (e) => {
    e.stopPropagation(); // 클릭 이벤트가 부모 div로 전파되는 것을 방지
    if (relationshipDegree === 1) {
      return;
    }
    // navigate("/friends", { state: { activeTab: 'addChons' } });
    setShowFriendAdd(true); // 친구 추가 팝업 열기
  };
  
  const closeFriendAddModal = () => {
    setShowFriendAdd(false); // 팝업창 닫기
  };

  const handleAddFriend = async () => {
    try {
      // 서버에 친구의 이메일을 전송 (to_user_email)
      const response = await api.post('/api/friends/', {
        to_user_email: user.email,  // to_user_email 필드를 사용하여 친구의 이메일 전송
      });
  
      // 요청이 실패한 경우 알림을 띄움
      if (response.status !== 201) {
        alert(`친구 추가 요청이 실패했습니다. 다시 시도해주세요.`);
      }
  
      // 팝업을 닫음
      closeFriendAddModal();
  
    } catch (error) {
      // 요청이 실패한 경우 에러 메시지 처리
      if (error.response && error.response.data) {
        console.error("Error response:", error.response.data);
        alert(`친구 추가 오류: ${error.response.data.detail || '다시 시도해주세요.'}`);
      } else {
        alert(`친구 추가에 실패했습니다. 네트워크 상태를 확인해주세요.`);
      }
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div>
      <div className="newSearch-team-member" onClick={handleProfileClick}>
        <img
          src={user.image ? user.image : ProfileDefaultImg}
          alt={user.profile.user_name}
          className="newSearch-profile-image"
        />
        <div className="newSearch-member-info">
          <p className="newSearch-member-name-relation">
            <strong className="newSearch-member-name">
              {user.profile.user_name}
            </strong>
            <span className="newSearch-member-relation">
              {" "}
              · {relationshipDegree}촌
            </span>
          </p>
          <p className="newSearch-member-details">
            {user.profile.school} | {user.profile.current_academic_degree} |{" "}
            {user.profile.year % 100}학번
          </p>
          <p className="newSearch-member-details">
            {user.profile.major1}
            {user.profile.major2 && ` • ${user.profile.major2}`}
          </p>
          <p className="newSearch-member-keywords">
            {user.profile.keywords.join(" / ")}
          </p>
        </div>
        {/* <button
          className={`newSearch-add-button ${
            relationshipDegree === 1 ? "checked" : ""
          }`}
          onClick={handleAddButtonClick}
          disabled={relationshipDegree === 1}
        >
          {relationshipDegree === 1 ? (
            <img src={CheckIcon} alt="이미1촌" className="newSearch-check-icon" />
          ) : (
            <img
              src={NoCheckIcon}
              alt="1촌신청"
              className="newSearch-check-icon"
            />
          )}
        </button> */}
      </div>
  
      {showFriendAdd && (
        <div className="newsearch-addfriend-modal-overlay">
          <div className="newsearch-addfriend-add-modal-content">
            <div className="newsearch-addfriend-modal-title">
              <img
                src={BluePlusIcon}
                alt="친구 추가 아이콘"
                className="newsearch-addfriend-add-icon"
              />
              <p>1촌 신청</p>
            </div>
            <p className="newsearch-addfriend-modal-description">
              {user.profile.user_name}님에게 1촌을 신청하시겠습니까?
              <br />
              1촌 신청은 신뢰를 바탕으로 신중히 결정해 주세요.
            </p>
            <div className="newsearch-addfriend-modal-buttons">
              <button
                className="newsearch-addfriend-modal-button newsearch-addfriend-cancel-button"
                onClick={closeFriendAddModal}
              >
                취소
              </button>
              <button
                className="newsearch-addfriend-modal-button newsearch-addfriend-confirm-button"
                onClick={handleAddFriend} // 친구 추가 함수 호출
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
};

export default NewUserSearchItem;
