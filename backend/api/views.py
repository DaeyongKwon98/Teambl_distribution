from rest_framework import generics, permissions, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import (
    CustomUser,
    Profile,
    Keyword,
    Project,
    InvitationLink,
    Friend,
    Notification,
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

logger = logging.getLogger(__name__)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        code = self.request.data.get("code")

        # code를 통해 db에서 해당 invite link 찾기
        if code:
            invitation = InvitationLink.objects.filter(link__contains=code).first()
            if not invitation:
                raise ValidationError("Invalid invitation code.")
            inviter_id = invitation.inviter_id
        else:
            inviter_id = None

        user = serializer.save()

        # 회원가입에 성공한 경우 Friend 추가
        if inviter_id:
            from_user = CustomUser.objects.get(id=inviter_id)
            to_user = user
            Friend.objects.create(
                from_user=from_user, to_user=to_user, status="accepted"
            )

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
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
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


class ProjectDelete(generics.DestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)  # user가 user인 project만 필터


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
            "Your verification code",
            f"Your verification code is {code}",
            "from@example.com",
            [email],
            fail_silently=False,
        )

        return JsonResponse({"message": "Verification code sent"}, status=200)


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
            link=f"https://teambl-distribution.vercel.app/welcome?code={unique_code}",
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

                # 만료 날짜 계산 (생성 후 1분)
                expired_date = invite_link.created_at + timezone.timedelta(minutes=1)
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
            logger.info(
                f"Creating friendship: from_user={from_user.email}, to_user={to_user.email}"
            )
            serializer.save(from_user=from_user, to_user=to_user, status="accepted")

            # 친구 추가 요청 알림 생성
            user_profile = Profile.objects.get(user=from_user)
            Notification.objects.create(
                user=to_user,
                message=f"{user_profile.user_name}님의 일촌 신청이 도착했습니다.\n일촌 리스트에서 확인해보세요!",
                notification_type="friend_request",
            )

            # Profile의 one_degree_count도 같이 업데이트
            update_profile_one_degree_count(from_user)
            update_profile_one_degree_count(to_user)

        except CustomUser.DoesNotExist:
            logger.error(f"User with id {to_user_id} does not exist")
            raise ValidationError("User with this ID does not exist.")


class FriendUpdateView(generics.UpdateAPIView):
    serializer_class = FriendUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

    def perform_update(self, serializer):
        friend = serializer.save()
        status = serializer.validated_data.get("status")
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

    # 변수를 쿼리가 아닌 JSON 형식으로 전달받기 위해 POST 요청으로 변경
    # GET 요청 시 쿼리를 포함한 url이 너무 길어져서 반려.
    def post(self, request, *args, **kwargs):
        serializer = SearchSerializer(data=request.data)
        if serializer.is_valid():
            query = serializer.validated_data.get("q", "")
            degrees = serializer.validated_data.get("degree", [])
            majors = serializer.validated_data.get("major", [])

            print("Received Degrees:", degrees)

            # 전체 프로필을 가져옵니다.
            filtered_profiles = Profile.objects.all()

            # 1. 검색 쿼리로 필터링
            if query != "":
                filtered_profiles = filtered_profiles.filter(
                    keywords__keyword__icontains=query
                )

            # 2. 전공 필터링
            if majors:
                filtered_profiles = filtered_profiles.filter(major__in=majors)

            # 3. 촌수 필터링 (비어있는 경우 1, 2, 3촌 다 포함)
            if not degrees:
                degrees = [1, 2, 3]
            degrees = list(map(int, degrees))
            user = self.request.user
            degree_filtered_profiles = []
            profile_with_distances = []

            print("Filtered Degrees:", degrees)

            for profile in filtered_profiles:
                target_user = profile.user
                distance = get_user_distance(user, target_user)
                if distance is not None and distance in degrees:
                    # 촌수와 프로필을 함께 저장
                    profile_with_distances.append((profile, distance))

            # 촌수 오름차순으로 정렬
            profile_with_distances.sort(key=lambda x: x[1])

            # 정렬된 프로필 목록 추출
            degree_filtered_profiles = [
                profile for profile, distance in profile_with_distances
            ]

            # 정렬된 프로필을 기반으로 CustomUser를 수동으로 정렬
            sorted_custom_users = [
                CustomUser.objects.get(profile=profile)
                for profile, _ in profile_with_distances
            ]

            serializer = self.get_serializer(sorted_custom_users, many=True)
            return Response(serializer.data)

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
        related_users_data = (
            user.get_related_users_by_keywords()
        )  # 유사한 사용자 목록을 가져옴

        # 데이터를 직렬화합니다.
        serializer = self.get_serializer(related_users_data, many=True)
        return Response(serializer.data)

# 2촌/같은 키워드 사용자 수의 증가량을 반환
class UserStatisticsDifferenceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 현재 로그인한 사용자 정보 가져오기
        user = request.user
        user_id = user.id
        
        # 최근 시간 기준으로 필터링
        recent_times = timezone.now() - timezone.timedelta(minutes=15)
        
        # 현재 유저의 2촌 관계 가져오기
        first_degree_ids, second_degree_ids, second_degree_connections = user.get_friend_counts()
        new_second_degree_profiles = CustomUser.objects.filter(
            id__in=second_degree_ids, 
            data_joined__gte=recent_times
        )
        
        # 현재 유저와 같은 키워드를 가진 사용자 가져오기
        related_users_data = user.get_related_users_by_keywords()
        new_keyword_profiles_ids = [
            user_data['user'].id for user_data in related_users_data 
            if user_data['user'].data_joined >= recent_times
        ]
        new_keyword_profiles = CustomUser.objects.filter(id__in=new_keyword_profiles_ids)
        
        # 증가량을 최근 가입한 사용자 수로 설정
        second_degree_diff = new_second_degree_profiles.count()
        keyword_diff = new_keyword_profiles.count()
        
        # Serialize the data
        user_data = {
            "first_degree_count": len(first_degree_ids),
            "second_degree_count": len(second_degree_ids),
            "second_degree_ids": list(second_degree_ids),
            "second_degree_connections": second_degree_connections,
            "related_users": related_users_data,
        }

        user_serialized = CustomUserSerializer(user, context={'request': request, 'user_data': user_data}).data

        second_degree_profiles_serialized = CustomUserSerializer(new_second_degree_profiles, many=True).data
        keyword_profiles_serialized = CustomUserSerializer(new_keyword_profiles, many=True).data

        return Response({
            'second_degree_difference': second_degree_diff,
            'keyword_difference': keyword_diff,
            'new_second_degree_profiles': second_degree_profiles_serialized,
            'new_keyword_profiles': keyword_profiles_serialized,
            'user_data': user_serialized,
        })

