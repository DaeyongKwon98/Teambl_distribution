import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import profileImg from "../assets/Profile/student.png";
import friendIcon from "../assets/Profile/friend.png";
import "../styles/Profile.css";
import "../styles/ExperienceList.css";
import "../styles/IntroductionForm.css";
import "../styles/Tool.css";
import "../styles/Portfolio.css";
import api from "../api";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = { ...location.state };
  const { userId } = useParams(); // userId를 URL에서 가져오기

  const [user_name, setUserName] = useState("");
  const [school, setSchool] = useState("");
  const [current_academic_degree, setCurrentAcademicDegree] = useState("");
  const [year, setYear] = useState("");
  const [major1, setMajor1] = useState("");
  const [major2, setMajor2] = useState("");
  const [one_degree_count, setOneDegreeCount] = useState("");

  const [image, setImage] = useState(profileImg);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [tagFull, setTagFull] = useState(false);

  const [experiences, setExperiences] = useState([]);
  const [newExperience, setNewExperience] = useState("");

  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState("");

  const [introduction, setIntroduction] = useState("");
  const [savedIntroduction, setSavedIntroduction] = useState("");

  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState("");

  const [tagVisible, setTagVisible] = useState(false);
  const [experienceVisible, setExperienceVisible] = useState(false);
  const [toolVisible, setToolVisible] = useState(false);
  const [introductionVisible, setIntroductionVisible] = useState(false);
  const [portfVisible, setPortfVisible] = useState(false);

  const [prevPage, setPrevPage] = useState(userInfo.prevPage);

  const [isOwner, setIsOwner] = useState(false); // 본인 프로필인지 확인

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (tags.length >= 5) setTagFull(true);
  }, [tags]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/api/profile/${userId}/`); // userId에 해당하는 프로필 가져오기
      console.log(response.data); 
      const currentUserResponse = await api.get("/api/current-user/");
      const currentUserId = currentUserResponse.data.id;
      
      if (currentUserId === parseInt(userId, 10)) {
        setIsOwner(true); // 본인 프로필이면 true로 설정
      } else {
        setIsOwner(false); // 다른 사용자의 프로필이면 false로 설정
      }
      
      if (prevPage === "editprofile") {
        setUserName(userInfo.user_name);
        setSchool(userInfo.school);
        setCurrentAcademicDegree(userInfo.current_academic_degree);
        setYear(userInfo.year);
        setMajor1(userInfo.major1);
        setMajor2(userInfo.major2);
      } else {
        setUserName(response.data.user_name || "");
        setSchool(response.data.school || "");
        setCurrentAcademicDegree(response.data.current_academic_degree || "");
        setYear(response.data.year || "");
        setMajor1(response.data.major1 || "");
        setMajor2(response.data.major2 || "");
      }

      const oneDegreeCount = await fetchFriendCount();
      setOneDegreeCount(oneDegreeCount);

      if (response.data.keywords.length != 0) {
        setTags([...response.data.keywords]);
      }
      if (response.data.experiences.length != 0)
        setExperiences(response.data.experiences);
      if (response.data.tools.length != 0)
        setTools(response.data.tools);
      if (response.data.introduction)
        setIntroduction(response.data.introduction);
      if (response.data.portfolio_links.length != 0)
        setPortfolios(response.data.portfolio_links);
    } catch (error) {
      console.error("Failed to fetch current user profile:", error);
    }
  };

  const handleBack = () => {
    navigate("/");
  };
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

  const handleAddTag = () => {
    if (newTag) {
      setTags([...tags, newTag]);
      setNewTag("");
      setTagVisible(false);
    }
  };

  const handleCancel = () => {
    setNewTag("");
    setTagVisible(false);
  };

  const handleTagDelete = (index) => {
    const newtags = tags.filter((_, i) => i !== index);
    setTags(newtags);
  };

  function handleEdit() {
    navigate("/editprofile", {
      state: {
        userId: userId,
        user_name: user_name,
        school: school,
        current_academic_degree: current_academic_degree,
        year: year,
        major1: major1,
        major2: major2,
      },
    });
  }
  const handleAddExperience = () => {
    if (newExperience) {
      setExperiences([...experiences, { experience: newExperience }]);
      setNewExperience("");
      setExperienceVisible(false);
      // console.log(experiences)
    }
  };

  /* const handleExperienceCancel = () => {
    setNewExperience('');
    setExperienceVisible(false);
  }; */

  const handleExperienceDelete = (index) => {
    const newExps = experiences.filter((_, i) => i !== index);
    setExperiences(newExps);
  };

  const handleAddTool = () => {
    if (newTool) {
      setTools([...tools, { tool: newTool }]);
      setNewTool("");
      setToolVisible(false);
    }
  };

  const handleToolCancel = () => {
    setNewTool("");
    setToolVisible(false);
  };

  const handleToolDelete = (index) => {
    const newtools = tools.filter((_, i) => i !== index);
    setTools(newtools);
  };

  const handleIntroductionSave = () => {
    setSavedIntroduction(introduction);
    setIntroductionVisible(false);
  };

  const handleAddPortfolio = () => {
    if (newPortfolio) {
      setPortfolios([...portfolios, { portfolioLink: newPortfolio }]);
      setNewPortfolio("");
      setPortfVisible(false);
    }
  };

  const handlePortfolioCancel = () => {
    setNewPortfolio("");
    setPortfVisible(false);
  };

  const handlePortfolioDelete = (index) => {
    const newportfs = portfolios.filter((_, i) => i !== index);
    setPortfolios(newportfs);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/api/profile/update/", {
        user_name,
        school,
        current_academic_degree,
        year,
        major1,
        major2,
        one_degree_count: one_degree_count,
        introduction: introduction,
        experiences,
        tools,
        portfolio_links: portfolios,
        keywords: tags,
      });
      const newUser = response.data;
      console.log("Profile update successfully:", newUser);
      navigate(`/profile/${userId}`);
    } catch (error) {
      alert("프로필 업데이트 실패");
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="profile">
      <div className="profile-back">
        <button type="button" onClick={handleBack}></button>
      </div>
      <h4>{isOwner ? "내 프로필" : "프로필"}</h4>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-imageContainer" {...getRootProps()}>
            <img src={image} alt="Profile" onClick={handleImageClick} />
            <input
              {...getInputProps()}
              id="fileInput"
              type="file"
              style={{ display: "none" }}
            />
          </div>
          <div className="profile-info">
            <div className="profile-name">
              <h2>{user_name}</h2>
              {isOwner && (<button className="profile-editBtn" onClick={handleEdit}></button>)}
            </div>
            <div className="profile-line"></div>
            <pre>{school + " | " + year + " | " + current_academic_degree}</pre>
            <pre>{major1}{major2 && `, ${major2}`}</pre>
            <div className="profile-friend">
              <img src={friendIcon} alt="friend-icon" />
              <span className="profile-oneDegree">{`1촌 ${one_degree_count}명`}</span>
            </div>
          </div>
        </div>
        <div className="profile-tags">
          <div className="profile-feature">
            키워드
            {isOwner && (<label className="profile-definition">
              본인을 나타내는 키워드를 입력해보세요. (최대5개)
            </label>)}
          </div>
          {tags.map((tag, index) => (
            <span key={index} className="profile-tag">
              {tag}
              {isOwner && (<button
                className="profile-deleteBtn"
                type="button"
                onClick={() => handleTagDelete(index)}
              >X</button>)}
            </span>
          ))}
          {tagVisible && (
            <div className="profile-tagInput">
              <input
                type="text"
                placeholder="태그"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button onClick={handleAddTag}>추가</button>
              <button onClick={handleCancel}>삭제</button>
            </div>
          )}
          {isOwner && !tagFull && !tagVisible && (
            <span
              className="profile-addTag"
              onClick={() => setTagVisible(true)}
            >
              + 추가
            </span>
          )}
        </div>
      </div>

      <div className="ex">
        <div className="ex-feature">
          경험
          {/* <label className='ex-definition'>본인의 경험을 추가해보세요.</label> */}
        </div>
        <div className="ex-lists">
          {experiences.length > 0 ? (experiences.map((exp, index) => (
            <div key={index} className="ex-item">
              <span className="ex-description">{exp.experience}</span>
              {/* <span className="ex-period">{exp.period}</span> */}
              {isOwner && (<button
                className="profile-deleteBtn"
                onClick={() => handleExperienceDelete(index)}
              >X</button>)}
            </div>
          ))) : (<div className="ex-item">-</div>)}
          {isOwner && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="tool">
        <div className="tool-feature">
          툴
          {/* <label className='tool-definition'>본인이 다룰 수 있는 툴을 추가해보세요.</label> */}
        </div>
        <div className="tool-lists">
          {tools.length > 0 ? (tools.map((t, index) => (
            <div key={index} className="tool-item">
              <span className="tool-description">{t.tool}</span>
              {/* <span className="tool-period">{exp.period}</span> */}
              {isOwner && (<button
                className="profile-deleteBtn"
                onClick={() => handleToolDelete(index)}
              >X</button>)}
            </div>
          ))) : (<div className="tool-item">-</div>)}
          {isOwner && (
            <>
              <input
                maxLength="20"
                type="text"
                placeholder="본인이 다룰 수 있는 툴을 추가해보세요."
                className="profile-input"
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
              />
              <div
                className="tool-addTool"
                onClick={() => handleAddTool(true)}
              >
                + 추가하기
              </div>
            </>
          )}
        </div>
      </div>

      <div className="introduction-form">
        <div className="intro-feature">소개</div>
        <div className="saved-introduction">
          <textarea
            maxLength="100"
            type="text"
            placeholder="관심 있는 분야, 이루고자 하는 목표, 전문성을 쌓기 위해 하고 있는 활동 등 본인을 설명하는 글을 자유롭게 작성해 보세요."
            className="profile-input intro-input"
            value={introduction || (isOwner ? "" : "-")}
            onChange={(e) => setIntroduction(e.target.value)}
            disabled={!isOwner}
          />
        </div>
      </div>

      <div className="portf">
        <div className="portf-feature">
          포트폴리오
          {/* <label className='portf-definition'>포트폴리오 링크를 추가해보세요.</label> */}
        </div>
        <div className="portf-lists">
          {portfolios.length > 0 ? (portfolios.map((p, index) => (
            <div key={index} className="portf-item">
              <span className="portf-description">
                <a href={p.portfolioLink} target="_blank">
                  {p.portfolioLink}
                </a>
              </span>
              {/* <span className="portf-period">{exp.period}</span> */}
              {isOwner && (<button
                className="profile-deleteBtn"
                onClick={() => handlePortfolioDelete(index)}
              >X</button>)}
            </div>
          ))) : (<div className="portf-item">-</div>)}

          {isOwner && (
            <>
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
            </>
          )}
        </div>
      </div>

      {isOwner && (<button type="submit" className="profile-submitBtn">
        저장
      </button>)}
    </form>
  );
}

export default Profile;
