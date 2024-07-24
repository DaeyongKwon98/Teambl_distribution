from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser
from .serializers import CustomUserSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all() # user create할때 확인할 object
    serializer_class = CustomUserSerializer # username, password를 봐야함을 알려줌
    permission_classes = [AllowAny] # 모든 사람이 create user할 수 있도록 허가

# class NoteListCreate(generics.ListCreateAPIView):
#     serializer_class = NoteSerializer
#     permission_classes = [IsAuthenticated] # authenticated되지 않으면 사용 불가
    
#     def get_queryset(self): # CreateUserView와 달리 queryset을 확인해서 가져와야해서 override(?) 함
#         user = self.request.user
#         return Note.objects.filter(author=user) # author가 user인 note만 필터
    
#     def perform_create(self, serializer):
#         if serializer.is_valid():
#             serializer.save(author=self.request.user) # serializers.py에서 author가 read_only라서 여기서 해줘야함
#         else:
#             print(serializer.errors)

# class NoteDelete(generics.DestroyAPIView):
#     serializer_class = NoteSerializer
#     permission_classes = [IsAuthenticated] # authenticated돼야 삭제 가능

#     def get_queryset(self):
#         user = self.request.user
#         return Note.objects.filter(author=user) # author가 user인 note만 필터
