import React from "react";
import "../styles/NewProject/NewProject.css";
import project_link_icon from "../assets/NewProject/project_link_icon.svg"
import project_report_icon from "../assets/NewProject/project_report_icon.svg"

// 바텀 시트 컴포넌트
const BottomSheet = ({ onClose, onLinkCopy, onReport }) => {
    const handleOverlayClick = (event) => {
        // 바텀 시트 외부 영역을 클릭한 경우에만 onClose 호출
        if (event.target.classList.contains("project-bottom-sheet-overlay")) {
        onClose();
        }
    };
    return (
        <div className="project-bottom-sheet-overlay" onClick={handleOverlayClick}>
        <div className="project-bottom-sheet">
            <div className="project-bottom-sheet-handle"></div>
            <div className="project-bottom-sheet-options">
            <button className="project-bottom-sheet-link" onClick={onLinkCopy}>
                <img className="project-bottom-sheet-link-icon" src={project_link_icon} alt="Link"/>
                링크 복사
            </button>
            <button className="project-bottom-sheet-report" onClick={onReport}>
                <img className="project-bottom-sheet-report-icon" src={project_report_icon} alt="Report"/>
                신고
            </button>
            </div>
        </div>
        </div>
    );
};

export default BottomSheet;