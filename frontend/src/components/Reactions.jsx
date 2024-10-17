import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/NewProject/NewProject.css";
import project_comments_icon from "../assets/NewProject/project_comments_icon.svg";
import project_likes_icon from "../assets/NewProject/project_likes_icon.svg";
import project_liked_icon from "../assets/NewProject/project_liked_icon.svg";

const Reactions = ({ participants = [], likes, comments, onCommentsClick, likesClick, liked }) => {
    const displayedParticipants = participants.slice(0, 2);
    const remainingParticipants = participants.length - displayedParticipants.length;

    const [participantImages, setParticipantImages] = useState({});

    // 특정 사용자의 프로필을 가져오는 함수
    const fetchProfileImage = async (userId) => {
        try {
            const res = await api.get(`/api/profile/${userId}/`);
            return res.data.image; // 사용자 프로필 이미지 반환
        } catch (error) {
            console.error(`Failed to fetch profile for user ${userId}`, error);
            return null; // 실패 시 기본 이미지 반환
        }
    
    };

    // 참가자들의 프로필 이미지를 불러오는 useEffect
    useEffect(() => {
        const fetchAllProfileImages = async () => {
            const imagePromises = participants.map(async (participant) => {
                const image = await fetchProfileImage(participant.id);
                return { [participant.id]: image };
            });

            const images = await Promise.all(imagePromises);
            const imageMap = images.reduce((acc, curr) => ({ ...acc, ...curr }), {});
            setParticipantImages(imageMap); // 프로필 이미지를 상태에 저장
        };

        fetchAllProfileImages();
    }, [participants]);

    return (
        <div className="project-reactions-section">
            <div className="project-participants-container">
                <strong>함께하는 멤버: </strong>
                {displayedParticipants.map((participant, index) => (
                    <img
                        key={index}
                        src={participantImages[participant.id]}
                        alt={participant.profile.user_name}
                        className="project-participant-img"
                    />
                ))}
                {remainingParticipants > 0 && (
                    <span className="project-remaining-participants">외 {remainingParticipants}명</span>
                )}
            </div>
            <div className="project-reactions-container">
                <div className="project-likes-container">
                    <img
                        className="project-likes"
                        src={liked ? project_liked_icon : project_likes_icon}
                        alt="likes"
                        onClick={likesClick}
                        style={{ cursor: "pointer", zIndex: 1 }} // 클릭 가능하도록 포인터 설정
                    />
                    {likes}
                </div>
                <div className="project-comments-container" onClick={onCommentsClick}>
                    <img className="project-comments" src={project_comments_icon} alt="comments" />
                    {comments}
                </div>
            </div>
        </div>
    );
};

export default Reactions;