import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileDefaultImg from "../../assets/ProfileOther/defaultProfile.svg";
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import friendIcon from "../../assets/ProfileOther/friend.svg";
import "../../styles/ProfilePage/ProfileOther.css";
import api from "../../api";

const ProfileOther = ({ userId }) => {
  const [profile, setProfile] = useState({
    user_name: "",
    school: "",
    current_academic_degree: "",
    year: 0,
    major1: "",
    major2: "",
    one_degree_count: 0,
    introduction: "",
    image: profileDefaultImg,
    keywords: [],
    tools: [],
    experiences: [],
    portfolio_links: [],
  });
  const [paths, setPaths] = useState([]); // 여러 경로 상태 추가
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 오류 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile(userId);
    fetchUserPaths(userId);
  }, [userId]);

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/api/user/${userId}/`);
      setProfile(response.data.profile);
      setError(null); // 오류 상태 초기화
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("존재하지 않는 사용자입니다."); // 404 오류 메시지 설정
      } else {
        setError("사용자 정보를 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  // 모든 경로를 가져오는 함수
  const fetchUserPaths = async (userId) => {
    try {
      const response = await api.get(`/api/path/${userId}/`);
      setPaths(response.data.paths);
    } catch (error) {
      console.error("유저 경로를 불러오는 중 오류가 발생했습니다.", error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="profileOther-body">
        <div className="profileOther-container">
          <button className="profileOther-backbutton" onClick={() => window.history.back()}>
            <img src={backIcon} alt="back" />
          </button>
          <div className="profileOther-error">
            <h2>{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profileOther-body">
      <div className="profileOther-container">
        <button className="profileOther-backbutton" onClick={() => window.history.back()}>
          <img src={backIcon}></img>
        </button>

        <div className="profileOther-top">
          <div className="profileOther-profile-image">
            <img
              src={profile.image ? profile.image : profileDefaultImg}
              alt="Profile Image"
            />
          </div>

          <div className="profileOther-profile-detail">
            <div className="profileOther-profile-row1">
              <div className="profileOther-profile-name">
                {profile.user_name}
              </div>
              <div className="profileOther-profile-one_degree_count">
                <div className="profileOther-profile-one_degree_count-icon">
                  <img src={friendIcon} />
                </div>
                <div>1촌 {profile.one_degree_count}명</div>
              </div>
            </div>
            <div className="profileOther-profile-row2">
              {profile.school} | {profile.current_academic_degree} |{" "}
              {profile.year}
              학번
            </div>
            <div className="profileOther-profile-row3">
              {profile.major1}
              {profile.major2 && profile.major2.trim() !== "" && `, ${profile.major2}`}
            </div>
          </div>
        </div>

        <div className="profileOther-title">경로</div>
        <div className="profileOther-path">
          {paths.length === 0 ? (
            <div>경로를 찾을 수 없습니다.</div>
          ) : (
            paths.map((path, index) => (
              <div key={index}>
                경로 {index + 1}: {path.join(" → ")}
              </div>
            ))
          )}
        </div>

        <div className="profileOther-keywords">
          {profile.keywords.map((keyword, index) => (
            <div className="profileOther-keyword" key={index}>
              {keyword}
            </div>
          ))}
        </div>

        <div className="profileOther-title">경험</div>
        <div className="profileOther-experiences">
          {profile.experiences.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 경험을 아직 입력하지 않았어요.
            </div>
          ) : (
            profile.experiences.map((experience, index) => (
              <div className="profileOther-list-element" key={index}>
                {experience.experience}
              </div>
            ))
          )}
        </div>

        <div className="profileOther-title">툴</div>
        <div className="profileOther-tools">
          {profile.tools.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 툴을 아직 입력하지 않았어요.
            </div>
          ) : (
            profile.tools.map((tool, index) => (
              <div className="profileOther-list-element" key={index}>
                {tool.tool}
              </div>
            ))
          )}
        </div>

        <div className="profileOther-title">소개</div>
        <div className="profileOther-introduction">
          {profile.introduction.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 소개를 아직 입력하지 않았어요.
            </div>
          ) : (
            <div className="profileOther-list-element">
              {profile.introduction}
            </div>
          )}
        </div>

        <div className="profileOther-title">포트폴리오</div>
        <div className="profileOther-protfolioLinks">
          {profile.portfolio_links.length === 0 ? (
            <div className="profileOther-list-element">
              상대방이 포트폴리오를 아직 입력하지 않았어요.
            </div>
          ) : (
            profile.portfolio_links.map((portfolio_links, index) => (
              <div className="profileOther-list-element" key={index}>
                {portfolio_links.portfolioLink}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOther;
