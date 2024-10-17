import React, { useEffect, useMemo, useState } from 'react';
import "../styles/DeleteUser.css";
import InfoMessage from './InfoMessage';
import ConfirmPopUp from './ConfirmPopUp';
import MessagePopUp from './MessagePopUp';
import SingleLineInputWithTitle from './SingleLineInputWithTitle';
import PrimeButton from './PrimeButton';
import api from '../api';

const DeleteUser = () => {

    const [passwd, setPasswd] = useState("");

    const [isPrevPasswdValid, setIsPrevPasswdValid] = useState(null);
    
    const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    const infoMessageContent = useMemo(() => {
        if (passwd === "") {
            return "";
        }
        if (isLoading || isPasswordVerificationLoading) {
            return "";
        }
        if (isPrevPasswdValid == null) {
            return "";
        }
       
        if (!isPrevPasswdValid) {
            return {
                "status": "bad",
                "message": "비밀번호가 일치하지 않습니다"
            };
        } else {
            return {
                "status": "good",
                "message": "비밀번호가 일치합니다"
            };
        }
    });

    /** checkers */
    const checkCurrentPasswd = async () => {
        await setIsPasswordVerificationLoading(true);
        try {
            const response = await api.post("/api/check-password/", {
              password: passwd,
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

    /** save */
    const deleteUserWrapper = async () => {
        if (isLoading || isPasswordVerificationLoading) {
            return;
        }

        /** check password */
        const res = await checkCurrentPasswd();
        if (res) {
            await setIsConfirmModalOpen(true);
        }
    };

    const deleteUser = async () => {
        await setIsLoading(true);
        try {
            await api.delete("/api/delete-user/");
            
            /** success */
            localStorage.clear();
            navigate("/login");
        } catch (e) {
            console.log(e);
            setIsFailModalOpen(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        setIsPrevPasswdValid(null);
    }, [passwd]);

    return (
        <div className='delete-user-container'>
            {/** new password verification */}
            <SingleLineInputWithTitle
                title={"현 비밀번호"}
                value={passwd}
                setValue={setPasswd}
                type={"password"}
                isInfoView={true}
                infoMessage={infoMessageContent.message}
                infoStatus={infoMessageContent.status}
            />
            {/** button */}
            <PrimeButton
                text={"회원 탈퇴"}
                onClickCallback={async () => await deleteUserWrapper()}
                isActive={!(isLoading || isPasswordVerificationLoading)}
                isLoading={isLoading || isPasswordVerificationLoading}
                styleOv={{
                    marginTop: '18px'
                }}
            />
            {/** confirmation */}
            <ConfirmPopUp
                isOpen={isConfirmModalOpen}
                setIsOpen={setIsConfirmModalOpen}
                message={"정말 회원 탈퇴하시겠어요?"}
                onConfirm={async () => {
                    await setIsConfirmModalOpen(false);
                    await deleteUser();
                }}
                onReject={() => setIsConfirmModalOpen(false)}
                confirmLabel={"확인"}
                rejectLabel={"취소"}
            />
            {/** fail */}
            {
                isFailModalOpen &&
                <MessagePopUp
                    setIsOpen={setIsFailModalOpen}
                    message={"회원 탈퇴에 실패했어요."}
                    subMessages={["서버 상의", "오류가 발생했습니다."]}
                />
            }
        </div>
    );
};

export default DeleteUser;