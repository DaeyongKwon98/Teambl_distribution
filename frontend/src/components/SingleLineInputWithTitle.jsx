import React from 'react';
import "../styles/SingleLineInputWithTitle.css";
import InfoMessage from './InfoMessage';

/**
 * A single line input field (text), including title and info-message
 * 
 * @param {title} string 
 * @param {value} string
 * @param {setValue} function
 * @param {type} string The type of "input" tag ("text" or "password")
 * @optional @param {isInfoView} boolean If you want to use info-message, this field must be true.
 * @optional @param {infoMessage} string
 * @optional @param {infoStatus} string A state of the information message ("good" or "bad")
 * @optional @param {styleOv} object CSS style object that will be override to the outmost "div".
 * @optional @param {onBlurCallback} function A callback when onBlur.
 * 
 */
const SingleLineInputWithTitle = ({ title, value, setValue, type, isInfoView, infoMessage, infoStatus, styleOv, onBlurCallback }) => {

    const validInfoStatus = ["good", "bad"];

    return (
        <>
            <div
                className='sl-input-container'
                style={styleOv ? styleOv : {}}
            >
                <div className='sl-input-title'>
                    {title}
                </div>
                <div className='sl-input-box-container'>
                    <input
                        className='sl-input-box'
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        type={type}
                        onBlur={
                            onBlurCallback ?
                                onBlurCallback
                                :
                                () => {}
                        }
                    />
                </div>
            </div>
            {
                isInfoView &&
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginTop: '4px'
                    }}
                >
                    <div
                        style={{
                            width: '65%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center'
                        }}
                    >
                        {
                            (infoMessage != null) && (validInfoStatus.includes(infoStatus)) ?
                                <InfoMessage
                                    type={infoStatus}
                                    message={infoMessage}
                                />
                                :
                                <div
                                    style={{
                                        width: '100%',
                                        height: '10.5px',
                                        marginTop: '4px'
                                    }}
                                >
                                    {/** empty space */}
                                </div>
                        }
                    </div>
                </div>
            }
        </>
    );
};

export default SingleLineInputWithTitle;