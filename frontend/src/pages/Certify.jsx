import "../styles/Certify.css";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import greenNotiIcon from "../assets/green_noti_icon.svg";
import redNotiIcon from "../assets/red_noti_icon.svg";

function Certify() {
  const labelRef1 = useRef(null);
  const labelRef2 = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [emailBtnActive, setEmailBtnActive] = useState(false);
  const [nextBtnActive, setNextBtnActive] = useState(false);
  const [pwCheck, setPwCheck] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeVerified, setCodeVerified] = useState(null); // 인증 코드 확인 상태 추가

  useEffect(() => {
    if (email !== "") {
      setEmailBtnActive((EBA) => (EBA = true));
      setEmailError(""); // 이메일이 비어있으면 에러 메시지 초기화
    } else {
      setEmailBtnActive((EBA) => (EBA = false));
      setEmailError(""); // 이메일이 비어있으면 에러 메시지 초기화
    }
  }, [email]);

  const checkEmailExists = async () => {
    try {
      const response = await api.post("/api/check-email/", { email });
      setEmailError(""); // 이메일 사용 가능
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setEmailError("이미 가입된 회원입니다."); // 이메일 중복
        return true;
      } else {
        setEmailError("이메일 확인 중 오류가 발생했습니다.");
        return true;
      }
    }
  };

  const checkIsKaistEmail = () => {
    return email.endsWith("@kaist.ac.kr");
  };

  useEffect(() => {
    if (password === pwCheck && password !== "") {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [pwCheck, password]);

  useEffect(() => {
    if (isVerified && isChecked) setNextBtnActive(true);
    else setNextBtnActive(false);
  }, [isVerified, isChecked, emailError]);

  function handleNext() {
    navigate("/register", {
      state: {
        email: email,
        password: password,
      },
    });
  }

  const handleSendCode = async () => {
    const isEmailExists = await checkEmailExists(); // 이메일 중복 체크
    const isKaistEmail = checkIsKaistEmail();

    if (isEmailExists) {
      alert("이미 가입된 이메일입니다."); // 중복일 경우 경고 메시지
      return; // 중복일 경우 코드 전송 중단
    }

    if (!isKaistEmail) {
      alert("Kaist 유저만 가입이 가능합니다."); // 중복일 경우 경고 메시지
      return; // 중복일 경우 코드 전송 중단
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    try {
      await api.post("/api/send_code/", { email, code });
      setCodeSent(true);
      alert(`인증 코드가 이메일로 전송되었습니다.`);
    } catch (error) {
      console.error(error);
      alert("인증 코드 전송 실패");
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      setCodeVerified(true); // 인증 성공 시 codeVerified를 true로 설정
      setIsVerified(true);
      // alert("이메일 인증 성공");
    } else {
      setCodeVerified(false); // 인증 실패 시 codeVerified를 false로 설정
      setIsVerified(false);
      // alert("인증 코드가 일치하지 않습니다.");
    }
  };

  return (
    <div className="certify">
      <div className="certify-back">
        <button type="button" disabled={true}></button>
      </div>
      <h4>회원가입</h4>
      <label className="certify-label">
        학교 이메일
        <br />
      </label>
      <div className="certify-email">
        <input
          type="text"
          id="email"
          placeholder=" 이메일 입력"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          disabled={isVerified} // 이메일 인증 성공 시 필드를 비활성화
        />
        <button
          type="button"
          className="certify-emailBtn"
          disabled={!emailBtnActive || isVerified} // 이메일 인증 성공 시 버튼 비활성화
          onClick={handleSendCode}
        >
          인증코드 받기
        </button>
      </div>
      {codeSent && (
        <div className="certify-email">
          <input
            type="password"
            className="certify-email"
            placeholder=" 인증코드 입력"
            onChange={(e) => setVerificationCode(e.target.value)}
            value={verificationCode}
            disabled={isVerified} // 이메일 인증 성공 시 인증코드 입력 필드를 비활성화
            required
          />
          <button
            type="button"
            className="certify-emailBtn"
            onClick={handleVerifyCode}
            disabled={isVerified} // 이메일 인증 성공 시 인증코드 확인 버튼을 비활성화
          >
            인증코드 확인
          </button>
        </div>
      )}
      {codeVerified !== null && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {codeVerified ? (
            <img
              src={greenNotiIcon}
              alt="Success icon"
              style={{ marginRight: "2px" }}
            />
          ) : (
            <img
              src={redNotiIcon}
              alt="Error icon"
              style={{ marginRight: "2px" }}
            />
          )}
          <label
            ref={labelRef1}
            className={codeVerified ? "label-success" : "label-error"}
          >
            {codeVerified
              ? "인증코드가 일치합니다."
              : "인증코드가 일치하지 않습니다."}
          </label>
        </div>
      )}
      <label className="certify-label">
        비밀번호
        <br />
      </label>
      <input
        type="password"
        className="certify-password"
        placeholder=" 비밀번호 입력"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        disabled={!isVerified}
      />
      <input
        type="password"
        className="certify-password"
        placeholder=" 비밀번호 확인"
        onChange={(e) => setPwCheck(e.target.value)}
        value={pwCheck}
        disabled={!isVerified}
      />
      {password !== "" && pwCheck !== "" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {isChecked && (
            <img
              src={greenNotiIcon}
              alt="Success icon"
              style={{ marginRight: "2px", verticalAlign: "middle" }}
            />
          )}
          {!isChecked && pwCheck !== "" && (
            <img
              src={redNotiIcon}
              alt="Error icon"
              style={{ marginRight: "2px", verticalAlign: "middle" }}
            />
          )}
          <label
            ref={labelRef2}
            className={isChecked ? "label-success" : "label-error"}
          >
            {isChecked
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </label>
        </div>
      )}
      <button
        type="button"
        className="certify-nextBtn"
        disabled={!nextBtnActive}
        onClick={handleNext}
      >
        다음
      </button>
    </div>
  );
}

export default Certify;
