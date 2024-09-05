import React, { useState, useEffect } from "react";
import "../../styles/ProfilePage/CurrentAcademicDegreePopUp.css"; // CSS 파일을 가져옵니다.
import topBarIcon from "../../assets/popUpTopBar.svg";

const CurrentAcademicDegreePopUp = ({ cad, setCad, setIsPopupOpen }) => {
  const [newCad, setNewCad] = useState(cad);

  // cad가 변경될 때마다 newCad 상태를 동기화
  useEffect(() => {
    setNewCad(cad);
  }, [cad, setIsPopupOpen]);
  
  const handleCadChange = (e) => {
    const newCadInput = e.target.value;
    setNewCad(newCadInput);
    setCad(newCadInput);
    setIsPopupOpen(false);
  };

  return (
    <div className="cad-popup-overlay">
      <div className="cad-popup-content">
        <div className="cad-popup-top">
          <img src={topBarIcon} />
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
