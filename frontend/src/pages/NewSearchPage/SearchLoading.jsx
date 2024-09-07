import React from "react";
import "../../styles/SearchLoading.css";

const SearchLoading = () => {
  return (
    <div className="searchloading-body">
      <div className="searchloading-title">유저를 검색중입니다.</div>
      <div className="searchloading-text">조금만 기다려주세요.</div>
    </div>
  );
};

export default SearchLoading;
