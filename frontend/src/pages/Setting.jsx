import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Setting.css';
import api from "../api";
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const Setting = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [activeNav, setActiveNav] = useState("설정");

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

  const handleNavClick = (item) => {
    setActiveNav(item);
    switch (item) {
      case '초대':
        navigate("/invite");
        break;
      case '1촌':
        navigate("/friends");
        break;
      case '홈':
        navigate("/");
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="setting-container">
      <Header />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Change Password</button>
    
      <div className="account-delete-container">
        <h2>Delete Account</h2>
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default Setting;
