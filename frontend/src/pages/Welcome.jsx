import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Welcome.css";
import api from "../api";

const Welcome = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code");
  const navigate = useNavigate();

  const [inviterName, setInviterName] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState(""); // 에러 타입 저장하기 위한 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    if (code) {
      api
        .get(`/api/welcome/?code=${code}`)
        .then((response) => {
          console.log("API response:", response.data);
          setInviterName(response.data.inviter_name);
          setInviteeName(response.data.invitee_name);
          localStorage.setItem("invited", "true");
          localStorage.setItem("invite_code", code); // 초대 코드를 로컬 스토리지에 저장
          setLoading(false); // 로딩 완료
        })
        .catch((error) => {
          console.error(
            "There was an error fetching the invitation details:",
            error
          );

          if (error.response && error.response.data.error_type) {
            const errorTypeFromServer = error.response.data.error_type;
            console.log("Error Type from server:", errorTypeFromServer); // error_type 출력
            setErrorType(errorTypeFromServer); // error_type 상태 업데이트
          } else {
            console.log("Unknown error type or no error type provided."); // 알 수 없는 오류의 경우
            setErrorType("unknown");
          }
          setError(true);
          setLoading(false); // 로딩 완료
        });
    } else {
      console.log("No code provided in the URL."); // URL에 code가 없을 경우
      setErrorType("invalid");
      setError(true);
      setLoading(false); // 로딩 완료
    }
  }, [code]);

  const handleRegister = () => {
    navigate("/certify", { state: { invitee_name: inviteeName } });
  };

  function handleLogin() {
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">
          <div className="loading-subtext">팀원 찾기의 새로운 기준,</div>
          <div className="loading-highlight">팀블!</div>
        </div>
      </div>
    );
  }

  if (error) {
    if (errorType === "expired") {
      return (
        <div className="welcome-expired">
          <div className="welcome-expired-container">
            <span className="welcome-expired-span">
              앗, 더 이상
              <br />
              사용할 수 없는 링크에요.
            </span>
            <label className="welcome-expired-label">
              회원가입을 원하시면 초대 링크를
              <br />
              보내준 분께 다시 링크를 요청해보세요.
            </label>
            <button
              type="button"
              className="welcome-exitBtn"
              onClick={handleLogin}
            >
              팀블 로그인으로 가기
            </button>
          </div>
        </div>
      );
    } else if (errorType === "invalid") {
      return (
        <div className="welcome-expired">
          <div className="welcome-expired-container">
            <span className="welcome-expired-span">
              유효하지 않은
              <br />
              초대 링크입니다.
            </span>
            <label className="welcome-expired-label">
              올바른 링크를 사용해 주세요.
            </label>
            <button
              type="button"
              className="welcome-exitBtn"
              onClick={handleLogin}
            >
              팀블 로그인으로 가기
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="welcome-expired">
          <div className="welcome-expired-container">
            <span className="welcome-expired-span">
              알 수 없는
              <br />
              오류가 발생했습니다.
            </span>
            <label className="welcome-expired-label">다시 시도해 주세요.</label>
            <button
              type="button"
              className="welcome-exitBtn"
              onClick={handleLogin}
            >
              팀블 로그인으로 가기
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="welcome">
      <div className="welcome-container">
        <div className="welcome-intro">
          <span className="welcome-name" style={{ color: "#0000b3" }}>
            {inviterName}
          </span>
          <span className="welcome-name">님이&nbsp; </span>
          <span className="welcome-name" style={{ color: "#0000b3" }}>
            {inviteeName}
          </span>
          <span className="welcome-name">님을 팀블에 초대했습니다.</span>
        </div>
        <div className="welcome-teambl">팀원 찾기의 새로운 기준, 팀블!</div>
        <label className="welcome-outro">
          지인 네트워크를 통해 최적의 팀원을 구하세요.
        </label>
        <button
          type="button"
          className="welcome-nextBtn"
          onClick={handleRegister}
        >
          회원가입 시작하기
        </button>
      </div>
    </div>
  );
};

export default Welcome;
