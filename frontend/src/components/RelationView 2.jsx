import React, { useEffect, useState, useRef, useCallback } from 'react';
import "../styles/RelationView.css";

/** 
 * 시작점, 출발점, 관계 사이의 사람들의 이름, 촌수를 받아 관계를 렌더린하는 컴포넌트
 * (스크롤 관련 애니메이션 및 포커싱 구현)
 * 
 * @param {String} fromName 출발점 사람의 이름 (본인)
 * @param {String} toName 도착점 사람의 이름
 * @param {Array} relationList 사이 사람들의 리스트 (1촌 또는 4촌 이상인 경우 무시됨 / 2촌인 경우 이름들의 리스트, 3촌인 경우 [이름, 이름]들의 리스트)
 * @param {Number} chon 출발점과 도착점 사이의 촌수
 * @param {Boolean} isLoading 로딩 표시 여부
*/
function RelationView({ fromName, toName, relationList, chon, isLoading }) {

    const [selectedItem, setSelectedItem] = useState(-1); /* 현재로써 선택 이후 다른 작업은 안함 */
    const containerRef = useRef(null); /* scroll container의 현재 스크롤 좌표를 저장하는 ref */
    const isTouchingRef = useRef(false); /* 터치 중(스크롤 중)임을 확인하는 ref */

    /* debounce for delayed event handle */
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    /* scroll event handler (will be debounced) */
    const handleScroll = () => {
        if (isTouchingRef.current) return; /* when touching, no event handler */

        /* auto snap */
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / 30); /* 30px : height of the item */
        setSelectedItem(index);
        containerRef.current.scrollTo({
            top: index * 30, /* move to the correct position */
            behavior: "smooth",
        });
    };

    /* debounced event handler */
    const debouncedHandleScroll = useCallback(debounce(handleScroll, 150), []);

    /* scroll(touch) event handler */
    const handleTouchStart = () => {
        isTouchingRef.current = true; /* start touch */
    };

    const handleTouchEnd = () => {
        isTouchingRef.current = false; /* end touch */
        debouncedHandleScroll(); /* auto scrolling (snap) */
    };

    /* scroll event listener initialization */
    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            container.addEventListener("touchstart", handleTouchStart);
            container.addEventListener("touchend", handleTouchEnd);
        }

        /* prevent memory leak */
        return () => {
            if (container) {
                container.removeEventListener("touchstart", handleTouchStart);
                container.removeEventListener("touchend", handleTouchEnd);
            }
        };
    }, []);

    /* default relationship selection & scroll */
    useEffect(() => {
        let defaultSelectedItem = -1;
        if (relationList && (relationList.length > 0)) {
            if (relationList.length <= 2) {
                /* when only one or two bridges, the first one */
                defaultSelectedItem = 0;
            } else if (relationList.length >= 3) {
                /* when over three bridges, the second one */
                defaultSelectedItem = 1;
            }
        } else {
            defaultSelectedItem = -1;
        }
        if (containerRef.current && (defaultSelectedItem >= 0)) {
            containerRef.current.scrollTo({
              top: defaultSelectedItem * 30,
              behavior: "smooth",
            });
        }
        setSelectedItem(defaultSelectedItem);
    }, [relationList]);

    if (isLoading) {
        return (
            <div className='relation-view-main-container with-height-140'>
                <div className='relation-view-loader-container'>
                    <div className='relation-view-loader'>
                    </div>
                </div>
            </div>
        );
    }
    if (chon <= 1) {
        throw new Error("\"RelationView\"에 전달된 촌수는 1보다 커야 합니다.");
    }
    if (chon > 3) {
        return (
            <div className='relation-view-main-container'>
                {/** title area */}
                <div className='relation-view-title-container'>
                    <span className='relation-view-title with-blue'>
                        {"3명 이상"}
                    </span>
                    <span className='relation-view-title'>
                        {"을 거쳐야 하므로 관계도를 표시하지 않습니다."}
                    </span>
                </div>
                {/** relationship view area */}
                <div className='relation-view-content-area with-top-margin-8'>
                    <div className='relation-view-name-container from-flex-end'>
                        <span className='relation-view-name'>
                            {fromName}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 158 2" fill="none" className='with-left-margin-12'>
                            <path d="M1 1L157 0.999986" stroke="#2546F3" stroke-linecap="round" stroke-dasharray="20 20" stroke-width="4"/>
                        </svg>
                    </div>
                    {/** white area */}
                    <div
                        className={'relation-view-highlight-area-lg'}
                    >
                        {/** no content */}
                    </div>
                    <div
                        className={'relation-view-scroll-container-lg'}
                    >
                        {/** question mark */}
                        <div className='scroll-item'>
                            {/** dummy : Empty char -> "ㅤ" (NOT a space!) */}
                            {"ㅤ"}
                        </div>
                        <div className='scroll-item relation-view-qmark'>
                            {"?"}
                        </div>
                        <div className='scroll-item'>
                            {/** dummy : Empty char -> "ㅤ" (NOT a space!) */}
                            {"ㅤ"}
                        </div>
                    </div>
                    <div className='relation-view-name-container'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 158 2" fill="none" className='with-right-margin-12'>
                            <path d="M1 1L157 0.999986" stroke="#2546F3" stroke-linecap="round" stroke-dasharray="20 20" stroke-width="4"/>
                        </svg>
                        <span className='relation-view-name'>
                            {toName}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className='relation-view-main-container'>
            {/** title area */}
            <div className='relation-view-title-container'>
                <span className='relation-view-title with-bold'>
                    {fromName}
                </span>
                <span className='relation-view-title'>
                    {"님과 "}
                </span>
                <span className='relation-view-title with-bold'>
                    {toName}
                </span>
                <span className='relation-view-title'>
                    {"님은 "}
                </span>
                <span className='relation-view-title with-blue'>
                    {(chon - 1) + "명"}
                </span>
                <span className='relation-view-title'>
                    {"을 거치면 아는 사이입니다."}
                </span>
            </div>
            {/** relationship view area */}
            <div className='relation-view-content-area with-top-margin-8'>
                <div className='relation-view-name-container from-flex-end'>
                    <span className='relation-view-name'>
                        {fromName}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 158 2" fill="none" className='with-left-margin-12'>
                        <path d="M1 1L157 0.999986" stroke="#2546F3" stroke-linecap="round" stroke-dasharray="20 20" stroke-width="4"/>
                    </svg>
                </div>
                {/** white area */}
                <div
                    className={
                        (chon === 2) ?
                            'relation-view-highlight-area-sm'
                        :
                            'relation-view-highlight-area-lg'
                    }
                >
                        {/** no content */}
                    </div>
                <div
                    className={
                        (chon === 2) ?
                            'relation-view-scroll-container-sm'
                        :
                            'relation-view-scroll-container-lg'
                    }
                    ref={containerRef}
                    onScroll={debouncedHandleScroll}
                >
                    {/** scroll view area */}
                    <div className='scroll-item'>
                        {/** dummy for scroll : Empty char -> "ㅤ" (NOT a space!) */}
                        {"ㅤ"}
                    </div>
                    {
                        relationList.map((relation, index) => {
                            if (chon === 2) {
                                return (
                                    <div
                                        className='scroll-item'
                                        key={index}
                                        style={
                                            (selectedItem === index) ?
                                                {
                                                    opacity: 1
                                                }
                                            :
                                                {}
                                        }
                                    >
                                        {relation}
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        className='scroll-item'
                                        key={index}
                                        style={
                                            (selectedItem === index) ?
                                                {
                                                    opacity: 1
                                                }
                                            :
                                                {}
                                        }
                                    >
                                        <span>
                                            {relation[0]}
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="10"
                                            height="2"
                                            viewBox="0 0 10 2"
                                            fill="none"
                                            style={
                                                (selectedItem === index) ?
                                                    {
                                                        opacity: 1
                                                    }
                                                :
                                                    {}
                                            }
                                        >
                                            <path d="M1 1H9" stroke="black" stroke-linecap="round"/>
                                        </svg>
                                        <span>
                                            {relation[1]}
                                        </span>
                                    </div>
                                );
                            }
                        })
                    }
                    <div className='scroll-item'>
                        {/** dummy for scroll : Empty char -> "ㅤ" (NOT a space!) */}
                        {"ㅤ"}
                    </div>
                </div>
                <div className='relation-view-name-container'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 158 2" fill="none" className='with-right-margin-12'>
                        <path d="M1 1L157 0.999986" stroke="#2546F3" stroke-linecap="round" stroke-dasharray="20 20" stroke-width="4"/>
                    </svg>
                    <span className='relation-view-name'>
                        {toName}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default RelationView;