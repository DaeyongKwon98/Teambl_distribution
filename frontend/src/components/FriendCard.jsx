import React from 'react';
import BefriIcon from "../assets/befriIcon.svg";

const FriendCard = ({ friend, isKeywordFriend = false }) => {
  return (
    <div className="home-friend-card">
      <div className='home-same-and-befri'>
        <div className={isKeywordFriend ? "home-same-tag" : "home-friend-of"}>
          <span>{isKeywordFriend ? `#${friend.sametag}` : `${friend.friendOf}의 1촌`}</span>
        </div>
        <img src={BefriIcon} alt="1촌신청" className="home-befri-icon" />
      </div>
      <img src={friend.profilePic} alt={`${friend.user_name} 프로필`} className="home-profile-pic" />
      <div className="home-friend-info">
        <p>{friend.user_name}</p>
        <p>{friend.school} {friend.current_academic_degree} {friend.year}</p>
        <p>{friend.major}</p>
      </div>
    </div>
  );
};

export default FriendCard;
