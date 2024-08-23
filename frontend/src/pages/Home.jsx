import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const userId = localStorage.getItem("userId");
  
  const goToProjects = () => {
    navigate("/projects");
  };

  const goToFriends = () => {
    navigate("/friends");
  };

  const goToSearch = () => {
    navigate("/search");
  };

  const goToInvite = () => {
    navigate("/invite");
  };
  
  const goToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: {
        prevPage: "home",
      },
    });
  };

  const goToNotification = () => {
    navigate("/notification");
  };

  const handleChangePassword = async () => {
    try {
      const response = await api.patch("/api/change-password/", {
        new_password: newPassword,
      });
      setNewPassword(""); // 비밀번호 변경 후 입력 필드 초기화

      // 로그아웃 처리
      localStorage.removeItem("token"); // 토큰 제거
      alert("Password changed successfully. You will be logged out.");
      navigate("/login"); // 로그인 페이지로 이동
    } catch (error) {
      console.error("Password change failed:", error);
      alert("Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await api.delete("/api/delete-user/");
        if (response && response.data && response.data.detail) {
          alert(response.data.detail);
        } else {
          alert("Account deleted successfully.");
        }
        navigate("/login"); // 계정 삭제 후 로그인 페이지로 이동
      } catch (error) {
        console.error("Account deletion failed:", error);
        alert("Account deletion failed");
      }
    }
  };

  return (
    <div className="home-container">
      <h1>Home Page</h1>
      <button onClick={goToProjects} className="button1">
        프로젝트
      </button>
      <button onClick={goToFriends} className="button2">
        일촌
      </button>
      <button onClick={goToSearch} className="button3">
        탐색
      </button>
      <button onClick={goToInvite} className="button4">
        초대
      </button>
      <button onClick={goToProfile} className="button5">
        내 프로필
      </button>
      <button onClick={goToNotification} className="button6">
        알림
      </button>
      <div className="password-change-container">
        <h2>Change Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleChangePassword}>Change Password</button>
      </div>
      <div className="account-delete-container">
        <h2>Delete Account</h2>
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}

export default Home;
