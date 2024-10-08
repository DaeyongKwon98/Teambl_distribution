import React from 'react';
import "../styles/MessagePopUp.css";

const MessagePopUp = ({ setIsOpen, message, confirmCallback }) => {
    return (
        <div
            className='messagePopUp-overlay'
            onClick={(e) => {
                setIsOpen(false);
                e.stopPropagation();
            }}
        >
            <div
                className='messagePopUp-content'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='messagePopUp-message-container'>
                    {message}
                </div>
                <button
                    className='messagePopUp-confirm-btn'
                    onClick={async () => {
                        await setIsOpen(false)
                        if (confirmCallback != null) {
                            await confirmCallback();
                        }
                    }}
                >
                    {"확인"}
                </button>
            </div>
        </div>
    );
};

export default MessagePopUp;