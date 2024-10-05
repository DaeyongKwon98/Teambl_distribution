import React, { useEffect, useState } from 'react';
import "../../styles/Project/FriendSelectPopUp.css";
import topBarIcon from "../../assets/popUpTopBar.svg";
import majorEdit from "../../assets/Profile/majorEdit.svg";

const FriendSelectPopUp = ({
    isPopUpOpen,
    setIsPopUpOpen,
    friendList,
    selectedFriendList,
    setSelectedFriendList,
    maxSelectedNum
}) => {

    const [currentSelectedFriendList, setCurrentSelectedFriendList] = useState([]);
    const [shownFriendList, setShownFriendList] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        setShownFriendList([]);
        setSearchKeyword("");
        setCurrentSelectedFriendList(JSON.parse(JSON.stringify(selectedFriendList)));
        setIsChanged(false);
    }, [isPopUpOpen, selectedFriendList]);

    useEffect(() => {
        setIsChanged(!isArraySame(selectedFriendList, currentSelectedFriendList));
    }, [selectedFriendList, currentSelectedFriendList]);

    useEffect(() => {
        let newList = [];
        if (searchKeyword !== "") {
            for (let i=0 ; i<friendList.length ; i++) {
                if (friendList[i]['user_name'].includes(searchKeyword)) {
                    let prevItem = currentSelectedFriendList.find(item => (item.id === friendList[i]['id']));
                    if (typeof prevItem === "undefined") {
                        /** add to the new list only not included previously */
                        newList.push(JSON.parse(JSON.stringify(friendList[i])));
                    }
                }
            }
        }
        newList = [...currentSelectedFriendList, ...newList];
        setShownFriendList(newList);
    }, [searchKeyword, currentSelectedFriendList]);

    /** utils */
    const toggleItem = async (value, index) => {
        if (typeof (currentSelectedFriendList.find(item => (item.id === value.id))) === "undefined") {
            await pushItem(value);
        } else {
            await popItem(index);
        }
    };

    const pushItem = async (value) => {
        if (currentSelectedFriendList.length < maxSelectedNum) {
            await setCurrentSelectedFriendList(prevList => {
                let newList = [...prevList];
                newList.push(value);
                return newList;
            });
        }
    };

    const popItem = async (index) => {
        await setCurrentSelectedFriendList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        });
    };

    /** array diff checker */
    const isArraySame = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;

        let serializedArr1 = arr1.map(item => {return item.id});
        let serializedArr2 = arr2.map(item => {return item.id});

        const sortedArr1 = [...serializedArr1].sort();
        const sortedArr2 = [...serializedArr2].sort();
    
        return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
    };

    return (
        <div
            className={'friendSelectPopUp-overlay-wrapper'}
            onClick={() => setIsPopUpOpen(false)}
        >
            <div
                className='friendSelectPopUp-overlay'
                onClick={(e) => e.stopPropagation()}
            >
                <div className="friendSelectPopUp-top">
                    <img
                        style={{
                        margin: '16px 0px 16px 0px'
                        }}
                        src={topBarIcon}
                        alt="top useless bar"
                    />
                </div>
                <div className="friendSelectPopUp-title-container">
                    <span className="friendSelectPopUp-title-lg">
                        {"일촌 태그"}
                    </span>
                </div>
                <div
                    className="friendSelectPopUp-search-container"
                    style={{
                        marginTop: '12px'
                    }}
                >
                    <img
                        src={majorEdit}
                        alt="전공 아이콘"
                        className="friendSelectPopUp-search-icon"
                    />
                    <input
                        type="text"
                        placeholder={"일촌 검색"}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="friendSelectPopUp-search-input"
                    />
                </div>
                <div
                    className="friendSelectPopUp-body"
                    style={{
                        marginTop : '16px'
                    }}  
                >
                    <div className="friendSelectPopUp-item-container">
                    {
                        (shownFriendList.length > 0) ?
                        shownFriendList.map((friendInfo, index) => (
                            <button
                                key={friendInfo.id}
                                className={`friendSelectPopUp-item ${
                                    typeof (currentSelectedFriendList.find(item => (item.id === friendInfo.id))) !== "undefined" ?
                                        "friendSelectPopUp-selected"
                                        :
                                        ""
                                }`}
                                onClick={() => {
                                    toggleItem(friendInfo, index);
                                }}
                            >
                                {friendInfo['user_name']}
                            </button>
                        ))
                            :
                        (searchKeyword !== "") && <p>검색된 일촌이 없습니다.</p>
                    }
                    </div>
                </div>
                {/** save button */}          
                <button
                    className={
                    "friendSelectPopUp-footer-btn" +
                    (
                        (isChanged &&  (currentSelectedFriendList.length > 0)) ?
                        ""
                        :
                        " friendSelectPopUp-btn-disabled"
                    )
                    }
                    onClick={async () => {
                        await setSelectedFriendList([...currentSelectedFriendList]);
                        await setIsPopUpOpen(false);
                    }}
                >
                    {"선택 완료"}
                </button>
            </div>
        </div>
    );
};

export default FriendSelectPopUp;