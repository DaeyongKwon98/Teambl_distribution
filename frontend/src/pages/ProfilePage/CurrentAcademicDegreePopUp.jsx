import React, { useState } from "react";
import "../../styles/ProfilePage/CurrentAcademicDegreePopUp.css";
import topBarIcon from "../../assets/popUpTopBar.svg";

const CurrentAcademicDegreePopUp = ({ cad, setCad, setIsPopupOpen }) => {
  // 처음 팝업이 열릴 때만 cad를 newCad로 초기화
  const [newCad, setNewCad] = useState(cad);

  const handleCadChange = (e) => {
    const newCadInput = e.target.value;
    setNewCad(newCadInput); // newCad를 사용하여 상태 변경
    setCad(newCadInput);    // 부모 상태도 업데이트
    setIsPopupOpen(false);  // 팝업 닫기
    console.log("handleCadChange - newCadInput:", newCadInput); // 상태 업데이트 확인
    console.log("handleCadChange - newCad (before close):", newCad);
  };

  return (
    <div className="cad-popup-overlay">
      <div className="cad-popup-content">
        <div className="cad-popup-top">
          <img src={topBarIcon} alt="popup top bar" />
        </div>
        <div className="cad-popup-discription">
          <h3>재학 과정</h3>
          <p>현재 재학 중인 과정을 선택해 주세요.</p>
        </div>

        <div className="cad-popup-radio-container">
          <label>
            <input
              type="radio"
              value="학사"
              checked={newCad === "학사"}
              onChange={handleCadChange}
            />
            {" 학사"}
          </label>
          <label>
            <input
              type="radio"
              value="석사"
              checked={newCad === "석사"}
              onChange={handleCadChange}
            />
            {" 석사"}
          </label>
          <label>
            <input
              type="radio"
              value="박사"
              checked={newCad === "박사"}
              onChange={handleCadChange}
            />
            {" 박사"}
          </label>
        </div>
      </div>
    </div>
  );
};

export default CurrentAcademicDegreePopUp;
