import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ResetPasswordPage/ResetPasswordConfirm.css";

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="ResetPasswordConfirm-body">
      <div className="ResetPasswordConfirm-container">
        <h1 className="ResetPasswordConfirm-title">
          {"비밀번호가"}
          <br />
          {"성공적으로 변경되었습니다!"}
        </h1>
        <h2 className="ResetPasswordConfirm-text">
          이제 팀블에 로그인하여 최적의 팀원을 찾아보세요.
        </h2>

        <button
          className="ResetPasswordConfirm-login-button"
          onClick={handleLoginClick}
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
