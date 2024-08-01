from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, Profile, Project, InvitationLink, Friend
from .serializers import (
    CustomUserSerializer,
    ProjectSerializer,
    InvitationLinkSerializer,
    FriendCreateSerializer,
    FriendUpdateSerializer,
)
import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from uuid import uuid4
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .HelperFuntions import get_user_distance
from django.db.models import Q


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # user create할때 확인할 object
    serializer_class = CustomUserSerializer  # email, password를 봐야함을 알려줌
    permission_classes = [AllowAny]  # 모든 사람이 create user할 수 있도록 허가


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProjectListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]  # authenticated되지 않으면 사용 불가
    queryset = Project.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(
                user=self.request.user
            )  # serializers.py에서 user가 read_only라서 여기서 해줘야함
        else:
            print(serializer.errors)


class ProjectDelete(generics.DestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]  # authenticated돼야 삭제 가능

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)  # user가 user인 note만 필터


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
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)

    from django.shortcuts import redirect


class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        unique_code = str(uuid4())
        name = request.data.get("name", "")

        invitation_link = InvitationLink.objects.create(
            inviter=request.user,
            invitee_name=name,
            link=f"http://localhost:5173/welcome?code={unique_code}",
        )

        return Response(
            {"link": invitation_link.link, "id": invitation_link.id}, status=201
        )


class WelcomeView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get("code", None)
        if code:
            # code로 InvitationLink 객체를 찾기
            invite_link = get_object_or_404(InvitationLink, link__endswith=code)
            inviter_name = invite_link.inviter.profile.user_name
            invitee_name = invite_link.invitee_name

            return Response(
                {
                    "inviter_name": inviter_name,
                    "invitee_name": invitee_name,
                }
            )
        return Response({"message": "Invalid invitation code."}, status=400)


class InvitationLinkDelete(generics.DestroyAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)


class ListCreateFriendView(generics.ListCreateAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(from_user=user) | Friend.objects.filter(
            to_user=user
        )


class FriendUpdateView(generics.UpdateAPIView):
    serializer_class = FriendUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

    def perform_update(self, serializer):
        print(
            f"Performing update with data: {serializer.validated_data}"
        )  # Debugging line
        super().perform_update(serializer)


class FriendDeleteView(generics.DestroyAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]  # authenticated돼야 삭제 가능

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        )  # user가 포함된 친구 필터


class SearchUsersAPIView(generics.ListAPIView):
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "")  # 검색 쿼리
        degrees = self.request.query_params.getlist("degree")  # 촌수
        majors = self.request.query_params.getlist("major")  # 전공

        # 1. 검색 쿼리로 필터링
        profiles = Profile.objects.filter(keywords__icontains=query)

        # 2. 전공 필터링
        if majors:
            profiles = profiles.filter(major__in=majors)

        # 3. 촌수 필터링
        if degrees:
            degrees = list(map(int, degrees))
            user = self.request.user
            filtered_profiles = []

            for profile in profiles:
                target_user = profile.user
                distance = get_user_distance(user, target_user)
                if distance is not None and distance in degrees:
                    filtered_profiles.append(profile)

            profiles = filtered_profiles

        return CustomUser.objects.filter(profile__in=profiles)
