import React, { useState } from "react";
import UserSearchItem from "../components/UserSearchItem";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({ relationship: [], major: "" });
  const [users, setUsers] = useState([
    { name: "John Doe" },
    { name: "Jane Smith" },
    { name: "Alice Johnson" },
  ]);

  const handleSearch = () => {
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
    // Add search functionality here
    setUsers((prevUsers) => [...prevUsers, { name: "김진수" }]);
  };

  const handleRelationshipChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => {
      const newRelationship = prev.relationship.includes(value)
        ? prev.relationship.filter((item) => item !== value)
        : [...prev.relationship, value];
      return { ...prev, relationship: newRelationship };
    });
  };

  const handleMajorChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({ ...prev, major: value }));
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
        {recentSearches.length == 0 ? (
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
              value="1촌"
              onChange={handleRelationshipChange}
              checked={filters.relationship.includes("1촌")}
            />
            1촌
          </label>
          <label>
            <input
              type="checkbox"
              value="2촌"
              onChange={handleRelationshipChange}
              checked={filters.relationship.includes("2촌")}
            />
            2촌
          </label>
          <label>
            <input
              type="checkbox"
              value="3촌"
              onChange={handleRelationshipChange}
              checked={filters.relationship.includes("3촌")}
            />
            3촌
          </label>
        </div>
        <div>
          <h5>전공</h5>
          <input
            type="text"
            value={filters.major}
            onChange={handleMajorChange}
            placeholder="전공을 입력하세요"
          />
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
