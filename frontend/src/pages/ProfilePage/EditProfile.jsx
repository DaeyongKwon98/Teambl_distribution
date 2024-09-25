import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/ProfilePage/EditProfile.css";
import CurrentAcademicDegreePopUp from "./CurrentAcademicDegreePopUp";
import MajorPopUp from "../NewSearchPage/MajorPopUp";
import api from "../../api";
import backIcon from "../../assets/Profile/left-arrow.svg";
import majorEdit from "../../assets/Profile/majorEdit.svg";

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = location.state; // profile 컴포넌트에서 전달된 profile 데이터를 받아옴

  const [currentUser, setCurrentUser] = useState(null);
  const [newProfile, setNewProfile] = useState(profile);
  const [newUser_name, setNewUser_name] = useState(profile.user_name);
  const [newSchool, setNewSchool] = useState(profile.school);
  const [newCurrent_academic_degree, setNewCurrent_academic_degree] = useState(
    profile.current_academic_degree
  );
  const [newYear, setNewYear] = useState(profile.year);
  // const [newMajor, setNewMajor] = useState(profile.major);
  const [newMajors, setNewMajors] = useState(
    [profile.major1, profile.major2].filter(Boolean)
  );
  const [isCADPopUp, setIsCADPopUp] = useState(false);
  const [isMajorPopUp, setIsMajorPopUp] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // 성공 팝업 상태

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  function handleBack() {
    navigate(`/profile/${currentUser.id}`, {
      state: {
        profile: newProfile,
        EditProfile: true,
      },
    });
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/current-user/");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const handleSaveNewProfile = async () => {
    if (!newMajors[0]) {
      alert("최소 1개의 전공을 선택해야 합니다.");
      return;
    }

    const updatedProfile = {
      ...newProfile,
      user_name: newUser_name,
      school: newSchool,
      current_academic_degree: newCurrent_academic_degree,
      year: newYear,
      major1: newMajors[0],
      major2: newMajors[1] || "",
    };

    try {
      const response = await api.put(`/api/profile/update/`, {
        user_name: newUser_name,
        school: newSchool,
        current_academic_degree: newCurrent_academic_degree,
        year: newYear,
        major1: newMajors[0],
        major2: newMajors[1] || "",
      });
      console.log("Profile updated successfully:", response.data);
      setNewProfile(updatedProfile);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("프로필 업데이트 실패");
    }
  };

  const handleRemoveMajor = (majorToRemove) => {
    setNewMajors((prevMajors) =>
      prevMajors.filter((major) => major !== majorToRemove)
    );
  };

  const handleMajorChange = (selectedMajors) => {
    if (selectedMajors.length <= 2) {
      setNewMajors(selectedMajors);
    } else {
      alert("전공은 최대 2개까지 선택할 수 있습니다.");
    }
  };

  return (
    <div className="edit">
      <div className="edit-back">
        <button type="button" onClick={handleBack}>
          <img src={backIcon} alt="뒤로가기"></img>
        </button>
      </div>
      <h4 className="edit-profile-title">프로필 작성하기</h4>
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
        <div
          className="edit-label"
          style={{
            marginBottom: '4px'
          }}
        >
          <label className="edit-label-title">전공</label>
        </div>
        <div
          className="major-list"
          onClick={() => setIsMajorPopUp(true)}
          style={{
            height: '40px',
            paddingTop: '0px',
            paddingBottom: '0px',
            marginTop: '0px'
          }}
        >
          <img
            src={majorEdit}
            alt="전공 선택"
            className="edit-addMajorImg"
            onClick={() => setIsMajorPopUp(true)}
          />
          {newMajors.length === 0 ? (
            <span className="placeholder-text">전공 검색</span>
          ) : (
            newMajors.map((major, index) => (
              <div
                key={index}
                className="major-element"
                onClick={(e) => {
                  e.stopPropagation(); // major-element 클릭 시 상위 요소의 onClick 이벤트가 발생하지 않도록 함
                }}
              >
                {major}
                <button
                  className="newSearch-remove-major"
                  onClick={(e) => {
                    e.stopPropagation(); // 부모의 onClick 이벤트가 발생하지 않도록 함
                    handleRemoveMajor(major);
                  }}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="edit-nextBtn"
          onClick={handleSaveNewProfile}
        >
          저장
        </button>
      </div>

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>저장되었습니다.</p>
            <button
              onClick={() =>
                navigate(`/profile/${currentUser.id}`, {
                  state: {
                    profile: newProfile,
                    EditProfile: true,
                  },
                })
              }
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isCADPopUp && (
        <>
          <div
            className="editprofile-popup-overlay"
            onClick={() => setIsCADPopUp(false)}
          ></div>
          <CurrentAcademicDegreePopUp
            cad={newCurrent_academic_degree}
            setCad={setNewCurrent_academic_degree}
            setIsPopupOpen={setIsCADPopUp}
          />
        </>
      )}

      <MajorPopUp
        isMajorPopupOpen={isMajorPopUp}
        userSelectedMajors={newMajors}
        handleMajorChange={handleMajorChange}
        setIsMajorPopupOpen={setIsMajorPopUp}
        doSearchUsers={() => {}}
        buttonText={"선택 완료"}
      />
    </div>
  );
}

export default EditProfile;
