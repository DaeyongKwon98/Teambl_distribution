import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSelf from "./ProfileSelf";
import ProfileOther from "./ProfileOther";
import api from "../../api";
import ProfileSelf2 from './ProfileSelf2';

const ProfileRouter = () => {
  const { id } = useParams(); // URL에서 {id}를 가져옴
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileSelf, setIsProfileSelf] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/current-user/");
      setCurrentUser(response.data);
      setIsProfileSelf(id === String(response.data.id));
      console.log("ProfileRouter.jsx", (id === String(response.data.id)));
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  return (
    <div>{isProfileSelf ? <ProfileSelf2 /> : <ProfileOther userId={id} />}</div>
  );
};

export default ProfileRouter;
