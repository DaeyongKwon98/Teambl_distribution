import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import profileDefaultImg from "../../assets/Profile/defaultProfile.svg";
import friendIcon from "../../assets/Profile/friend.svg";
import backIcon from "../../assets/Profile/left-arrow.svg";
import pencilIcon from "../../assets/Profile/pencilIcon.svg";
import "../../styles/ProfilePage/ProfileSelf.css";
import "../../styles/ExperienceList.css";
import "../../styles/IntroductionForm.css";
import "../../styles/Tool.css";
import "../../styles/Portfolio.css";
import api from "../../api";

function ProfileSelf() {
  const navigate = useNavigate();
  const location = useLocation();

  const [initialProfile, setInitialProfile] = useState(null); // 초기 프로필 상태 저장 (비교용)
  
  // 처음에 receivedProfile을 받아옴
  const [receivedProfile, setReceivedProfile] = useState(
    location.state?.profile || null
  );
  const [profile, setProfile] = useState(
    receivedProfile || {
      user_name: "",
      school: "",
      current_academic_degree: "",
      year: 0,
      major1: "",
      major2: "",
      one_degree_count: 0,
      introduction: "",
      experiences: [],
      tools: [],
      portfolio_links: [],
      keywords: [],
      image: null,
    }
  );

  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(profileDefaultImg);
  const [newKeyword, setNewKeyword] = useState("");
  const [KeywordFull, setKeywordFull] = useState(false);
  const [newExperience, setNewExperience] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newPortfolio, setNewPortfolio] = useState("");

  const [KeywordVisible, setKeywordVisible] = useState(false);
  const [isSaveButtonActivate, setIsSaveButtonActivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // 성공 팝업 상태
  
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setNewImage(file);

    // 미리 보기 프로필 이미지 변경
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // 저장 버튼 활성화
    setIsSaveButtonActivate(true);
  };
  
  useEffect(() => {
    if (receivedProfile) {
      // receivedProfile을 사용하여 초기 상태를 설정
      setProfile(receivedProfile);

      // 미리보기 이미지를 설정
      if (receivedProfile.image) {
        setImagePreview(receivedProfile.image);
      }

      // 초기 프로필을 저장
      setInitialProfile(receivedProfile);
      
      // receivedProfile을 사용 후 null로 설정
      setReceivedProfile(null);

      // 저장 버튼 비활성화
      setIsSaveButtonActivate(false);
    } else {
      // receivedProfile이 없는 경우 서버에서 프로필을 가져옴
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (profile && initialProfile) {
      checkIfProfileChanged();
    }
  
    if (profile.keywords.length >= 5) {
      setKeywordFull(true);
    }

    // 저장 버튼 비활성화
    setIsSaveButtonActivate(false);
    
  }, [profile, newImage, profile.keywords]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  // 서버에서 유저의 프로필을 가져오는 코드
  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/current-user/");
      const fetchedProfile = response.data.profile;
      const oneDegreeCount = await fetchFriendCount();

      const completeProfile = {
        ...fetchedProfile,
        one_degree_count: oneDegreeCount,
      };

      setProfile(completeProfile);
      setInitialProfile(completeProfile);

      if (fetchedProfile.image) {
        setImagePreview(fetchedProfile.image);
      } else {
        setImagePreview(profileDefaultImg);
      }

      // 초기 상태에서는 변경 사항이 없으므로 저장 버튼 비활성화
      setIsSaveButtonActivate(false);
    } catch (error) {
      console.error("Failed to fetch current user profile:", error);
    }
  };

  // 뒤로 가기 버튼을 누른 경우 동작하는 함수
  const handleBackButton = () => {
    console.log("location.state", location.state);
    if (location.state && location.state.EditProfile) {
      navigate("/"); // 이전 페이지가 "내 프로필 편집"일 경우 홈으로 이동
    } else {
      window.history.back();
    }
  };

  // 유저의 1촌 수를 가지고 오는 코드
  const fetchFriendCount = async () => {
    try {
      const response = await api.get("/api/friends/");
      // console.log(response.data);
      const friendList = await response.data;

      // 상태가 "accepted"인 항목들만 필터링
      const acceptedFriendList = friendList.filter(
        (item) => item.status === "accepted"
      );

      // "accepted" 상태의 항목 개수를 세어 반환
      // console.log(acceptedFriendList.length);
      return acceptedFriendList.length;
    } catch (error) {
      console.error("Failed to fetch current user friends list:", error);
    }
  };

  // 연필 아이콘 누른 경우, 프로필 수정 페이지로 이동
  function handleEdit() {
    navigate("/editprofile", {
      state: {
        profile: profile,
        EditProfile: true,
      },
    });
  }

  // 프로필 키워드를 추가하는 함수
  const handleAddKeyword = () => {
    if (newKeyword) {
      setProfile((prevProfile) => ({
        ...prevProfile, // 기존의 profile 데이터를 유지
        keywords: [...prevProfile.keywords, newKeyword], // 기존 keywords 배열에 새로운 키워드를 추가
      }));
      setNewKeyword("");
      setKeywordVisible(false);
      setIsSaveButtonActivate(true);
    }
  };

  // 프로필 키워드를 삭제하는 함수
  const handleRemoveKeyword = (keywordToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile, // 기존의 profile 데이터를 유지
      keywords: prevProfile.keywords.filter(
        (keyword) => keyword !== keywordToRemove
      ),
    }));
    setIsSaveButtonActivate(true);
  };

  // 프로필 키워드 추가 취소 버튼 함수
  const handleCancelKeyword = () => {
    setNewKeyword("");
    setKeywordVisible(false);
  };

  const handleAddExperience = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      experiences: [...prevProfile.experiences, { experience: newExperience }],
    }));
    setNewExperience("");
    setIsSaveButtonActivate(true);
  };

  const handleRemoveExperience = (experienceToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      experiences: prevProfile.experiences.filter(
        (experience) => experience.experience !== experienceToRemove
      ),
    }));
    setIsSaveButtonActivate(true);
  };

  const handleAddTool = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      tools: [...prevProfile.tools, { tool: newTool }],
    }));
    setNewTool("");
    setIsSaveButtonActivate(true);
  };

  const handleRemoveTool = (toolToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      tools: prevProfile.tools.filter((tool) => tool.tool !== toolToRemove),
    }));
    setIsSaveButtonActivate(true);
  };

  const handleChangeIntroduction = (newIntroduction) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      introduction: newIntroduction,
    }));
    setIsSaveButtonActivate(true);
  };

  const handleAddPortfolio = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      portfolio_links: [
        ...prevProfile.portfolio_links,
        { portfolioLink: newPortfolio },
      ],
    }));
    setNewPortfolio("");
    setIsSaveButtonActivate(true);
  };

  const handleRemovePortfolio = (portfolioToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      portfolio_links: prevProfile.portfolio_links.filter(
        (portfolio) => portfolio.portfolioLink !== portfolioToRemove
      ),
    }));
    setErrorMessage("");
    setIsSaveButtonActivate(true);
  };

  // 초기 프로필과 현재 상태를 비교하여 변경 여부를 확인
  const checkIfProfileChanged = () => {
    const isProfileChanged =
      JSON.stringify(profile) !== JSON.stringify(initialProfile) || newImage;
    setIsSaveButtonActivate(isProfileChanged);
  };
  
  // 서버에 프로필 정보를 업로드하는 코드
  const handleSave = async (e) => {
    e.preventDefault();

    const imageData = new FormData();

    // 이미지 파일이 선택된 경우에만 추가
    if (newImage instanceof File) {
      imageData.append("image", newImage);
    }

    const profileDataWithoutImage = {
      user_name: profile.user_name,
      school: profile.school,
      current_academic_degree: profile.current_academic_degree,
      year: profile.year,
      major1: profile.major1,
      major2: profile.major2,
      one_degree_count: profile.one_degree_count,
      introduction: profile.introduction,
      experiences: profile.experiences,
      tools: profile.tools,
      portfolio_links: profile.portfolio_links,
      keywords: profile.keywords,
    };

    console.log("ProfileSelf.jsx: profileDataWithoutImage", profileDataWithoutImage);

    try {
      const response1 = await api.put("/api/profile/update/", profileDataWithoutImage); // 이미지 이외 데이터 업로드
      console.log("프로필 이미지 이외의 데이터 업로드 완료:", response1.data);
      const response2 = await api.put("/api/profile/update/", imageData); // 이미지 업로드
      const updatedProfile = response2.data;
      console.log("프로필 이미지 데이터 업로드 완료:", updatedProfile);
      // alert("프로필 저장 완료!");
      setShowSuccessPopup(true); // 성공적으로 저장되면 팝업 띄우기
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // 서버에서 400 오류를 반환할 때
        if (error.response.data.portfolio_links) {
          // 포트폴리오 링크 관련 오류인 경우
          setErrorMessage("올바르지 않은 링크 형식입니다.");
        } else {
          setErrorMessage("프로필 업데이트 실패: " + error.response.data.message || "알 수 없는 오류 발생");
        }
      } else {
        setErrorMessage("프로필 업데이트 실패");
      }
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleSave} className="profile">
      <button
        type="button"
        className="profile-backbutton"
        onClick={handleBackButton}
      >
        <img src={backIcon}></img>
      </button>
      <h4>내 프로필</h4>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-imageContainer" {...getRootProps()}>
            <img src={imagePreview} alt="Profile" onClick={handleImageClick} />
            <input
              {...getInputProps()}
              id="fileInput"
              type="file"
              style={{ display: "none" }}
            />
          </div>
          <div className="profile-info">
            <div className="profile-name">
              <h2>{profile.user_name}</h2>
              <button
                type="button"
                className="profile-editBtn"
                onClick={handleEdit}
              >
                <img src={pencilIcon} />
              </button>
            </div>
            <div className="profile-row1">
              <p> {profile.school}</p>
              <p> | </p>
              <p>{profile.current_academic_degree}</p>
              <p> | </p>
              <p>{profile.year % 100} 학번</p>
            </div>
            <div className="profile-row2">
              <p>
                {profile.major1}
                {profile.major2 && `, ${profile.major2}`}
              </p>
            </div>
            <div className="profile-row3">
              <img src={friendIcon} alt="friend-icon" />
              <span className="profile-oneDegree">
                <p>{`1촌 ${profile.one_degree_count}명`}</p>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tags">
        <div className="profile-tags-title">
          키워드
          <label className="profile-tags-definition">최대5개</label>
        </div>
        <div className="profile-tag-container">
          <div className="profile-tags-list">
            {profile.keywords.map((keyword, index) => (
              <span key={index} className="profile-tag">
                {keyword}
                <button
                  className="profile-deleteBtn"
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  X
                </button>
              </span>
            ))}
            {!KeywordFull && !KeywordVisible && (
              <span
                className="profile-addTag"
                onClick={() => setKeywordVisible(true)}
              >
                + 추가
              </span>
            )}
          </div>
          {KeywordVisible && (
            <div className="profile-tagInput">
              <input
                type="text"
                placeholder="태그"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
              />
              <button type="button" onClick={handleAddKeyword}>
                추가
              </button>
              <button type="button" onClick={handleCancelKeyword}>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="ex">
        <div className="ex-feature">경험</div>
        <div className="ex-lists">
          {profile.experiences.map((exp, index) => (
            <div key={index} className="ex-item">
              <span className="ex-description">{exp.experience}</span>
              <button
                type="button"
                className="profile-deleteBtn"
                onClick={() => handleRemoveExperience(exp.experience)}
              >
                X
              </button>
            </div>
          ))}
          <input
            maxLength="20"
            type="text"
            placeholder="본인의 경험을 추가해보세요."
            className="profile-input"
            value={newExperience}
            onChange={(e) => setNewExperience(e.target.value)}
          />
          <div
            className="ex-addExperience"
            onClick={() => handleAddExperience()}
          >
            + 추가하기
          </div>
        </div>
      </div>

      <div className="tool">
        <div className="tool-feature">툴</div>
        <div className="tool-lists">
          {profile.tools.map((t, index) => (
            <div key={index} className="tool-item">
              <span className="tool-description">{t.tool}</span>
              <button
                type="button"
                className="profile-deleteBtn"
                onClick={() => handleRemoveTool(t.tool)}
              >
                X
              </button>
            </div>
          ))}
          <input
            maxLength="20"
            type="text"
            placeholder="본인이 다룰 수 있는 툴을 추가해보세요."
            className="profile-input"
            value={newTool}
            onChange={(e) => setNewTool(e.target.value)}
          />
          <div className="tool-addTool" onClick={() => handleAddTool(true)}>
            + 추가하기
          </div>
        </div>
      </div>

      <div className="introduction-form">
        <div className="intro-feature">소개</div>
        <div className="saved-introduction">
          <textarea
            maxLength="1000"
            type="text"
            placeholder="관심 있는 분야, 이루고자 하는 목표, 전문성을 쌓기 위해 하고 있는 활동 등 본인을 설명하는 글을 자유롭게 작성해 보세요."
            className="profile-input intro-input"
            value={profile.introduction}
            onChange={(e) => handleChangeIntroduction(e.target.value)}
          />
        </div>
      </div>

      <div className="portf">
        <div className="portf-feature">포트폴리오</div>
        <div className="portf-lists">
          {profile.portfolio_links.map((p, index) => (
            <div key={index} className="portf-item">
              <span className="portf-description">
                <a href={p.portfolioLink} target="_blank">
                  {p.portfolioLink}
                </a>
              </span>
              <button
                type="button"
                className="profile-deleteBtn"
                onClick={() => handleRemovePortfolio(p.portfolioLink)}
              >
                X
              </button>
            </div>
          ))}

          <input
            type="text"
            placeholder="포트폴리오 링크를 추가해보세요."
            className="profile-input"
            value={newPortfolio}
            onChange={(e) => setNewPortfolio(e.target.value)}
          />
          <div
            className="portf-addPortfolio"
            onClick={() => handleAddPortfolio(true)}
          >
            + 추가하기
          </div>
        </div>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>저장되었습니다.</p>
            <button onClick={() => {
              setShowSuccessPopup(false);
              setIsSaveButtonActivate(false);
            }}>확인</button>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        className="profile-submitBtn"
        disabled={!isSaveButtonActivate}
      >
        저장
      </button>
    </form>
  );
}

export default ProfileSelf;
