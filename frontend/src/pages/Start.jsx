import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Start.css";

const Start = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="start">
      <div className="start-container">
        <span className="start-span">
          팀원 찾기의 새로운 기준, 팀블!
        </span>
        <label className="start-label1">
          팀블에 오신 것을 환영합니다!
        </label>
        <label className="start-label2">
          팀블은 지인 네트워크를 통해 신뢰할 수 있는 팀원을 찾는 플랫폼으로, 가입은 기존 회원의 초대 링크로만 가능합니다.
        </label>
        <button type="button" className="start-loginBtn" onClick={handleLogin}>
          로그인 하기
        </button>
      </div>
    </div>
  );
};

export default Start;
