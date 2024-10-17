import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/NewProject/NewProject.css";

const CommentSection = ({ project, comments, setComments, currentUser }) => {
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [replyingToCommentIndex, setReplyingToCommentIndex] = useState(null);
    const [profileImages, setProfileImages] = useState({});

    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");

    const filteredComments = comments.filter(comment => comment.parent_comment === null);
    console.log("filteredComments:", filteredComments);

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

    // 모든 댓글의 작성자 프로필 이미지를 불러오는 useEffect
    useEffect(() => {
        const fetchAllProfileImages = async () => {
            const imagePromises = comments.map(async (comment) => {
                const profileImage = await fetchProfileImage(comment.user);
                return { [comment.user]: profileImage };
            });

            const imagesArray = await Promise.all(imagePromises);
            const imagesObject = imagesArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
            setProfileImages(imagesObject); // 프로필 이미지를 상태에 저장
        };

        fetchAllProfileImages();
    }, [comments]);
    
    const handleAddCommentClick = () => {
        setReplyingToCommentIndex(null); // 새 댓글을 추가할 때 답장 상태 재설정
        setShowCommentInput(true);
    };

    const handleReplyClick = (commentIndex) => {
        setReplyingToCommentIndex(commentIndex); // 답장할 댓글 설정
        setShowCommentInput(true);
    };

    const handleOverlayClick = () => {
        setShowCommentInput(false);
        setReplyingToCommentIndex(null); // 입력 닫기 및 응답 상태 재설정
    };

    // 댓글 작성 함수
    const submitComment = () => {
        if (!commentText.trim()) return;
    
        // Determine the parent comment ID
        let parentCommentId = null;
    
        // If replying to a comment, get its parent or self ID
        if (replyingToCommentIndex !== null) {
            const replyingToComment = comments.find(comment => comment.id === replyingToCommentIndex);
            parentCommentId = getParentCommentId(replyingToComment); // Set parent_comment to the ID of the comment being replied to
        }
    
        // Create the payload with content and parent_comment
        const payload = {
            content: commentText,
            parent_comment: parentCommentId,
        };
    
        api.post(`/api/projects/${project.project_id}/comments/create/`, payload)
            .then((res) => {
                // Update comments list immediately
                if (parentCommentId) {
                    // If it's a reply, find the comment it replies to
                    setComments((prevComments) => {
                        const updatedComments = [...prevComments];
                        const commentIndex = updatedComments.findIndex(comment => comment.id === parentCommentId);
                        if (commentIndex !== -1) {
                            // Push the new reply into the replies array of the parent comment
                            updatedComments[commentIndex].replies = [...(updatedComments[commentIndex].replies || []), res.data];
                        }
                        return updatedComments;
                    });
                } else {
                    // It's a regular comment
                    setComments((prevComments) => [...prevComments, res.data]);
                }
                setCommentText(""); // Clear the input field
                setShowCommentInput(false); // Hide the input field
                setReplyingToCommentIndex(null); // Reset replying state
            })
            .catch((err) => {
                console.error("Failed to submit comment", err);
            });
    };

    // 댓글 수정 함수
    const updateComment = (commentId) => {
        if (!editContent.trim()) return;
        api.patch(`/api/comments/${commentId}/edit/`, { content: editContent })
            .then((res) => {
                setComments(comments.map((comment) => (comment.id === commentId ? res.data : comment)));
                setEditingComment(null);
                setEditContent("");
            })
            .catch((err) => console.error(err));
    };

    // 댓글 삭제 함수
    const deleteComment = (commentId) => {
        api.delete(`/api/comments/${commentId}/delete/`)
            .then(() => setComments(comments.filter((comment) => comment.id !== commentId)))
            .catch((err) => console.error(err));
    };

    // 답글 추가 함수
    const handleSendComment = () => {
        if (commentText.trim()) {
        if (replyingToCommentIndex === null) {
            const newComment = {
            author: "현재 유저",
            text: commentText,
            date: "방금 전",
            profileImage: currentUser.profile.image,
            replies: [],
            };
            setComments((prevComments) => [...prevComments, newComment]);
        } else {
            const newReply = {
            author: "현재 유저",
            text: commentText,
            date: "방금 전",
            profileImage: currentUser.profile.image,
            };
            setComments((prevComments) => {
            const updatedComments = [...prevComments];
            updatedComments[replyingToCommentIndex].replies.push(newReply);
            return updatedComments;
            });
        }
        setCommentText("");
        setShowCommentInput(false);
        setReplyingToCommentIndex(null);
        }
    };
    
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

    const getParentCommentId = (comment) => {
        console.log("COMMENT:", comment);
        return comment.parent_comment ? comment.parent_comment : comment.id;
    };

    // Helper function to render comments and their replies recursively
    const renderComments = (commentList) => {
        return commentList.map((comment) => (
            <div key={comment.id} className="project-comment">
                <img src={profileImages[comment.user]} alt={comment.user_name} className="project-comment-profile-img" />
                <div className="project-comment-content">
                    <div className="project-comment-header">
                        <span className="project-comment-author">{comment.user_name}</span>
                        <span className="project-comment-date">{timeAgo(comment.created_at)}</span>
                    </div>
                    {editingComment === comment.id ? (
                        <div>
                            <textarea
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="project-comment-edit-input"
                            />
                            <button 
                                onClick={() => updateComment(comment.id)} 
                                className="project-comment-update-button"
                            >
                                수정 완료
                            </button>
                            <button 
                                onClick={() => setEditingComment(null)} 
                                className="project-comment-cancel-edit-button"
                            >
                                취소
                            </button>
                        </div>
                    ) : (
                        <div className="project-comment-text">{comment.content}</div>
                    )}
                    <div className="project-comment-actions">
                        <div 
                            className="project-reply-button" 
                            onClick={() => {
                                const parentCommentId = getParentCommentId(comment);
                                console.log("Reply to comment ID:", parentCommentId);
                                handleReplyClick(parentCommentId);
                            }}
                        >
                            답글 달기
                        </div>

                        {currentUser && currentUser.id === comment.user && (
                            <div className="project-comment-buttons">
                                <button 
                                    onClick={() => {
                                        setEditingComment(comment.id);
                                        setEditContent(comment.content);
                                    }} 
                                    className="project-comment-edit-button"
                                >
                                    수정
                                </button>
                                <button 
                                    onClick={() => deleteComment(comment.id)} 
                                    className="project-comment-delete-button"
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Render replies recursively */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="project-replies">
                            {renderComments(comment.replies)} {/* Recursive call */}
                        </div>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="project-comment-section">
            <div className="project-add-comment" onClick={handleAddCommentClick}>
                <img src={currentUser.profile.image} alt={`${currentUser.profile.user_name}'s profile`} className="project-my-profile-img" />
                <input 
                    type="text" 
                    placeholder="댓글 작성하기..." 
                    value={commentText} // Ensure the input is controlled
                    onChange={(e) => setCommentText(e.target.value)} // Update state on input change
                />
            </div>
            {renderComments(filteredComments)}
            {/* 댓글 작성하기 */}
            {showCommentInput && (
                <div className="project-overlay" onClick={handleOverlayClick}>
                    <div
                        className="project-comment-input-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <textarea
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={replyingToCommentIndex === null ? "댓글 작성하기..." : "답글 작성하기..."}
                            className="project-comment-input"
                        />
                        <button onClick={submitComment} className="project-send-comment-button">
                            {replyingToCommentIndex === null ? "댓글 추가" : "답글 추가"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommentSection;
