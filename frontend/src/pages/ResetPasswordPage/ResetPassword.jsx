import "../../styles/ResetPasswordPage/ResetPassword.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import backIcon from "../../assets/backIcon.svg";

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // 유저가 입력한 이메일
  const [password, setPassword] = useState(""); // 유저가 입력한 새 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 유저가 입력한 새 비밀번호 확인
  const [verificationCode, setVerificationCode] = useState(""); // 유저가 입력한 인증코드
  const [generatedCode, setGeneratedCode] = useState(""); // 생성된 인증코드
  const [isCodeVerified, setIsCodeVerified] = useState(false); // 인증코드 확인되었는지
  const [isPasswordChecked, setPasswordIsChecked] = useState(false); // 비밀번호 확인되었는지
  const [emailBtnActive, setEmailBtnActive] = useState(false);
  const [passwordResetBtnActive, setPasswordResetBtnActive] = useState(false);
  const [isCodeRequested, setIsCodeRequested] = useState(false); // 인증코드 요청 상태
  const [verificationMessage, setVerificationMessage] = useState(""); // 인증 메시지 상태

  useEffect(() => {
    if (email.length === 0) {
      setEmailBtnActive(false);
    } else {
      setEmailBtnActive(true);
    }
  }, [email]);

  useEffect(() => {
    if (password === passwordConfirm && password !== "") {
      setPasswordIsChecked(true);
    } else {
      setPasswordIsChecked(false);
    }
  }, [passwordConfirm, password]);

  useEffect(() => {
    if (isCodeVerified && isPasswordChecked) {
      setPasswordResetBtnActive(true);
    } else {
      setPasswordResetBtnActive(false);
    }
  }, [isCodeVerified, isPasswordChecked]);

  const handleBackButtonClicked = () => {
    navigate("/login");
  };

  const handleSendCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    try {
      await api.post("/api/send-code-email/", { email, code });
      setIsCodeRequested(true); // 인증코드 요청 상태 변경
      setVerificationMessage(""); // 초기화
      alert(`인증 코드가 이메일로 전송되었습니다.`);
    } catch (error) {
      console.error(error);
      alert("인증 코드 전송 실패");
    }
  };

  const handleVerificationCodeChange = (e) => {
    const value = e.target.value;
    setVerificationCode(value);

    if (value === generatedCode) {
      setVerificationMessage("인증코드가 일치합니다.");
    } else {
      setVerificationMessage("인증코드가 일치하지 않습니다.");
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      setIsCodeVerified(true);
      setVerificationMessage("");
      alert("이메일 인증 성공");
    } else {
      setIsCodeVerified(false);
      setVerificationMessage("인증코드가 일치하지 않습니다.");
      alert("인증 코드가 일치하지 않습니다.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await api.patch("/api/change-password/", {
        email: email,
        new_password: password,
      });
      console.log(response.data);
      alert("비밀번호 재설정 완료");

      navigate("/password-reset-confirm");
    } catch (error) {
      console.error("비밀번호 재설정 중 오류가 발생했습니다.", error);
      alert("비밀번호 재설정 실패");
    }
  };

  return (
    <div className="resetPassword-body">
      <div className="resetPassword-container">
        <div className="resetPassword-back">
          <button type="button" onClick={handleBackButtonClicked}>
            <img src={backIcon} alt="back" />
          </button>
        </div>

        <h4>비밀번호 재설정</h4>

        <label className="resetPassword-label">
          학교 이메일
          <br />
        </label>

        <div className="resetPassword-email">
          <input
            type="text"
            id="email"
            placeholder=" 이메일 입력"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={isCodeVerified} // 이메일 인증 성공 시 필드를 비활성화
          />
          <button
            type="button"
            className="certify-emailBtn"
            disabled={!emailBtnActive || isCodeVerified}
            onClick={handleSendCode}
          >
            인증코드 받기
          </button>
        </div>

        {isCodeRequested && (
          <>
            <div className="resetPassword-email">
              <input
                type="password"
                className="resetPassword-email"
                placeholder=" 인증코드 입력"
                onChange={handleVerificationCodeChange}
                value={verificationCode}
                disabled={isCodeVerified} // 이메일 인증 성공 시 필드를 비활성화
                required
              />
              <button
                type="button"
                className="resetPassword-emailBtn"
                onClick={handleVerifyCode}
                disabled={verificationCode.length <= 0 || isCodeVerified}
              >
                인증코드 확인
              </button>
            </div>
            {isCodeRequested && !isCodeVerified && verificationMessage && (
              <label
                className={`resetPassword-label-${
                  verificationCode === generatedCode ? "correct" : "incorrect"
                }`}
              >
                {verificationMessage}
                <br />
              </label>
            )}
          </>
        )}

        <label className="resetPassword-label">
          비밀번호
          <br />
        </label>
        <input
          type="password"
          className="resetPassword-password"
          placeholder=" 새 비밀번호 입력"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <input
          type="password"
          className="resetPassword-password"
          placeholder=" 새 비밀번호 확인"
          onChange={(e) => setPasswordConfirm(e.target.value)}
          value={passwordConfirm}
        />
        {isCodeVerified && passwordConfirm.length > 0 && (
          <label
            className={`resetPassword-label-${
              isPasswordChecked ? "correct" : "incorrect"
            }`}
          >
            {isPasswordChecked
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
            <br />
          </label>
        )}

        <button
          type="button"
          className="resetPassword-resetBtn"
          disabled={!passwordResetBtnActive}
          onClick={handleResetPassword}
        >
          재설정
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
