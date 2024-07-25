// import Form from "../components/Form";

// function Register() {
//   return <Form route="/api/user/register/" method="register" />;
// }

// export default Register;

import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [user_name, setUser_Name] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState(2024);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/user/register/", {
        username,
        password,
        profile: {
          user_name,
          major,
          year,
          keywords: keywords.map((keyword) => ({ keyword })),
        },
      });
      // 회원가입에 성공한 경우, 로그인 화면으로 가기
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const addKeyword = () => {
    if (keywords.length < 3 && keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    } else if (keywords.length >= 3) {
      alert("You can only add up to 3 keywords.");
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        placeholder="Email"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Name"
        value={user_name}
        onChange={(e) => setUser_Name(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Major"
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="입학 Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
        min="1900"
        max={new Date().getFullYear()} // 현재 연도까지 입력 가능
      />
      <label htmlFor="keywords">Keywords (add up to 3):</label>
      <br />
      <input
        type="text"
        id="keywordInput"
        name="keywordInput"
        value={keywordInput}
        onChange={(e) => setKeywordInput(e.target.value)}
      />
      <button type="button" onClick={addKeyword}>
        Add Keyword
      </button>
      <ul>
        {keywords.map((keyword, index) => (
          <li key={index}>
            {keyword}{" "}
            <button type="button" onClick={() => removeKeyword(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
