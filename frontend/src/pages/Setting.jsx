import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import api from "../api";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import WithdrawIcon from "../assets/withdrawIcon.svg";
import ArrowDownIcon from "../assets/arrowDownIcon.svg";

const Setting = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("설정");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [changeBtnActive, setChangeBtnActive] = useState(false);
  const [withdrawBtnActive, setWithdrawBtnActive] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showChangePasswordSection, setShowChangePasswordSection] = useState(false); // 비밀번호 변경 섹션의 표시 여부 상태

  useEffect(() => {
    setChangeBtnActive(
      currentPassword !== "" && newPassword !== "" && confirmNewPassword !== ""
    );

    setWithdrawBtnActive(withdrawPassword !== "");
  }, [currentPassword, newPassword, confirmNewPassword, withdrawPassword]);

  const isPasswordCorrect = async (userInputPassword) => {
    try {
      const response = await api.post("/api/check-password/", {
        password: userInputPassword,
      }); // 유저의 실제 비밀번호와 입력한 현재 비밀번호가 일치하는지 확인하는 코드

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("비밀번호를 확인하는데 오류가 발생했습니다.", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      return false;
    }
  };

  const handleChangePassword = async () => {
    const isCorrect = await isPasswordCorrect(currentPassword);
    if (!isCorrect) {
      setChangePasswordError("현 비밀번호가 일치하지 않습니다");
    } else if (newPassword !== confirmNewPassword) {
      setChangePasswordError("새 비밀번호가 일치하지 않습니다");
    } else {
      setChangePasswordError("");
      try {
        const response = await api.patch("/api/change-password/", {
          new_password: newPassword,
        });
        setNewPassword(""); // 비밀번호 변경 후 입력 필드 초기화

        // 로그아웃 처리
        // localStorage.removeItem("token"); // 토큰 제거
        localStorage.clear();
        alert("Password changed successfully. You will be logged out.");
        navigate("/login"); // 로그인 페이지로 이동
      } catch (error) {
        console.error("Password change failed:", error);
        alert("Password change failed");
      }
    }
  };

  const handleLogout = () => {
    // 로그아웃 처리
    // localStorage.removeItem("token"); // 토큰 제거
    localStorage.clear();
    navigate("/login"); // 로그인 페이지로 이동
  };

  const handleWithdraw = async () => {
    const isCorrect = await isPasswordCorrect(withdrawPassword);
    if (!isCorrect) {
      setWithdrawError("현 비밀번호가 일치하지 않습니다");
    } else {
      setShowWithdrawModal(true);
    }
  };

  const confirmWithdraw = () => {
    setShowWithdrawModal(false);
    setShowFinalModal(true);
  };

  const handleFinalConfirmation = async () => {
    setShowFinalModal(false);
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

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    switch (item) {
      case "초대":
        navigate("/invite");
        break;
      case "1촌":
        navigate("/friends");
        break;
      case "홈":
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

      <h2 className="setting-section-title">비밀번호 변경</h2>
      <div
        className="setting-password-toggle"
        onClick={() => setShowChangePasswordSection(!showChangePasswordSection)}
      >
        <span>비밀번호 변경</span>
        <img
          src={ArrowDownIcon}
          alt="Toggle Password Change Section"
          className={`setting-arrow-icon ${showChangePasswordSection ? 'rotate' : ''}`}
        />
      </div>
      {showChangePasswordSection && (
        <div className="setting-password-change-section">
          <div className="setting-input-group">
            <label>현 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="setting-input-group">
            <label>새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="setting-input-group">
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          {changePasswordError && (
            <p className="setting-error">{changePasswordError}</p>
          )}
          <button
            className="setting-change-password-button"
            onClick={handleChangePassword}
            disabled={!changeBtnActive}
          >
            비밀번호 변경
          </button>
        </div>
      )}

      <h2 className="setting-section-title">로그 아웃</h2>
      <button className="setting-logout-button" onClick={handleLogout}>
        로그 아웃
      </button>

      <h2 className="setting-section-title">회원 탈퇴</h2>
      <div className="setting-withdraw-section">
        <div className="setting-input-group">
          <label>현 비밀번호</label>
          <input
            type="password"
            value={withdrawPassword}
            onChange={(e) => setWithdrawPassword(e.target.value)}
          />
        </div>
        {withdrawError && <p className="setting-error">{withdrawError}</p>}
        <button
          className="setting-withdraw-button"
          disabled={!withdrawBtnActive}
          onClick={handleWithdraw}
        >
          회원 탈퇴
        </button>
      </div>

      {showWithdrawModal && (
        <div className="setting-modal-overlay">
          <div className="setting-withdraw-modal-content">
            <div className="setting-modal-title">
              <img
                src={WithdrawIcon}
                alt="탈퇴 아이콘"
                className="setting-withdraw-icon"
              />
              <p>정말 탈퇴하시겠어요?</p>
            </div>
            <p className="setting-modal-description">
              탈퇴 버튼 선택 시, 계정은
              <br />
              삭제되며 복구되지 않습니다.
            </p>
            <div className="setting-modal-buttons">
              <button
                className="setting-modal-button setting-cancel-button"
                onClick={closeWithdrawModal}
              >
                취소
              </button>
              <button
                className="setting-modal-button setting-confirm-button"
                onClick={confirmWithdraw}
              >
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalModal && (
        <div className="setting-modal-overlay">
          <div className="setting-withdraw-modal-content">
            <p className="setting-final-modal-title">
              탈퇴 처리가 완료되었습니다.
            </p>
            <p className="setting-final-modal-description">
              이용해 주셔서 감사합니다.
              <br />
              앞으로 더 좋은 모습으로 만나뵐 수<br />
              있도록 노력하겠습니다.
            </p>
            <button
              className="setting-final-confirm-button"
              onClick={handleFinalConfirmation}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
