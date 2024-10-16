import React from 'react';
import "../styles/Setting2.css";
import backIcon from "../assets/Profile/left-arrow.svg";
import TitleAndContentToggle from '../components/TitleAndContentToggle';
import MessagePopUp from '../components/MessagePopUp';
import PasswordChange from '../components/PasswordChange';
import InquirySend from '../components/InquirySend';
import DeleteUser from '../components/DeleteUser';
import PolicyView from '../components/PolicyView';

/**
 * 
 * 새로운 디자인(UX progess 3)에 맞춰 제작한 새로운 설정 화면입니다.
 * 
 */
const Setting2 = () => {

    /** go back handler */
	const handleBackButton = () => {
		window.history.back();
	};

    return (
        <div className='setting2-body'>
            <div className="setting2-container">
				{/** Backward button */}
				<div className="setting2-backward-btn-container">
				  <button
					className="setting2-backbutton"
					onClick={() => handleBackButton()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			</div>
            {/** Title */}
			<div className='setting2-title-container'>
				{"설정"}
			</div>
            <div className='setting2-container setting2-mt-22'>
                <TitleAndContentToggle
                    title={"비밀번호 변경"}
                >
                    <PasswordChange />
                </TitleAndContentToggle>
                <div className='trans-border'>
                    {/* no content */}
                </div>
                <TitleAndContentToggle
                    title={"문의하기"}
                >
                    <InquirySend />
                </TitleAndContentToggle>
                <div className='trans-border'>
                    {/* no content */}
                </div>
                <TitleAndContentToggle
                    title={"회원 탈퇴"}
                >
                    <DeleteUser />
                </TitleAndContentToggle>
                <div className='trans-border'>
                    {/* no content */}
                </div>
                <TitleAndContentToggle
                    title={"약관 및 정책"}
                >
                    <PolicyView />
                </TitleAndContentToggle>
            </div>
        </div>
    );
};

export default Setting2;