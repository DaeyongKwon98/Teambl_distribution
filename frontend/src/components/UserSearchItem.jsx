import React, { useEffect, useState } from "react";
import api from "../api"; // Axios 인스턴스 import

// 포함되어야 하는 정보
// 프로필 이미지, 이름, 촌수, 입학년도, 학교, 전공, 키워드들

const UserSearchItem = ({ user, onAddRelationShip }) => {
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
    <div className="user-search-item">
      {/* 
      TODO: 이미지는 프로필 페이지 구현 후 추가
      <img
        src={user.profileImage}
        alt={`${user.profile.user_name}'s profile`}
        className="profile-image"
      /> */}
      <div className="user-info">
        <h3>{user.profile.user_name}</h3>
        <p>촌수: {relationshipDegree}촌</p>
        <p>입학년도: {user.profile.year}</p>
        <p>학교: {user.profile.school}</p>
        <p>전공: {user.profile.major}</p>
        <p>키워드: {user.profile.keywords}</p>
      </div>
      {/* {relationshipDegree !== 1 && (
        <button className="add-relationship-button" onClick={onAddRelationShip}>
          1촌 추가
        </button>
      )} */}
    </div>
  );
};

export default UserSearchItem;
