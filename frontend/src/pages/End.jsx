import { useLocation, useNavigate } from "react-router-dom";
import "../styles/End.css";

function End() {
  const location = useLocation();
  const navigate = useNavigate();
  const name = { ...location.state }.user_name;
  const [userId, setUserId] = useState(null);

  // 사용자 정보를 가져오는 함수
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // 서버에서 현재 사용자 정보 가져오기
        const response = await axios.get("/current-user/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // 토큰을 사용해 인증
          },
        });
        const fetchedUserId = response.data.id; // API에서 받은 user_id (id 필드 가정)
        setUserId(fetchedUserId); // userId 상태에 저장
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
      }
    };

    fetchUserId();
  }, []); // 컴포넌트 마운트 시 API 호출
  
  function handleProfile() {
    if (userId) {
      localStorage.removeItem("invited"); // 초대받은 경우에만 초대 상태 초기화
      localStorage.removeItem("invite_code"); // 초대 코드를 삭제
      navigate(`/profile/${userId}`); // user_id를 사용하여 프로필 페이지로 이동
    }
  }
  function handleLogin() {
    localStorage.removeItem("invited"); // 초대받은 경우에만 초대 상태 초기화
    localStorage.removeItem("invite_code"); // 초대 코드를 삭제
    navigate("/login");
  }

  return (
    <div className="end">
      <div className="end-container">
        <span className="end-name" style={{ color: "#0000b3" }}>
          {name}
        </span>
        <span className="end-nim">
          님,
          <br />
        </span>
        <span className="end-name">가입을 축하합니다!</span>
        <label className="end-label1">
          이제 팀블과 함께 최적의 팀원을 탐색해 보세요!
        </label>
        <label className="end-label2">
          프로필을 더 자세히 작성할수록 다른 회원들과 더 쉽게 연결될 수
          있습니다. 이어서 프로필을 작성해 볼까요?
        </label>
        <button
          type="button"
          className="end-profileBtn"
          onClick={handleProfile}
        >
          프로필 추가로 작성하기
        </button>
        <button type="button" className="end-loginBtn" onClick={handleLogin}>
          팀블 시작하기
        </button>
      </div>
    </div>
  );
}

export default End;
