import React, { useEffect, useState } from 'react';
import "../styles/InquirySend.css";
import PrimeButton from './PrimeButton';
import api from '../api';
import MessagePopUp from './MessagePopUp';

/** Teaml email */
const TEAMBLE_EMAIL = "contact.teambl.net";

const InquirySend = () => {

    const [currentUserInfo, setCurrentUserInfo] = useState({});
    const [content, setContent] = useState("");    

    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    /** fetch current user data */
    const fetchCurrentUser = async () => {
        await setIsDataLoading(true);
        try {
            const res = await api.get("/api/current-user/");
            await setCurrentUserInfo(res.data);
        } catch(e) {
            console.log(e);
            await setCurrentUserInfo({
                email : "정보 수신에 실패했어요"
            });
        } finally {
            await setIsDataLoading(false);
        }
    };

    /** save */
    const postNewInquiry = async () => {
        if (isLoading || isDataLoading || (content === "")) {
            return;
        }
        await setIsLoading(true);
        try {
            await api.post("/api/send-inquiry-email/", {
                from_email: currentUserInfo.email,
                body: content,
            });
            await setContent("");
            await setIsSuccessModalOpen(true);
        } catch (e) {
            await setIsFailModalOpen(true);
            console.log(e);
        } finally {
            await setIsLoading(false);
        }
    }

    /** effects */
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <div className='inq-send-container'>
            {/** from to view */}
            <div className='inq-send-email-container'>
                {`받는 사람: ${TEAMBLE_EMAIL}`}
            </div>
            <div className='inq-send-email-container inq-send-with-mt-8'>
                {`보내는 사람: ${currentUserInfo.email ? currentUserInfo.email : ""}`}
            </div>
            {/** textarea */}
            <textarea
                className='inq-send-textarea inq-send-with-mt-12'
                placeholder={"문의 사항은 빠른 시일 내에 답변 드리겠습니다.\n답변은 회원 가입한 이메일로 전송됩니다."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            {/** button */}
            <PrimeButton
                text={"문의하기"}
                onClickCallback={postNewInquiry}
                isActive={!(isLoading || isDataLoading || (content === ""))}
                isLoading={isLoading || isDataLoading}
                styleOv={{
                    marginTop: '32px'
                }}
            />
            {/** modals */}
            {
                isFailModalOpen &&
                <MessagePopUp
                    setIsOpen={setIsFailModalOpen}
                    message={"문의 등록에 실패했어요."}
                    subMessages={["서버 상의", "오류가 발생했습니다."]}
                />
            }
            {
                isSuccessModalOpen &&
                <MessagePopUp
                    setIsOpen={setIsSuccessModalOpen}
                    message={"문의가 정상적으로 접수되었습니다."}
                    subMessages={["확인하여 빠른 시일 내에", "답변 드리겠습니다.", "감사합니다."]}
                />
            }
        </div>
    );
};

export default InquirySend;