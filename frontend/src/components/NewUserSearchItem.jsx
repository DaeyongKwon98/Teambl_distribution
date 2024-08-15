import React, { useEffect, useState } from "react";
import api from "../api"; // Axios 인스턴스 import
import Profile1 from "../assets/NewSearch/profile1.jpg";
import Profile2 from "../assets/NewSearch/profile2.jpg";
import CheckIcon from "../assets/NewSearch/checkIcon.svg";
import NoCheckIcon from "../assets/NewSearch/nocheckIcon.svg";

// 포함되어야 하는 정보
// 프로필 이미지, 이름, 촌수, 입학년도, 학교, 전공, 키워드들

const NewUserSearchItem = ({ user, onAddRelationShip }) => {
  const [relationshipDegree, setRelationshipDegree] = useState(null);

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

  return (
    <div className="team-member">
      <img
        src={user.image}
        alt={user.profile.user_name}
        className="profile-image"
      />
      <div className="member-info">
        <p className="member-name-relation">
          <strong className="member-name">{user.profile.user_name}</strong>
          <span className="member-relation"> · {relationshipDegree}촌</span>
        </p>
        <p className="member-details">
          {user.profile.year} | {user.profile.school} | {user.profile.major}
        </p>
        <p className="member-keywords">{user.profile.keywords.join(" / ")}</p>
      </div>
      <button
        className={`add-button ${relationshipDegree === 1 ? "checked" : ""}`}
        disabled={relationshipDegree === 1}
      >
        {relationshipDegree === 1 ? (
          <img src={CheckIcon} alt="이미1촌" className="check-icon" />
        ) : (
          <img src={NoCheckIcon} alt="1촌신청" className="check-icon" />
        )}
      </button>
    </div>
  );
};

export default NewUserSearchItem;
