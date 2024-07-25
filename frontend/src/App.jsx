import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewRegister from "./pages/NewRegister";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear(); // 저장된 token 정보 없애기
  return <Navigate to="/login/" />; // 로그인 페이지로 이동시키기
}

function RegisterAndLogout() {
  // register하면 정보 클리어 해줘야한대
  localStorage.clear();
  // return <Register />
  return <NewRegister />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            // Home은 로그인돼야 들어올 수 있다
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
