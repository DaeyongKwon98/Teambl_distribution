import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Certify from './pages/Certify';
import End from './pages/End';
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Invite from "./pages/Invite";
import Search from "./pages/Search";
import Welcome from "./pages/Welcome";
import NewSearch from "./pages/NewSearchPage/NewSearch";
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notification from "./pages/Notification";

function Logout() {
  localStorage.clear(); // 저장된 token 정보 없애기
  return <Navigate to="/login/" />; // 로그인 페이지로 이동시키기
}

// function RegisterAndLogout() {
//   // register하면 정보 클리어 해줘야 한다
//   localStorage.clear();
//   return <Register />;
// }

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
        /><Route
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
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
