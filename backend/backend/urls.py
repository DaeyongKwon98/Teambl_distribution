from django.contrib import admin
from django.urls import path, include

# from backend.api.views import CreateUserView
from api.views import CreateUserView, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView  # , TokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    # path("api/", include("backend.api.urls")), # api/로 시작하는데 위에 속하지 않는경우, 남은 url을 api.urls로 보내라
    path("api/", include("api.urls")),
]

# 개발 환경에서 미디어 파일 서빙을 위한 설정 (실제 배포 환경에서는 서버 디렉토리 파일 위치로, MEDIA_URL과 MEDIA_ROOT가 달려져야 함)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
