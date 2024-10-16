import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "./pages/Start";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Certify from "./pages/Certify";
import End from "./pages/End";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Invite from "./pages/Invite";
import Search from "./pages/Search";
import Welcome from "./pages/Welcome";
import NewSearch from "./pages/NewSearchPage/NewSearch";
import ProfileRouter from "./pages/ProfilePage/ProfileRouter";
import EditProfile from "./pages/ProfilePage/EditProfile";
import Notification from "./pages/Notification";
import Setting from "./pages/Setting";
import ResetPassword from "./pages/ResetPasswordPage/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordPage/ResetPasswordConfirm";
import FriendOther from "./pages/FriendOther";
import AddProject from "./pages/Project/AddProject";
import FloatingButton from "./components/FloatingButton";
import Setting2 from "./pages/Setting2";

function Logout() {
  localStorage.clear(); // 저장된 token 정보 없애기
  return <Navigate to="/login/" />; // 로그인 페이지로 이동시키기
}

// Custom route to check for the invited status
function ProtectedRegisterRoute({ children }) {
  const invited = localStorage.getItem("invited") === "true";
  console.log("Invited status in ProtectedRegisterRoute:", invited);
  if (invited) {
    return children;
  } else {
    return <Navigate to="/logout" />;
  }
}

function App() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const updateUnreadCount = (newCount) => {
    setUnreadNotifications(newCount);
  };

  return (
    <BrowserRouter>
      {/** floating button */}
      <FloatingButton />
      <Routes>
        <Route path="/" element={<Start />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route
          path="/password-reset-confirm"
          element={<ResetPasswordConfirm />}
        />
        <Route
          path="/welcome"
          element={
            // <ProtectedRegisterRoute>
            <Welcome />
            // </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/certify"
          element={
            <ProtectedRegisterRoute>
              <Certify />
            </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRegisterRoute>
              <Register />
            </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/end"
          element={
            <ProtectedRegisterRoute>
              <End />
            </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        {/* NEW */}
        <Route
          path="/projects/add"
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invite"
          element={
            <ProtectedRoute>
              <Invite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <NewSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfileRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id/friends"
          element={
            <ProtectedRoute>
              <FriendOther />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <Notification updateUnreadCount={updateUnreadCount} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <Setting2 />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
