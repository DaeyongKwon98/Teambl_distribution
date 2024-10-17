import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/PasswordChange.css";
import SingleLineInputWithTitle from './SingleLineInputWithTitle';
import api from '../api';
import PrimeButton from './PrimeButton';
import ConfirmPopUp from './ConfirmPopUp';
import MessagePopUp from './MessagePopUp';

const PasswordChange = () => {

    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    /** data states */
    const [prevPasswd, setPrevPasswd] = useState("");
    const [afterPasswd, setAfterPasswd] = useState("");
    const [reAfterPasswd, setReAfterPasswd] = useState("");

    /** meta states */
    const [isPrevPasswdValid, setIsPrevPasswdValid] = useState(true);
    const [isAfterPasswdVerified, setIsAfterPasswdVerified] = useState(false);

    /** loading */
    const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /** modal */
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    /** info message */
    const infoMessageContent = useMemo(() => {
        if (isPasswordVerificationLoading) {
            return "";
        }
        if (prevPasswd === "") {
            return "";
        } else {
            if (!isPrevPasswdValid) {
                return {
                    "status" : "bad",
                    "message" : "현 비밀번호가 일치하지 않습니다"
                };
            } else {
                if ((afterPasswd === "") || (afterPasswd === "")) {
                    return "";
                } else {
                    if (isAfterPasswdVerified) {
                        return {
                            "status" : "good",
                            "message" : "비밀번호가 일치합니다"
                        };
                    } else {
                        return {
                            "status" : "bad",
                            "message" : "비밀번호가 일치하지 않습니다"
                        };
                    }
                }
            }
        }
    }, [isPrevPasswdValid, isAfterPasswdVerified, isPasswordVerificationLoading]);

    /** checkers */
    const checkCurrentPasswd = async () => {
        await setIsPasswordVerificationLoading(true);
        try {
            const response = await api.post("/api/check-password/", {
              password: prevPasswd,
            });

            if (response.status === 200) {
                await setIsPrevPasswdValid(true);
                return true;
            } else {
                await setIsPrevPasswdValid(false);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 400) {
                await setIsPrevPasswdValid(false);
                return false;
            } else {
                console.error("비밀번호를 확인하는데 오류가 발생했습니다.", error);
                if (error.response) {
                    console.error("Error response data:", error.response.data);
                }
                await setIsPrevPasswdValid(false);
                return false;
            }
        } finally {
            await setIsPasswordVerificationLoading(false);
        }
    };

    /** handler */
    const postNewPasswordQuestion = async () => {
        if (isPasswordVerificationLoading) {
            return;
        }
        if (isLoading) {
            return;
        }
        if (!isAfterPasswdVerified) {
            return;
        }

        const res = await checkCurrentPasswd();
        if (res) {
            await setIsMessageModalOpen(true);    
        }
    };

    const postNewPassword = async () => {
        await setIsMessageModalOpen(false);
        await setIsLoading(true);
        try {
            await api.patch("/api/change-password/", {
                new_password: afterPasswd,
            });

            /** logout */
            localStorage.clear();
            navigate("/login");
        } catch (error) {
            await setIsFailModalOpen(true);
            console.error("Password change failed:", error);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        setIsAfterPasswdVerified(afterPasswd === reAfterPasswd);
    }, [afterPasswd, reAfterPasswd]);

    return (
        <div className='password-ch-container'>
            {/** prev password */}
            <SingleLineInputWithTitle
                title={"현 비밀번호"}
                value={prevPasswd}
                setValue={setPrevPasswd}
                type={"password"}
            />
            {/** new password */}
            <SingleLineInputWithTitle
                title={"새 비밀번호"}
                value={afterPasswd}
                setValue={setAfterPasswd}
                type={"password"}
                styleOv={{
                    marginTop: '8px'
                }}
            />
            {/** new password verification */}
            <SingleLineInputWithTitle
                title={"새 비밀번호 확인"}
                value={reAfterPasswd}
                setValue={setReAfterPasswd}
                type={"password"}
                isInfoView={true}
                infoMessage={infoMessageContent.message}
                infoStatus={infoMessageContent.status}
                styleOv={{
                    marginTop: '8px'
                }}
            />
            {/** button */}
            <PrimeButton
                text={"저장"}
                onClickCallback={async () => await postNewPasswordQuestion()}
                isActive={!(isLoading || isPasswordVerificationLoading)}
                isLoading={isLoading || isPasswordVerificationLoading}
                styleOv={{
                    marginTop: '18px'
                }}
            />
            {/** confirm modal */}
            <ConfirmPopUp
                isOpen={isMessageModalOpen}
                setIsOpen={setIsMessageModalOpen}
                message={"정말 비밀번호를 변경하시겠어요?"}
                onConfirm={postNewPassword}
                onReject={() => setIsMessageModalOpen(false)}
                confirmLabel={"확인"}
                rejectLabel={"취소"}
            />
            {/** fail message */}
            {
                isFailModalOpen &&
                <MessagePopUp
                    setIsOpen={setIsFailModalOpen}
                    message={"비밀번호 변경에 실패했어요."}
                    subMessages={["서버 상의", "오류가 발생했습니다."]}
                />
            }
        </div>
    );
};

export default PasswordChange;