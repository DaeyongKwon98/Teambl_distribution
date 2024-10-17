import React, { useState } from "react";
import "../../styles/NewProject/NewProject.css";
import projectsettingIcon from "../../assets/NewProject/project_setting_icon.svg";
import projectcommentsIcon from "../../assets/NewProject/project_comments_icon.svg";
import projectlikesIcon from "../../assets/NewProject/project_likes_icon.svg";
import projectlinkIcon from "../../assets/NewProject/project_link_icon.svg"
import projectreportIcon from "../../assets/NewProject/project_report_icon.svg"
import ProfileComponent from "../../components/ProfileComponent";

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
          <button className="project-bottom-sheet-link">
            <img className="project-bottom-sheet-link-icon" src={projectlinkIcon} alt="Link" onClick={onLinkCopy}/>
            링크 복사
          </button>
          <button className="project-bottom-sheet-report">
            <img className="project-bottom-sheet-report-icon" src={projectreportIcon} alt="Report" onClick={onReport}/>
            신고
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ profileImage, authorName, major1, major2, school, postDate, onSettingClick }) => (
  <div className="project-profile-section">
    <div className="project-profile-info-container">
      <img src={profileImage} alt="profile" className="project-profile-img" />
      <div className="project-profile-info">
        <div className="project-author-name">{authorName}</div>
        <div className="project-major-school-date">{major1} {major2}・{school}・{postDate}</div>
      </div>
    </div>
    <button className="project-setting-button" onClick={onSettingClick}>
      <img className="project-setting-button-icon" src={projectsettingIcon} alt="setting"/>
    </button>
  </div>
);

const Tags = ({ tags }) => (
  <div className="project-tags-section">
    {tags.map((tag, index) => (
      <span key={index} className="project-tag">
        {tag}
      </span>
    ))}
  </div>
);

const Description = ({ description, contactInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className="project-description-section"
        style={{
          maxHeight: isExpanded ? "none" : `100px`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <p>{description}</p>
        {!isExpanded && (
          <div className="project-gradient-overlay" >
            <button className="project-expand-button" onClick={toggleExpand}>
              전체 보기
            </button>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="project-contact-info-section">
          <strong>연락처</strong> {contactInfo}
        </div>
      )}
    </div>
  );
};

const ImageSection = ({ postImages }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const totalWidth = e.target.scrollWidth;
    const visibleWidth = e.target.clientWidth;
    const index = Math.round((scrollLeft / (totalWidth - visibleWidth)) * (postImages.length - 1));
    setCurrentImageIndex(index);
  };

  return (
    <div className="project-image-section">
      <div className="project-scrollable-image-container" onScroll={handleScroll}>
        {postImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Post ${index + 1}`}
            className="project-post-img"
          />
        ))}
      </div>
      <div className="project-image-index">
        {currentImageIndex + 1} / {postImages.length}
      </div>
    </div>
  );
};

// 리엑션 섹션
const Reactions = ({ participants, likes, comments, onCommentsClick }) => {
  const displayedParticipants = participants.slice(0, 2);
  const remainingParticipants = participants.length - displayedParticipants.length;

  return (
    <div className="project-reactions-section">
      <div className="project-participants-container">
        <strong>함께하는 멤버: </strong>
        {displayedParticipants.map((participant, index) => (
          <img
            key={index}
            src={participant.profileImage}
            alt={participant.name}
            className="project-participant-img"
          />
        ))}
        {remainingParticipants > 0 && (
          <span className="project-remaining-participants">외 {remainingParticipants}명</span>
        )}
      </div>
      <div className="project-reactions-container">
        <div className="project-likes-container">
          <img className="project-likes" src={projectlikesIcon} alt="likes" />
          {likes}
        </div>
        <div className="project-comments-container" onClick={onCommentsClick}>
          <img className="project-comments" src={projectcommentsIcon} alt="comments" />
          {comments}
        </div>
      </div>
    </div>
  );
};

// 댓글 섹션
const CommentSection = ({ comments, setComments }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingToCommentIndex, setReplyingToCommentIndex] = useState(null);

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

  // 답글 추가 함수
  const handleSendComment = () => {
    if (commentText.trim()) {
      if (replyingToCommentIndex === null) {
        const newComment = {
          author: "현재 유저",
          text: commentText,
          date: "방금 전",
          profileImage: "현재 유저 이미지",
          replies: [],
        };
        setComments((prevComments) => [...prevComments, newComment]);
      } else {
        const newReply = {
          author: "현재 유저",
          text: commentText,
          date: "방금 전",
          profileImage: "현재 유저 이미지",
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

  return (
    <div className="project-comment-section">
      <div className="project-add-comment" onClick={handleAddCommentClick}>
        <img src="현재 유저 이미지" alt="me" className="project-my-profile-img" />
        <input type="text" placeholder="댓글 작성하기..." />
      </div>
      {comments.map((comment, index) => (
        <div key={index} className="project-comment">
          <img src={comment.profileImage} alt={comment.author} className="project-comment-profile-img" />
          <div className="project-comment-content">
            <div className="project-comment-header">
              <span className="project-comment-author">{comment.author}</span>
              <span className="project-comment-date">{comment.date}</span>
            </div>
            <div className="project-comment-text">{comment.text}</div>
            <div className="project-reply-button" onClick={() => handleReplyClick(index)}>
              답글 달기
            </div>
            {/* 답글 출력 부분 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="project-replies">
                {comment.replies.map((reply, replyIndex) => (
                  <div key={replyIndex} className="project-reply">
                    <img src={reply.profileImage} alt={reply.author} className="project-reply-profile-img" />
                    <div className="project-reply-content">
                      <div className="project-reply-header">
                        <span className="project-reply-author">{reply.author}</span>
                        <span className="project-reply-date">{reply.date}</span>
                      </div>
                      <div className="project-reply-text">{reply.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
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
            <button onClick={handleSendComment} className="project-send-comment-button">
              {replyingToCommentIndex === null ? "댓글추가" : "답글추가"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 메인 컴포넌트
const Project = ({ postData }) => 
  {
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [comments, setComments] = useState(postData.commentsData); // 댓글 상태 관리
  
    const toggleComments = () => {
      setCommentsVisible(!commentsVisible);
    };

    const toggleBottomSheet = () => {
      setBottomSheetVisible(!bottomSheetVisible);
    };
  
    const handleLinkCopy = () => {
      // 링크 복사 기능 구현
      navigator.clipboard.writeText("복사할 링크").then(() => {
        alert("링크가 복사되었습니다!");
      });
      toggleBottomSheet(); // 바텀 시트 닫기
    };
  
    const handleReport = () => {
      // 신고 기능 구현
      alert("신고가 접수되었습니다.");
      toggleBottomSheet(); // 바텀 시트 닫기
    };

    return (
      <div className="new-project">
        <ProfileComponent
          profileImage={postData.profileImage}
          authorName={postData.authorName}
          major1={postData.major1}
          major2={postData.major2}
          school={postData.school}
          postDate={postData.postDate}
          onSettingClick={toggleBottomSheet}
        />
        <div className="project-title">{postData.title}</div>
        <Tags tags={postData.tags} />
        <Description 
          description={postData.description} 
          contactInfo={postData.contactInfo}
        />
        <ImageSection postImages={postData.postImages} />
        <Reactions 
          participants={postData.participants} 
          likes={postData.likes} 
          comments={comments.length}
          onCommentsClick={toggleComments}
        />
        {commentsVisible && (
          <CommentSection comments={comments} setComments={setComments} />
        )}
        {bottomSheetVisible && (
          <BottomSheet 
            onClose={toggleBottomSheet} 
            onLinkCopy={handleLinkCopy} 
            onReport={handleReport}
          />
        )}
      </div>
    );
  };

export default Project;
