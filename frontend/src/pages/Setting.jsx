import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import api from "../api";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import WithdrawIcon from "../assets/withdrawIcon.svg";
import ArrowDownIcon from "../assets/arrowDownIcon.svg";
import ArrowRightIcon from "../assets/arrowRightIcon.svg";
import LogoutRightIcon from "../assets/logout_right_icon.svg";

const Setting = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("설정");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [inquiryText, setInquiryText] = useState(""); // 문의하기 텍스트 상태
  const [changeBtnActive, setChangeBtnActive] = useState(false);
  const [withdrawBtnActive, setWithdrawBtnActive] = useState(false);
  const [inquiryBtnActive, setInquiryBtnActive] = useState(false); // 문의하기 버튼 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showChangePasswordSection, setShowChangePasswordSection] =
    useState(false); // 비밀번호 변경 섹션의 표시 여부 상태
  const [showWithdrawSection, setShowWithdrawSection] = useState(false); // 회원 탈퇴 섹션의 표시 여부 상태
  const [showInquirySection, setShowInquirySection] = useState(false); // 문의하기 섹션의 표시 여부 상태
  const [showPolicySection, setShowPolicySection] = useState(false); // 약관 및 정책 섹션 표시 여부
  const [profileImage, setProfileImage] = useState(""); // 프로필 이미지
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setChangeBtnActive(
      currentPassword !== "" && newPassword !== "" && confirmNewPassword !== ""
    );

    setWithdrawBtnActive(withdrawPassword !== "");
    setInquiryBtnActive(inquiryText.trim() !== ""); // 문의하기 텍스트가 있을 때만 버튼 활성화
  }, [
    currentPassword,
    newPassword,
    confirmNewPassword,
    withdrawPassword,
    inquiryText,
  ]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 현재 유저를 가져오기
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/current-user/");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  // 문의하기 제출 처리 로직
  const handleInquirySubmit = async () => {
    try {
      const response = await api.post("/api/send-inquiry-email/", {
        from_email: currentUser.email,
        body: inquiryText,
      });

      if (response.status === 200) {
        alert("문의가 제출되었습니다.");
        setInquiryText(""); // 제출 후 입력 필드 초기화
      }
    } catch (error) {
      console.error("문의 제출 중 오류가 발생했습니다:", error);
      if (error.response) {
        console.error("서버 응답 데이터:", error.response.data);
      }
      alert("문의 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

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
    try {
      const response = await api.delete("/api/delete-user/");
      if (response && response.data && response.data.detail) {
        console.log(response.data.detail);
        // alert(response.data.detail);
      } else {
        console.log("회원 탈퇴 성공");
        // alert("Account deleted successfully.");
      }
      navigate("/login"); // 계정 삭제 후 로그인 페이지로 이동
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert("Account deletion failed");
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
        navigate("/home");
        break;
      default:
        break;
    }
  };

  // 프로필 이미지 가져오기
  const fetchProfileImage = async () => {
    try {
      const response = await api.get(`/api/profile/${userId}/`);
      setProfileImage(response.data.image); // Assuming the image field is 'image'
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfileImage();
    };
    fetchData();
  }, []);

  return (
    <div className="setting-container">
      <Header profileImage={profileImage} />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      <div className="setting-incontianer">
        {/* <h2 className="setting-section-title">비밀번호 변경</h2> */}
        <div
          className="setting-password-toggle"
          onClick={() =>
            setShowChangePasswordSection(!showChangePasswordSection)
          }
        >
          <span className="setting-section-title">비밀번호 변경</span>
          <img
            src={showChangePasswordSection ? ArrowDownIcon : ArrowRightIcon}
            alt="Toggle Password Change Section"
            className={`setting-arrow-icon ${
              showChangePasswordSection ? "rotate" : ""
            }`}
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

        <div className="setting-password-toggle">
          <span className="setting-section-title" onClick={handleLogout}>
            로그아웃
          </span>
          <img
            src={LogoutRightIcon}
            alt="Logout Icon"
            className="setting-logout-icon"
            onClick={handleLogout}
          />
        </div>

        <div
          className="setting-password-toggle"
          onClick={() => setShowInquirySection(!showInquirySection)}
        >
          <span className="setting-section-title">문의하기</span>
          <img
            src={showInquirySection ? ArrowDownIcon : ArrowRightIcon}
            alt="Toggle Inquiry Section"
            className={`setting-arrow-icon ${
              showInquirySection ? "rotate" : ""
            }`}
          />
        </div>
        {showInquirySection && (
          <div className="setting-inquiry-section">
            <p>받는 사람: info@teambl.net</p>
            <p>보내는 사람: {currentUser.email}</p>
            <div className="setting-input-group">
              <textarea
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                className="setting-inquiry-textarea"
                placeholder="문의 내용을 입력하세요"
              />
            </div>
            <button
              className="setting-inquiry-button"
              onClick={handleInquirySubmit}
              disabled={!inquiryBtnActive}
            >
              문의하기
            </button>
          </div>
        )}

        <div
          className="setting-password-toggle"
          onClick={() => setShowWithdrawSection(!showWithdrawSection)}
        >
          <span className="setting-section-title">회원 탈퇴</span>
          <img
            src={showWithdrawSection ? ArrowDownIcon : ArrowRightIcon}
            alt="Toggle Withdraw Section"
            className={`setting-arrow-icon ${
              showWithdrawSection ? "rotate" : ""
            }`}
          />
        </div>

        {showWithdrawSection && (
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
        )}

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

        <div
          className="setting-password-toggle"
          onClick={() => setShowPolicySection(!showPolicySection)}
        >
          <span className="setting-section-title">약관 및 정책</span>
          <img
            src={showPolicySection ? ArrowDownIcon : ArrowRightIcon}
            alt="Toggle Policy Section"
            className={`setting-arrow-icon ${
              showPolicySection ? "rotate" : ""
            }`}
          />
        </div>
        {showPolicySection && (
          <div className="setting-policy-section">
            <p>
              <a
                href="https://www.notion.so/Personal-Information-Terms-da10ebf1ada6470780d6ba9ab260916b"
                target="_blank"
                rel="noopener noreferrer"
              >
                팀블 개인정보 방침
              </a>
            </p>
            <p>
              <a
                href="https://www.notion.so/Service-Terms-and-Condition-5379c333ce1543c895dc0cebe39f4844"
                target="_blank"
                rel="noopener noreferrer"
              >
                팀블 서비스 약관
              </a>
            </p>
          </div>
        )}

        {/* <h2 className="setting-section-title">회원 탈퇴</h2> */}
      </div>
    </div>
  );
};

export default Setting;
