from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, Project, InvitationLink
from .serializers import CustomUserSerializer, ProjectSerializer, InvitationLinkSerializer
import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from uuid import uuid4
from rest_framework.response import Response

class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # user create할때 확인할 object
    serializer_class = CustomUserSerializer  # email, password를 봐야함을 알려줌
    permission_classes = [AllowAny]  # 모든 사람이 create user할 수 있도록 허가


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

class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        unique_code = str(uuid4()) # Generate a unique link using uuid4
        link = f"{self.request.build_absolute_uri('/invite')}?code={unique_code}"
        serializer.save(inviter=self.request.user, link=link)
        
        
class InvitationLinkList(generics.ListAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)
    
class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        unique_code = str(uuid4())
        link = f"{request.build_absolute_uri('/invite')}?code={unique_code}"

        name = request.data.get('name', '')

        # InvitationLink 객체를 생성하고 저장
        invitation_link = InvitationLink.objects.create(
            inviter=request.user,
            invitee_name=name,
            link=link,
        )

        # 생성된 객체를 시리얼라이저로 변환하여 반환
        serializer = self.get_serializer(invitation_link)
        return Response(serializer.data, status=201)
    
class InvitationLinkDelete(generics.DestroyAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)