import React, { useState } from "react";
import "../../styles/NewSearch.css";

// 필터에서 선택 가능한 전공 목록
const majors = [
  "물리학과",
  "수리과학과",
  "화학과",
  "나노과학기술대학원",
  "양자대학원",
  "생명과학과",
  "뇌인지과학과",
  "의과학대학원",
  "공학생물학대학원",
  "줄기세포및재생생물학대학원",
  "기계공학과",
  "항공우주공학과",
  "전기및전자공학부",
  "전산학부",
  "건설및환경공학과",
  "바이오및뇌공학과",
  "산업디자인학과",
  "산업시스템공학과",
  "생명화학공학과",
  "신소재공학과",
  "원자력및양자공학과",
  "반도체시스템공학과",
  "조천식모빌리티대학원",
  "김재철AI대학원",
  "녹색성장지속가능대학원",
  "반도체공학대학원",
  "인공지능반도체대학원",
  "메타버스대학원",
  "시스템아키텍트대학원",
  "디지털인문사회과학부",
  "문화기술대학원",
  "문술미래전략대학원",
  "과학기술정책대학원",
  "경영공학부",
  "기술경영학부",
  "KAIST경영전문대학원",
  "금융전문대학원",
  "경영자과정",
  "기술경영전문대학원",
  "글로벌디지털혁신대학원",
  "바이오혁신경영전문대학원",
  "융합인재학부",
  "안보과학기술대학원",
  "사이버안보기술대학원",
  "새내기과정학부",
];

const MajorPopUp = ({
  userSelectedMajors, // 유저가 검색 필터로 선택한 전공들
  handleMajorChange,
  setIsMajorPopupOpen,
  doSearchUsers,
  buttonText,
}) => {
  const [majorSearchTerm, setMajorSearchTerm] = useState("");

  // 전공 검색 필터링 함수
  const filteredMajors = majors.filter((major) =>
    major.includes(majorSearchTerm)
  );

  return (
    <>
      <div className="newSearch-major-popup">
        <div className="newSearch-major-popup-content">
          <div className="newSearch-major-popup-header">
            <h3>전공</h3>
            <input
              type="text"
              placeholder="전공을 검색해보세요"
              value={majorSearchTerm}
              onChange={(e) => setMajorSearchTerm(e.target.value)}
              className="newSearch-major-search-input"
            />
          </div>
          <div className="newSearch-major-popup-body">
            <ul>
              {majorSearchTerm === ""
                ? filteredMajors
                    .filter(
                      (major) =>
                        userSelectedMajors.includes(major) ||
                        ["전산학부", "전기및전자공학부"].includes(major)
                    )
                    .map((major, index) => (
                      <li
                        key={index}
                        className={`newSearch-major-item ${
                          userSelectedMajors.includes(major) ? "selected" : ""
                        }`}
                        onClick={() => handleMajorChange(major)}
                      >
                        {major}
                      </li>
                    ))
                : filteredMajors.map((major, index) => (
                    <li
                      key={index}
                      className={`newSearch-major-item ${
                        userSelectedMajors.includes(major) ? "selected" : ""
                      }`}
                      onClick={() => handleMajorChange(major)}
                    >
                      {major}
                    </li>
                  ))}
            </ul>
          </div>

          <div className="newSearch-major-popup-footer">
            <button
              className={`newSearch-result-button ${
                userSelectedMajors.length === 0 ? "zero" : ""
              }`}
              disabled={userSelectedMajors.length === 0}
              onClick={() => {
                setIsMajorPopupOpen(false);
                doSearchUsers();
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MajorPopUp;
