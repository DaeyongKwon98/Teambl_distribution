import React from 'react';
import BefriIcon from "../assets/befriIcon.svg";

const FriendCard = ({ friend, isKeywordFriend = false }) => {
  console.log("friend", friend);
  
  // 공통 1촌 정보를 표시하는 함수
  const renderFriendOf = () => {
    if (friend.numFriends === 1) {
      return (
          {friend.friendOf}의 1촌
      );
    } else if (friend.numFriends > 1) {
      return (
          {friend.friendOf} 외 공통 1촌 {friend.numFriends-1}명
      );
    }
  };

  // 공통 키워드를 표시하는 함수
  const renderSametags = () => {
    return friend.sametag.map((tag, index) => (
      <div key={index} className="home-same-tag">
        {tag}
      </div>
    ));
  };
  
  return (
    <div className="home-friend-card">
      <div className='home-same-and-befri'>
        <div className={isKeywordFriend ? "home-same-tags-container" : "home-friend-of"}>
          {isKeywordFriend ? renderSametags() : renderFriendOf()}
        </div>
        {/* <img src={BefriIcon} alt="1촌신청" className="home-befri-icon" /> */}
      </div>
      <img src={friend.image} alt={`${friend.user_name} 프로필`} className="home-profile-pic" />
      <div className="home-friend-info">
        <p>{friend.user_name}</p>
        <p>{friend.school} {friend.current_academic_degree} {friend.year}</p>
        <p>{friend.major}</p>
      </div>
    </div>
  );
};

export default FriendCard;
