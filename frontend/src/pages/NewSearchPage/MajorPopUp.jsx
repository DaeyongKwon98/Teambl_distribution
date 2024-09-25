import React, { useState, useMemo, useEffect } from "react";
import "../../styles/NewSearch.css";
import majorEdit from "../../assets/Profile/majorEdit.svg";
import topBarIcon from "../../assets/popUpTopBar.svg";

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
  isMajorPopupOpen,
  setIsMajorPopupOpen,
  userSelectedMajors, // 유저가 검색 필터로 선택한 전공들
  handleMajorChange,
  doSearchUsers,
  buttonText,
}) => {

  const [selectedMajors, setSelectedMajors] = useState(
    userSelectedMajors || []
  );
  const [majorSearchTerm, setMajorSearchTerm] = useState(""); // 전공 검색어 상태 추가
  const [isChanged, setIsChanged] = useState(false);

  /** initialize */
  useEffect(() => {
    setSelectedMajors(userSelectedMajors || []);
    setMajorSearchTerm("");
    setIsChanged(false);
  }, [isMajorPopupOpen]);

  useEffect(() => {
    setIsChanged(!isArraySame(userSelectedMajors, selectedMajors));
  }, [userSelectedMajors, selectedMajors]);
  
  /** array diff checker */
  const isArraySame = (arr1, arr2) => {
    console.log(arr1);
    console.log(arr2);
    if (arr1.length !== arr2.length) return false;

    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
  
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
  };

  // 전공 선택 및 해제 함수
  const toggleMajorSelection = (major) => {
    if (selectedMajors.includes(major)) {
      setSelectedMajors(selectedMajors.filter((m) => m !== major));
    } else {
      if (selectedMajors.length < 2) {
        setSelectedMajors([...selectedMajors, major]);
      } else {
        alert("전공은 최대 2개까지 선택할 수 있습니다.");
      }
    }
  };

  const saveSelectedMajors = () => {
    handleMajorChange(selectedMajors);
    setIsMajorPopupOpen(false);
  };

  // 전공 검색 필터링 함수
  const filteredMajors = useMemo(() => {
    let newFilteredMajors = majors.filter((major) => {
      // majorSearchTerm이 비어 있을 경우 선택된 전공을 보여줌
      if (majorSearchTerm.length === 0) {
        return selectedMajors.includes(major);
      }

      // majorSearchTerm이 있을 경우 검색어에 맞는 전공 또는 이미 선택된 전공을 보여줌
      return (
        major.toLowerCase().includes(majorSearchTerm.replace(" ", "").toLowerCase()) ||
        selectedMajors.includes(major)
      );
    });
    /** 이미 선택된 전공은 맨 앞으로 이동 */
    newFilteredMajors = newFilteredMajors.filter(tempMajor => {
      return !(selectedMajors.includes(tempMajor));
    });
    newFilteredMajors = [...selectedMajors, ...newFilteredMajors];
    return newFilteredMajors;
  }, [majorSearchTerm, selectedMajors]);

  const removeMajor = (major) => {
    setSelectedMajors(selectedMajors.filter((m) => m !== major));
  };

  if (!isMajorPopupOpen) {
    return <></>;
  }

  return (
    <div
      className={`newSearch-major-pop-up-overlay-wrapper`}
      onClick={() => setIsMajorPopupOpen(false)}
    >
      <div
        className="newSearch-major-pop-up-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="newSearch-pop-up-top">
          <img
            style={{
              margin: '16px 0px 16px 0px'
            }}
            src={topBarIcon}
            alt="top useless bar"
          />
        </div>
        <div className="newSearch-major-pop-up-title-container">
            <span className="newSearch-major-pop-up-title-lg">
              {"전공"}
            </span>
            <span className="newSearch-major-pop-up-title-sm newSearch-major-pop-up-with-lmargin-16">
              {"최대 두 개까지 선택할 수 있습니다."}
            </span>
        </div>
        <div
          className="newSearch-major-search-container"
          style={{
            marginTop: '12px'
          }}
        >
            <img
              src={majorEdit}
              alt="전공 아이콘"
              className="newSearch-major-search-icon"
            />
            <input
              type="text"
              placeholder={"전공 검색"}
              value={majorSearchTerm}
              onChange={(e) => setMajorSearchTerm(e.target.value)}
              className="newSearch-major-search-input"
            />
          </div>
          <div
            className="newSearch-major-popup-body"
            style={{
              marginTop : '16px'
            }}  
          >
            <div className="newSearch-major-popup-item-container">
              {filteredMajors.length > 0
                ? filteredMajors.map((major, index) => (
                    <button
                      key={index}
                      className={`newSearch-major-popup-item ${
                        selectedMajors.includes(major) ? "major-selected" : ""
                      }`}
                      onClick={() => {
                        toggleMajorSelection(major);
                      }}
                    >
                      {major}
                    </button>
                  ))
                : majorSearchTerm && <p>검색된 전공이 없습니다.</p>}
            </div>
          </div>
          {/** save button */}          
          <button
            className={
              "newSearch-major-popup-footer-btn" +
              (
                (isChanged &&  (selectedMajors.length > 0)) ?
                ""
                :
                " major-popup-btn-disabled"
              )
            }
            onClick={saveSelectedMajors}
          >
            {buttonText}
          </button>
      </div>
    </div>
  );
};

export default MajorPopUp;
