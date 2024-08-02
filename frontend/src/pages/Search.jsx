import React, { useState } from "react";
import UserSearchItem from "../components/UserSearchItem";
import api from "../api"; // Axios 인스턴스 import
import "../styles/Search.css";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [majorInput, setMajorInput] = useState("");
  const [filters, setFilters] = useState({ relationshipDegree: [], major: [] });
  const [users, setUsers] = useState([]);

  const handleSearch = async () => {
    setUsers([]);

    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }

    try {
      console.log("Search Query:", searchQuery);
      console.log("Relationship Degree Filters:", filters.relationshipDegree);
      console.log("Major Filters:", filters.major);

      const response = await api.post("/api/search/", {
        q: searchQuery,
        degree: filters.relationshipDegree,
        major: filters.major,
      });

      console.log(response.data);

      setUsers(response.data);
    } catch (error) {
      console.error("검색 중 오류가 발생했습니다.", error);
    }
  };

  const handleRelationshipDegreeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters((prev) => {
      const newRelationshipDegree = prev.relationshipDegree.includes(value)
        ? prev.relationshipDegree.filter((item) => item !== value)
        : [...prev.relationshipDegree, value];
      return { ...prev, relationshipDegree: newRelationshipDegree };
    });
  };

  const addMajor = () => {
    if (majorInput.trim() && !filters.major.includes(majorInput)) {
      setFilters((prev) => {
        return { ...prev, major: [...prev.major, majorInput] };
      });
      setMajorInput("");
    } else if (filters.major.includes(majorInput)) {
      alert("이미 있는 전공입니다.");
    }
  };

  const resetMajor = () => {
    setFilters((prev) => {
      return { ...prev, major: [] };
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button onClick={handleSearch}>검색하기</button>
      </div>

      <div>
        <h3>최근 검색 기록</h3>
        {recentSearches.length === 0 ? (
          <div>최근 검색기록이 없습니다.</div>
        ) : (
          <ul>
            {recentSearches.map((search, index) => (
              <li key={index}>{search}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div>
          <h5>촌수</h5>
          <label>
            <input
              type="checkbox"
              value={1}
              onChange={handleRelationshipDegreeChange}
              checked={filters.relationshipDegree.includes(1)}
            />
            1촌
          </label>
          <label>
            <input
              type="checkbox"
              value={2}
              onChange={handleRelationshipDegreeChange}
              checked={filters.relationshipDegree.includes(2)}
            />
            2촌
          </label>
          <label>
            <input
              type="checkbox"
              value={3}
              onChange={handleRelationshipDegreeChange}
              checked={filters.relationshipDegree.includes(3)}
            />
            3촌
          </label>
        </div>
        <div>
          <h5>전공</h5>
          <div className="major-list">
            {filters.major.map((major) => (
              <div key={major} className="major-element">
                {major}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={majorInput}
            onChange={(e) => {
              setMajorInput(e.target.value);
            }}
            placeholder="전공을 입력하세요"
          />
          <button onClick={addMajor}>전공 추가</button>
          <button onClick={resetMajor}>전공 초기화</button>
        </div>
      </div>

      <div>
        <h3>검색 결과</h3>
        <ul>
          {users.map((user, index) => (
            <UserSearchItem
              user={user}
              onAddRelationShip={() => {}}
              key={index}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Search;
