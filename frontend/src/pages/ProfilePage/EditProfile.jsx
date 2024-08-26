import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/ProfilePage/EditProfile.css";
import CurrentAcademicDegreePopUp from "./CurrentAcademicDegreePopUp";
import MajorPopUp from "../NewSearchPage/MajorPopUp";
function EditProfile() {
  //

  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = location.state; // profile 컴포넌트에서 전달된 profile 데이터를 받아옴

  const [newProfile, setNewProfile] = useState(profile);
  const [newUser_name, setNewUser_name] = useState(profile.user_name);
  const [newSchool, setNewSchool] = useState(profile.school);
  const [newCurrent_academic_degree, setNewCurrent_academic_degree] = useState(
    profile.current_academic_degree
  );
  const [newYear, setNewYear] = useState(profile.year);
  const [newMajor, setNewMajor] = useState(profile.major);
  const [isCADPopUp, setIsCADPopUp] = useState(false);
  const [isMajorPopUp, setIsMajorPopUp] = useState(false);

  function handleBack() {
    navigate("/profile", {
      state: {
        profile: newProfile,
      },
    });
  }

  function handleSaveNewProfile() {
    setNewProfile((prevProfile) => ({
      ...prevProfile,
      user_name: newUser_name,
      school: newSchool,
      current_academic_degree: newCurrent_academic_degree,
      year: newYear,
      major: newMajor,
    }));

    console.log("Profile updated:", newProfile);
  }

  return (
    <div className="edit">
      <div className="edit-back">
        <button type="button" onClick={handleBack}></button>
      </div>
      <h4>프로필 수정</h4>
      <div className="edit-container">
        <div className="edit-label">
          <label className="edit-label-title">이름</label>
        </div>
        <input
          type="text"
          placeholder=" 이름 입력"
          className="edit-input"
          onChange={(e) => setNewUser_name(e.target.value)}
          value={newUser_name}
          required
        />
        <div className="edit-label">
          <label className="edit-label-title">학교</label>
        </div>
        <input
          type="text"
          placeholder=" 학교 입력"
          className="edit-input"
          onChange={(e) => setNewSchool(e.target.value)}
          value={newSchool}
          required
        />
        <div className="edit-label">
          <label className="edit-label-title">재학 과정</label>
        </div>
        <input
          type="text"
          className="edit-input"
          value={newCurrent_academic_degree}
          readOnly
          onClick={() => setIsCADPopUp(true)}
        />
        <div className="edit-label">
          <label className="edit-label-title">입학년도</label>
        </div>
        <input
          type="number"
          placeholder=" 입학년도 입력(4자리)"
          className="edit-input"
          onChange={(e) => setNewYear(e.target.value)}
          value={newYear}
          required
          min="1900"
          max={new Date().getFullYear()} // 현재 연도까지 입력 가능
        />
        <div className="edit-label">
          <label className="edit-label-title">전공</label>
          <label className="edit-label-detail">최대 2개까지 입력 가능</label>
        </div>
        <input
          type="text"
          placeholder="전공 입력"
          className="edit-input"
          onClick={() => {
            setIsMajorPopUp(true);
          }}
          value={newMajor}
          readOnly
          required
        />
        <button
          type="button"
          className="edit-nextBtn"
          onClick={handleSaveNewProfile}
        >
          저장
        </button>
      </div>

      {isCADPopUp && (
        <>
          <div
            className="editprofile-popup-overlay"
            onClick={() => setIsCADPopUp(false)}
          ></div>
          <CurrentAcademicDegreePopUp
            cad={newProfile.current_academic_degree}
            setCad={setNewCurrent_academic_degree}
          />
        </>
      )}

      {isMajorPopUp && (
        <>
          <div
            className="editprofile-popup-overlay"
            onClick={() => setIsMajorPopUp(false)}
          ></div>
          <MajorPopUp
            userSelectedMajors={[newMajor]}
            handleMajorChange={setNewMajor}
            setIsMajorPopupOpen={setIsMajorPopUp}
            doSearchUsers={() => {}}
            buttonText={"선택"}
          />
        </>
      )}
    </div>
  );
}

export default EditProfile;
