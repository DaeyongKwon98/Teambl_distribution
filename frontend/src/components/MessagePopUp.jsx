import React from 'react';
import "../styles/MessagePopUp.css";

const MessagePopUp = ({ setIsOpen, message, subMessages, confirmCallback }) => {
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
                {
                    (subMessages != null) &&
                    <div className='messagePopUp-sub-message-container'>
                        {
                            subMessages.map((message, index) => {
                                return (
                                    <span
                                        key={index}
                                        className='messagePopUp-sub-message'
                                    >
                                        {message}
                                    </span>
                                );
                            })
                        }
                    </div>
                }
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