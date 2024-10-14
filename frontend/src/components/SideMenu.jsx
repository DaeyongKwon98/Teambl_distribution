import React, { useEffect, useState } from 'react';
import "../styles/SideMenu.css";
import { useNavigate } from 'react-router-dom';
import ConfirmPopUp from './ConfirmPopUp';
import api from '../api';

const SideMenu = ({ isOpen, setIsOpen, profileImage, userId }) => {

    const navigate = useNavigate();

    const [isMenuAnimating, setIsMenuAnimating] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const [userName, setUserName] = useState("");
    
    const handleAnimationEnd = () => {
        setIsMenuAnimating(false);
        if (!isOpen) {
            setIsOverlayVisible(false);
        }
    };

    /** get user name */
    const fetchUserName = async () => {
        try {
            const res = await api.get("/api/current-user/");
            setUserName(res.data.profile['user_name']);
        } catch(e) {
            console.log(e);
            setUserName("이름 수신에 실패했어요.");
        }
    };

    /** effects */
    useEffect(() => {
        fetchUserName();
    }, [userId]);

    useEffect(() => {
        setIsLogoutConfirmOpen(false);
        if (isOpen) {
            setIsMenuAnimating(true);
            setIsOverlayVisible(true);
        }
    }, [isOpen]);

    return (
        <>
        {
            isOverlayVisible && (!isLogoutConfirmOpen) &&
            <div
                className={`side-menu-container-overlay ${isOpen ? "fade-in" : "fade-out"}`}
                onAnimationEnd={handleAnimationEnd}
                onClick={() => setIsOpen(false)}
            >
                <div
                    className={
                        `side-menu-container`
                        + `${isMenuAnimating ? " slide-in" : ""}`
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    {/** profile image and name button */}
                    <div className='side-menu-top-container'>
                        {/** image */}
                        <img
                            src={profileImage}
                            className='side-menu-profile-image'
                        />
                        {/** name */}
                        <span className='side-menu-user-name'>
                            {userName}
                        </span>
                        {/** button */}
                        <button
                            className='side-menu-mypage-button'
                            onClick={() => {
                                setIsOpen(false);
                                navigate(`/profile/${userId}`);
                            }}    
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none">
                                <path d="M0.999999 13L7 7L0.999998 0.999999" stroke="#A8A8A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    {/** border bar */}
                    <div className='side-menu-border-bar'>
                        {/** no content */}
                    </div>
                    {/** buttons */}
                    <div className='side-menu-item-container'>
                        {/** my projects */}
                        <button
                            className='side-menu-item-button'
                            onClick={() => navigate(`/profile/${userId}?deft-route=project`)}
                        >
                            {"내 게시물"}
                        </button>
                        {/** my likes */}
                        <button className='side-menu-item-button'>
                            {"좋아요 한 게시물"}
                        </button>
                        {/** logout */}
                        <button
                            className='side-menu-item-button'
                            onClick={() => setIsLogoutConfirmOpen(true)}
                        >
                            {"로그아웃"}
                        </button>
                        {/** settings */}
                        <button
                            className='side-menu-item-button'
                            onClick={() => navigate('/setting')}
                        >
                            {"설정"}
                        </button>
                    </div>
                </div>
                
            </div>
        }
        {/** logout confirmation modal */}
        <ConfirmPopUp
            isOpen={isLogoutConfirmOpen}
            setIsOpen={setIsLogoutConfirmOpen}
            message={"로그아웃 하시겠어요?"}
            onConfirm={() => {
                localStorage.clear();
                navigate("/login");
            }}
            onReject={() => {
                setIsOpen(false);
            }}
            confirmLabel={"확인"}
            rejectLabel={"취소"}
        />
        </>
    );
};

export default SideMenu;