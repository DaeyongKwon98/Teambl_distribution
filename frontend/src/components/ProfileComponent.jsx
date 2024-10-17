import React from "react";
import "../styles/NewProject/NewProject.css";
import project_setting_icon from "../assets/NewProject/project_setting_icon.svg";

// 시간을 상대적인 형식으로 변환하는 함수
const timeAgo = (postDate) => {
    const now = new Date();
    const post = new Date(postDate);
    const diffInSeconds = Math.floor((now - post) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}초 전`;
    } else if (diffInSeconds < 3600) { // 1시간 미만
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        return `${diffInMinutes}분 전`;
    } else if (diffInSeconds < 86400) { // 1일 미만
        const diffInHours = Math.floor(diffInSeconds / 3600);
        return `${diffInHours}시간 전`;
    } else { // 1일 이상
        const diffInDays = Math.floor(diffInSeconds / 86400);
        return `${diffInDays}일 전`;
    }
};

const ProfileComponent = ({ profileImage, authorName, major1, major2, school, postDate, onSettingClick }) => (
    <div className="project-profile-section">
        <div className="project-profile-info-container">
            <img src={profileImage} alt={`${authorName}'s profile`} className="project-profile-img" />
            <div className="project-profile-info">
                <div className="project-author-name">{authorName}</div>
                <div className="project-major-school-date">
                    {major1} {major2}・{school}・{timeAgo(postDate)}
                </div>
            </div>
        </div>
        <button
            className="project-setting-button"
            onClick={onSettingClick}
            aria-label="Project settings"
        >
            <img className="project-setting-button-icon" src={project_setting_icon} alt="settings" />
        </button>
    </div>
);

export default ProfileComponent;