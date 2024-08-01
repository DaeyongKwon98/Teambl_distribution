import React from "react";

const UserSearchItem = ({ user, onAddRelationShip }) => {
  return (
    <div>
      {user.name} <button onClick={onAddRelationShip}>1촌 추가</button>
    </div>
  );
};

export default UserSearchItem;
