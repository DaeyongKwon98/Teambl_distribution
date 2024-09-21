from rest_framework import generics, permissions, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import (
    CustomUser,
    Profile,
    Keyword,
    Project,
    InvitationLink,
    Friend,
    Notification,
    Inquiry,
    SearchHistory,
    Like,
    Comment,
)
from .serializers import (
    CustomUserSerializer,
    ProfileCreateSerializer,
    ProfileUpdateSerializer,
    KeywordSerializer,
    ProjectSerializer,
    InvitationLinkSerializer,
    FriendCreateSerializer,
    FriendUpdateSerializer,
    SearchSerializer,
    NotificationSerializer,
    MyTokenObtainPairSerializer,
    RelatedUserSerializer,
    SecondDegreeProfileSerializer,
    InquirySerializer,
    SearchHistorySerializer,
    LikeSerializer,
    CommentSerializer,
)
import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views import View
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from uuid import uuid4
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .HelperFuntions import get_user_distance
from django.db.models import Q
import logging
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from collections import OrderedDict, deque

logger = logging.getLogger(__name__)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


from staff_emails import STAFF_EMAILS


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        code = self.request.data.get("code")
        email = serializer.validated_data.get("email")  # 이메일을 가져옴
        invitation = None  # 초기 값으로 초대가 되지 않았다고 가정.

        # code를 통해 db에서 해당 invite link 찾기
        if code or len(code) > 0:
            invitation = InvitationLink.objects.filter(link__contains=code).first()
            if not invitation:
                raise ValidationError("Invalid invitation code.")
            inviter_id = invitation.inviter_id
        else:
            inviter_id = None

        # 이메일이 STAFF_EMAILS 리스트에 포함되면 is_staff 필드를 True로 설정
        print(STAFF_EMAILS)
        print(email)
        print(email in STAFF_EMAILS)
        if email in STAFF_EMAILS:
            user = serializer.save(is_staff=True)
        else:
            user = serializer.save()

        # 회원가입에 성공한 경우 Friend 추가
        if inviter_id:
            from_user = CustomUser.objects.get(id=inviter_id)
            to_user = user
            Friend.objects.create(
                from_user=from_user, to_user=to_user, status="accepted"
            )

            # 회원가입 후 초대한 사람과 나의 one_degree_count 업데이트
            update_profile_one_degree_count(from_user)
            update_profile_one_degree_count(to_user)

        # 회원가입에 성공한 경우 InvitationLink의 invitee_id 변경 / 초대 링크 상태를 accepted로 변경 / 알림 생성
        if invitation:
            invitation.invitee_id = user.id
            invitation.status = "accepted"
            invitation.save()

            # 초대 링크 사용 가입 알림 생성
            user_profile = Profile.objects.get(user=user)
            Notification.objects.create(
                user=from_user,
                message=f"내가 초대한 {user_profile.user_name}님이 팀블에 가입했습니다.\n{user_profile.user_name}님의 프로필을 지금 확인해보세요!",
                notification_type="invitation_register",
                related_user_id=invitation.invitee_id,
            )


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class OtherUserView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()  # 전체 유저 쿼리셋
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능

    def get_object(self):
        # URL로부터 id를 가져와 해당 유저를 반환
        user_id = self.kwargs.get("id")
        return generics.get_object_or_404(User, id=user_id)


User = get_user_model()


class ChangePasswordView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def get_object(self):
        if self.request.user.is_authenticated:
            # If the user is logged in, return the currently authenticated user
            return self.request.user
        else:
            # If the user is logged out, get the user by email from the request data
            email = self.request.data.get("email")
            if email:
                return get_object_or_404(CustomUser, email=email)
            else:
                return None

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance is None:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        new_password = request.data.get("new_password")
        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.set_password(new_password)
        instance.save()
        return Response(
            {"detail": "Password changed successfully."}, status=status.HTTP_200_OK
        )


# 유저의 비밀번호를 실제로 받은 비밀번호와 대조해서 비교.
class CheckPasswordView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    # CharField를 사용하여 비밀번호 입력을 받음
    password = serializers.CharField(write_only=True)

    def post(self, request, *args, **kwargs):
        password = request.data.get("password")
        user = self.request.user

        if not password:
            return Response(
                {"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # 비밀번호가 실제 비밀번호와 일치하는지 확인
        if user.check_password(password):
            return Response(
                {"detail": "Password is correct."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"detail": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST
            )


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # 탈퇴하는 사용자의 ID와 일치하는 invitee_id를 가진 InvitationLink 삭제 (추후에는 status를 exited 등으로 바꿀 수 있음)
        InvitationLink.objects.filter(invitee_id=user.id).delete()

        # Friend DB에서 해당 유저와 관련된 row 삭제
        related_friends = Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

        # 친구 관계에 있는 유저들을 저장
        related_users = set()
        for friend in related_friends:
            related_users.add(friend.from_user)
            related_users.add(friend.to_user)

        # 해당 유저와 관련된 친구 관계 삭제
        related_friends.delete()

        # 관련된 유저들의 one_degree_count 업데이트
        for related_user in related_users:
            if (
                related_user != user
            ):  # 탈퇴한 유저를 제외한 나머지 유저들에 대해 업데이트
                update_profile_one_degree_count(related_user)

        # 유저 삭제
        user.delete()

        return Response(
            {"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT
        )


class CurrentProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        userid = self.kwargs["userid"]
        user = get_object_or_404(CustomUser, id=userid)

        # 본인의 프로필을 조회하는 경우
        if self.request.user.id == user.id:
            print(f"User {self.request.user.id} is viewing their own profile.")
            return get_object_or_404(Profile, user=user)

        # 다른 사용자의 프로필을 조회하는 경우
        else:
            profile = get_object_or_404(Profile, user=user)
            print(
                f"User {self.request.user.id} is viewing the profile of user {userid}."
            )
            # 추가 권한 검사나 제한된 정보만 반환할 수 있음
            return profile


class ProfileUpdateView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)


class ProjectListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    # queryset = Project.objects.all()
    def get_queryset(self):
        return Project.objects.filter(
            user=self.request.user
        )  # 현재 로그인된 사용자의 프로젝트만 반환

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(
                user=self.request.user
            )  # serializers.py에서 user가 read_only라서 여기서 해줘야함
        else:
            print(serializer.errors)


# 모든 User의 Project를 보여주는 View
class ProjectEveryListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.all()  # 모든 유저의 프로젝트 반환

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)


# 프로젝트 수정 뷰
class ProjectUpdateView(generics.UpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        keywords_data = self.request.data.get("keywords", [])

        # Project 인스턴스를 먼저 업데이트
        project = serializer.save()

        # 키워드를 업데이트
        keyword_objs = []
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            keyword_objs.append(keyword_obj)

        project.keywords.set(keyword_objs)  # ManyToMany 관계 설정
        project.save()


class ProjectDelete(generics.DestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)  # user가 user인 project만 필터


class ProjectLikeToggleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        project = get_object_or_404(Project, pk=project_id)
        user = request.user

        # 이미 좋아요를 눌렀는지 확인
        like, created = Like.objects.get_or_create(user=user, project=project)

        if not created:
            # 이미 좋아요를 눌렀다면 좋아요를 취소하고 레코드를 삭제
            like.delete()
            project.like_count -= 1
            project.save()
            return Response(
                {"message": "Project unliked", "like_count": project.like_count},
                status=status.HTTP_200_OK,
            )
        else:
            # 좋아요를 처음 눌렀다면
            project.like_count += 1
            project.save()
            return Response(
                {"message": "Project liked", "like_count": project.like_count},
                status=status.HTTP_200_OK,
            )


class KeywordListView(generics.ListAPIView):
    serializer_class = KeywordSerializer
    permission_classes = [IsAuthenticated]
    queryset = Keyword.objects.all()


@method_decorator(csrf_exempt, name="dispatch")
class SendCodeView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            email = data.get("email")
            code = data.get("code")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        if not email or not code:
            return JsonResponse({"error": "Email and code are required"}, status=400)

        send_mail(
            "[Teambl] 인증코드",
            f"안녕하세요. 팀블입니다.\n\n인증코드는 다음과 같습니다.\n\n  {code}\n\n만약 인증코드를 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.\n\n감사합니다. 팀블 드림.",
            "info@teambl.net",
            [email],
            fail_silently=False,
        )

        return JsonResponse({"message": "Verification code sent"}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class SendEmailView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            from_email = data.get("from_email")
            body = data.get("body")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        if not from_email or not body:
            return JsonResponse({"error": "Email and code are required"}, status=400)

        send_mail(
            "문의 메일",  # 이메일 제목
            f"From: {from_email}\n\n{body}",  # 이메일 본문
            "info@teambl.net",  # 발신자 이메일 주소
            ["info@teambl.net"],  # 수신사 이메일 주소 목록
            fail_silently=False,  # 에러 발생 시 예외 발생 여부
        )

        return JsonResponse({"message": "문의 메일 전송 성공"}, status=200)


class InvitationLinkList(generics.ListAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        invitee_id = self.request.query_params.get("invitee_id", None)

        if (
            invitee_id
        ):  # invitee_id가 unique하므로, inviter 조건 없이 invitee_id로만 필터링
            queryset = InvitationLink.objects.filter(invitee_id=invitee_id)
        else:
            queryset = InvitationLink.objects.filter(
                inviter=self.request.user
            )  # invitee_id가 없는 경우 로그인한 user가 초대한 링크들 반환

        print(f"Fetching InvitationLinks for invitee_id: {invitee_id}")
        print(f"Queryset: {queryset}")

        return queryset


class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        unique_code = str(uuid4())
        name = request.data.get("name", "")
        invitee_email = request.data.get("invitee_email", None)

        invitation_link = InvitationLink.objects.create(
            inviter=request.user,
            invitee_name=name,
            invitee_id=None,
            link=f"http://localhost:5173/welcome?code={unique_code}",
        )

        return Response(
            {
                "id": invitation_link.id,
                "inviter": invitation_link.inviter.id,
                "invitee_name": invitation_link.invitee_name,
                "invitee_id": invitation_link.invitee_id,
                "link": invitation_link.link,
                "created_at": invitation_link.created_at,
                "status": invitation_link.status,
            },
            status=201,
        )


class WelcomeView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get("code", None)
        logger.debug(f"Received request with code: {code}")  # 로그 추가

        if code:
            try:
                # code로 InvitationLink 객체를 찾기
                invite_link = InvitationLink.objects.get(link__endswith=code)
                inviter_name = invite_link.inviter.profile.user_name
                invitee_name = invite_link.invitee_name

                logger.debug(
                    f"Found InvitationLink: inviter={inviter_name}, invitee={invitee_name}"
                )  # 로그 추가

                # 만료 날짜 계산
                expired_date = invite_link.created_at + timezone.timedelta(days=7)
                current_date = timezone.now()

                # 초대 링크가 만료된 경우
                if current_date > expired_date:
                    invite_link.status = "expired"
                    invite_link.save()
                    logger.warning(f"Invitation link expired: code={code}")  # 로그 추가

                    # 초대 링크 만료 알림 생성
                    Notification.objects.create(
                        user=invite_link.inviter,
                        message=f"내가 초대한 {invitee_name}님의 초대 링크가 만료됐습니다.\n초대 링크를 다시 생성해주세요!",
                        notification_type="invitation_expired",
                    )
                    return Response(
                        {
                            "message": "Invitation link is expired",
                            "error_type": "expired",
                        },
                        status=400,
                    )

                # 초대 링크가 이미 사용되었는지 확인
                if invite_link.status == "accepted":
                    logger.warning(
                        f"Invitation link already used: code={code}"
                    )  # 로그 추가
                    return Response(
                        {"message": "Invitation link already used"}, status=400
                    )

                # 성공적으로 초대 링크 반환
                logger.info(
                    f"Invitation link valid: code={code}, inviter={inviter_name}, invitee={invitee_name}"
                )  # 로그 추가
                return Response(
                    {
                        "inviter_name": inviter_name,
                        "invitee_name": invitee_name,
                    }
                )
            except InvitationLink.DoesNotExist:
                logger.warning(f"Invalid invitation code: {code}")  # 로그 추가
                return Response(
                    {"message": "Invalid invitation code.", "error_type": "invalid"},
                    status=400,
                )
            except Exception as e:
                logger.error(
                    f"Error processing invitation link: {str(e)}"
                )  # 오류 로그 추가
                return Response(
                    {
                        "message": "An error occurred while processing the invitation link.",
                        "error_type": "unknown",
                    },
                    status=500,
                )
        else:
            logger.warning("Invalid invitation code provided")  # 로그 추가
            return Response(
                {"message": "Invalid invitation code.", "error_type": "invalid"},
                status=400,
            )


class InvitationLinkDelete(generics.DestroyAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)


# Friend가 변경될 때 (create, update, delete) Profile 모델의 1촌 수도 같이 업데이트 해주는 함수.
def update_profile_one_degree_count(user):
    profile = user.profile  # User를 통해 Profile에 접근
    profile.one_degree_count = Friend.objects.filter(
        Q(from_user=user) | Q(to_user=user), status="accepted"
    ).count()
    profile.save()


class ListCreateFriendView(generics.ListCreateAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(from_user=user) | Friend.objects.filter(
            to_user=user
        )

    def perform_create(self, serializer):
        from_user = self.request.user
        to_user_id = serializer.validated_data.get("to_user").id

        try:
            to_user = CustomUser.objects.get(id=to_user_id)

            # 기존 친구 관계 확인
            existing_friendship = Friend.objects.filter(
                Q(from_user=from_user, to_user=to_user)
                | Q(from_user=to_user, to_user=from_user)
            ).first()

            if existing_friendship:
                if existing_friendship.status == "pending":
                    # 친구 요청이 진행 중인 경우: 에러 반환
                    raise ValidationError({"detail": "이미 친구 요청이 진행 중입니다."})
                elif existing_friendship.status == "accepted":
                    # 이미 친구 관계인 경우: 에러 반환
                    raise ValidationError({"detail": "이미 친구 관계입니다."})

            # 새로운 친구 관계 생성 (pending)
            Friend.create_or_replace_friendship(from_user, to_user)

            # 친구 추가 요청 알림 생성
            user_profile = Profile.objects.get(user=from_user)
            Notification.objects.create(
                user=to_user,
                message=f"{user_profile.user_name}님의 일촌 신청이 도착했습니다.\n일촌 리스트에서 확인해보세요!",
                notification_type="friend_request",
            )

            # Profile의 one_degree_count도 업데이트
            update_profile_one_degree_count(from_user)
            update_profile_one_degree_count(to_user)

        except CustomUser.DoesNotExist:
            raise ValidationError(
                {"detail": "해당 아이디를 가진 사용자가 존재하지 않습니다."}
            )


class ListFriendView(generics.ListAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        # target_user를 user_id로 검색
        try:
            target_user = CustomUser.objects.get(id=user_id)
            return Friend.objects.filter(
                Q(from_user=target_user) | Q(to_user=target_user)
            )

        # 해당 id의 유저를 못 찾은 경우 404 오류 반환.
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )


class FriendUpdateView(generics.UpdateAPIView):
    serializer_class = FriendUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

    def perform_update(self, serializer):
        status = serializer.validated_data.get("status")
        friend = serializer.instance
        friend.status = status
        friend.save()

        from_user = friend.from_user
        to_user = friend.to_user

        user_profile = Profile.objects.get(user=to_user)
        if status == "accepted":
            # 친구 요청 수락 시 알림 생성
            Notification.objects.create(
                user=from_user,
                message=f"{user_profile.user_name}님이 일촌 신청을 수락했습니다.\n{user_profile.user_name}님의 프로필을 확인해보세요!",
                notification_type="friend_accept",
                related_user_id=to_user.id,
            )
        elif status == "rejected":
            # 친구 요청 거절 시 알림 생성
            Notification.objects.create(
                user=from_user,
                message=f"{user_profile.user_name}님이 일촌 신청을 거절했습니다.",
                notification_type="friend_reject",
            )

        # Profile의 one_degree_count 업데이트
        update_profile_one_degree_count(from_user)
        update_profile_one_degree_count(to_user)


class FriendDeleteView(generics.DestroyAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        )  # user가 포함된 친구 필터

    # 1촌 삭제 시에 from_user, to_user의 profile에 1촌 수를 빼주기
    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        update_profile_one_degree_count(instance.from_user)
        update_profile_one_degree_count(instance.to_user)


class GetUserDistanceAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        target_user_id = kwargs.get("pk")
        try:
            target_user = CustomUser.objects.get(id=target_user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        distance = get_user_distance(user, target_user)
        return Response({"distance": distance}, status=status.HTTP_200_OK)


class SearchUsersAPIView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    # 변수를 쿼리가 아닌 JSON 형식으로 전달받기 위해 POST 요청으로 변경
    # GET 요청 시 쿼리를 포함한 url이 너무 길어져서 반려.
    def post(self, request, *args, **kwargs):
        serializer = SearchSerializer(data=request.data)
        print("request data:", request.data)
        if serializer.is_valid():
            query = serializer.validated_data.get("q", "")
            degrees = serializer.validated_data.get("degree", [])
            majors = serializer.validated_data.get("majors", [])

            print("Received Degrees:", degrees)
            print("Majors:", majors)

            # 현재 사용자의 프로필을 제외한 전체 프로필을 가져옵니다.
            filtered_profiles = Profile.objects.exclude(user=request.user)

            # 1. 검색 쿼리로 필터링
            if query != "":
                filtered_profiles = filtered_profiles.filter(
                    Q(keywords__keyword__icontains=query)  # 키워드 필터링
                    | Q(user_name__icontains=query)  # 이름 필터링
                    | Q(school__icontains=query)  # 학교 필터링
                    | Q(current_academic_degree__icontains=query)  # 학력 필터링
                    | Q(major1__icontains=query)  # 전공1 필터링
                    | Q(major2__icontains=query)  # 전공2 필터링
                )

            # 2. 전공 필터링
            print("Majors for filtering:", majors)
            if majors:
                filtered_profiles = filtered_profiles.filter(
                    Q(major1__in=majors) | Q(major2__in=majors)
                )
            print("Profiles after major filtering:", filtered_profiles)

            # 3. 촌수 필터링 (촌수 필터가 비어있는 경우 모든 촌수 유저 포함)
            degrees = list(map(int, degrees))
            user = self.request.user
            profile_with_distances = []

            print("Filtered Degrees:", degrees)

            for profile in filtered_profiles:
                target_user = profile.user
                distance = get_user_distance(user, target_user)
                if len(degrees) == 0 or distance in degrees:
                    # 촌수와 프로필을 함께 저장
                    profile_with_distances.append((profile, distance))

            # 촌수 오름차순으로 정렬 (None 값을 float('inf')로 처리)
            profile_with_distances.sort(
                key=lambda x: float("inf") if x[1] is None else x[1]
            )

            # 중복된 유저를 제거하기 위해 OrderedDict 사용 (유저 ID를 기준으로 중복 제거)
            unique_users = OrderedDict()
            for profile, distance in profile_with_distances:
                user_id = profile.user.id
                if user_id not in unique_users:
                    unique_users[user_id] = profile

            # 정렬된 프로필 목록 추출
            unique_profiles = list(unique_users.values())

            # 페이지네이션 적용
            paginator = self.pagination_class()
            paginated_profiles = paginator.paginate_queryset(unique_profiles, request)

            # 정렬된 프로필을 기반으로 CustomUser를 수동으로 정렬
            sorted_custom_users = [
                CustomUser.objects.get(profile=profile)
                for profile in paginated_profiles
            ]

            serializer = self.get_serializer(sorted_custom_users, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 현재 로그인한 사용자에게만 해당하는 알림을 반환합니다.
        user = self.request.user
        return Notification.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationUpdateView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 현재 로그인한 사용자의 특정 알림을 업데이트합니다.
        user = self.request.user
        notification = get_object_or_404(
            Notification, pk=self.kwargs.get("pk"), user=user
        )
        return notification

    def perform_update(self, serializer):
        serializer.save()


class NotificationDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 현재 로그인한 사용자의 특정 알림을 삭제합니다.
        user = self.request.user
        notification = get_object_or_404(
            Notification, pk=self.kwargs.get("pk"), user=user
        )
        return notification


class UnreadNotificationCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        return Response({"unread_count": unread_count})


# 이미 존재하는 이메일인지 확인
class CheckEmailExistsView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"message": "이미 사용중인 이메일입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "사용 가능한 이메일입니다."}, status=status.HTTP_200_OK
        )


class KeywordBasedUserSimilarityView(generics.GenericAPIView):
    serializer_class = RelatedUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        recent_times = timezone.now() - timezone.timedelta(days=7)

        # 유사한 사용자 목록을 가져옴
        related_users_data = user.get_related_users_by_keywords()

        # 최근 15분 이내에 가입한 유저들로 필터링
        recent_related_users = [
            user_data
            for user_data in related_users_data
            if user_data["user"].date_joined >= recent_times
        ]

        # 필터링된 데이터를 직렬화
        serializer = self.get_serializer(recent_related_users, many=True)
        return Response(serializer.data)


# 2촌/같은 키워드 사용자 수의 증가량을 반환
class UserStatisticsDifferenceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        recent_times = timezone.now() - timezone.timedelta(days=7)

        # 1촌 및 2촌 정보 가져오기
        first_degree_ids, second_degree_ids, second_degree_connections = (
            user.get_friend_counts()
        )

        # 최근 15분 이내에 가입한 2촌 사용자 필터링
        new_second_degree_profiles = CustomUser.objects.filter(
            id__in=second_degree_ids, date_joined__gte=recent_times
        )

        # 결과가 비어 있는지 확인하기 위해 로그 출력
        print("new_second_degree_profiles:", new_second_degree_profiles)

        # 2촌 프로필 정보와 연결된 1촌 ID를 포함하여 직렬화
        response_data = []
        for profile in new_second_degree_profiles:
            for second_degree_id, connector_id in second_degree_connections:
                if profile.id == second_degree_id:
                    response_data.append(
                        {
                            "second_degree_profile_id": profile.id,
                            "connector_friend_id": connector_id,
                        }
                    )

        # 결과가 비어 있는지 확인하기 위해 로그 출력
        print("response_data:", response_data)

        serializer = SecondDegreeProfileSerializer(response_data, many=True)
        return Response(serializer.data, status=200)


class InquiryCreateView(generics.CreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UpdateOneDegreeCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 현재 사용자를 가져옴
        user = request.user

        # 전달된 user_id가 있다면 해당 사용자의 프로필을 업데이트
        user_id = kwargs.get("user_id")
        if user_id:
            user = get_object_or_404(CustomUser, id=user_id)

        # one_degree_count 업데이트
        update_profile_one_degree_count(user)

        # 업데이트된 one_degree_count를 반환
        profile = user.profile
        return Response({"one_degree_count": profile.one_degree_count})


class SearchHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SearchHistoryDeleteView(generics.DestroyAPIView):
    queryset = SearchHistory.objects.all()
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)


# 가장 최근(새로 가입한) 사용자의 id 얻기
class LatestUserIdView(generics.GenericAPIView):
    serializer_class = CustomUserSerializer

    def get(self, request, *args, **kwargs):
        try:
            latest_user = CustomUser.objects.latest("id")  # 가장 최근 생성된 유저 찾기
            return Response({"user_id": latest_user.id}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "No users found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetUserAllPathsAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "target_user_id"  # user_id로 lookup

    def retrieve(self, request, *args, **kwargs):
        # 현재 로그인한 유저
        current_user = request.user
        target_user_id = self.kwargs.get(
            self.lookup_url_kwarg
        )  # URL에서 user_id 가져오기

        # target_user를 user_id로 검색
        try:
            target_user = CustomUser.objects.get(id=target_user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # 모든 경로 저장
        all_paths = []
        visited = set()

        def dfs(user, path):
            """재귀적으로 DFS를 이용해 모든 경로 찾기"""
            if user.id == target_user.id:
                all_paths.append(list(path))
                return

            visited.add(user.id)

            friends = Friend.objects.filter(
                Q(from_user=user) | Q(to_user=user), status="accepted"
            )

            for friend in friends:
                next_user = (
                    friend.to_user if friend.from_user == user else friend.from_user
                )
                if next_user.id not in visited:
                    path.append(next_user)
                    dfs(next_user, path)
                    path.pop()

            visited.remove(user.id)

        # DFS 실행하여 모든 경로 탐색
        dfs(current_user, [current_user])

        # 길이가 5 이상인 경로 필터링
        valid_paths = [path for path in all_paths if len(path) < 5]

        # 가장 짧은 경로의 길이 계산 후 그 길이의 경로들만 선택
        if valid_paths:
            shortest_length = min(len(path) for path in valid_paths)
            shortest_paths = [
                path for path in valid_paths if len(path) == shortest_length
            ]
        else:
            shortest_paths = []

        # 경로가 없을 경우 빈 리스트 반환
        if not shortest_paths:
            return Response(
                {"paths": [], "current_user_id": current_user.id},
                status=status.HTTP_200_OK,
            )

        # user_id를 user_name으로 변환
        paths_as_usernames = []
        for path in shortest_paths:
            path_usernames = [
                CustomUser.objects.get(id=u.id).profile.user_name for u in path
            ]
            paths_as_usernames.append(path_usernames)

        return Response(
            {"paths": paths_as_usernames, "current_user_id": current_user.id},
            status=status.HTTP_200_OK,
        )


# 댓글 작성
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_id")
        project = get_object_or_404(Project, pk=project_id)
        print("comment create for project", project)
        serializer.save(user=self.request.user, project=project)


# 댓글 목록
class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Comment.objects.filter(project_id=project_id)


# 댓글 수정
class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user:
            return Response(
                {"error": "You are not allowed to edit this comment"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer.save()


# 댓글 삭제
class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response(
                {"error": "You are not allowed to delete this comment"},
                status=status.HTTP_403_FORBIDDEN,
            )
        super().perform_destroy(instance)
