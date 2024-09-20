import React, { useState, useEffect } from "react";
import "../styles/FriendOtherItem.css";
import ProfileDefaultImg from "../assets/default_profile_image.svg";
import { useNavigate } from "react-router-dom";

export default function FriendOtherItem({ friendInfo }) {

    const navigate = useNavigate();

    return (
        <div
            className="friendOtherItem-container"
            onClick={() => {
                navigate(`/profile/${friendInfo['id']}`);
            }}
        >
            {/** profile image */}
            <div className="friendOtherItem-profile-image-container">
                <img
                    src={friendInfo?.image || ProfileDefaultImg}
                    alt={friendInfo?.user_name}
                    className="friendOtherItem-profile-image"
                />
            </div>
            {/** information : name, school, department */}
            <div className="friendOtherItem-info-container">
                <span className="friendOtherItem-name">
                    {friendInfo.user_name}
                </span>
                <div className="friendOtherItem-basic-info-container">
                    <span className="friendOtherItem-info right-margin-10px">
                        {friendInfo.school}
                    </span>
                    <span className="friendOtherItem-info font-12px">
                        {"|"}
                    </span>
                    <span className="friendOtherItem-info right-margin-10px left-margin-10px">
                        {friendInfo.current_academic_degree}
                    </span>
                    <span className="friendOtherItem-info font-12px">
                        {"|"}
                    </span>
                    <span className="friendOtherItem-info left-margin-10px">
                        {`${friendInfo.year % 100}학번`}
                    </span>
                </div>
                <div className="friendOtherItem-basic-info-container">
                    <span
                        className={
                            (friendInfo.major2) && (friendInfo.major2 !== "") ?
                                "friendOtherItem-info right-margin-3px"
                                :
                                "friendOtherItem-info"
                        }
                    >
                        {friendInfo.major1}
                    </span>
                    {
                        (friendInfo.major2) && (friendInfo.major2 !== "") &&
                        <>
                            <span className="friendOtherItem-info left-margin-3px right-margin-3px">
                                {"・"}
                            </span>
                            <span
                                className={"friendOtherItem-info left-margin-3px"}
                            >
                                {friendInfo.major2}
                            </span>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}