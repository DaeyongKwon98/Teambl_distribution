import {Navigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react" 

function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => { // ProtectedRoute가 처음 실행될때 auth가 실행되게 하고, 실패하면 false로 설정
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => { // Token refresh하기
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken // backend로 refresh token 보내기
            }); 
            if (res.status === 200) { // 성공, 새 access token 얻음
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } else { // 실패
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    }

    const auth = async () => { // 권한 확인
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (!token) { // token 없는 경우
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token); //token있는 경우
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // ms말고 second로 표시

        if (tokenExpiration < now) { // 이미 expire된 access token이면 refresh되길 기다림
            await refreshToken();
        } else { // 아직 valid한 token이면 권한 주기
            setIsAuthorized(true);
        }
    }

    if (isAuthorized === null) { // 인증 안됨
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />; // 인증됐으면 정보 주고 안됐으면 로그인 페이지로 이동시키기
}

export default ProtectedRoute