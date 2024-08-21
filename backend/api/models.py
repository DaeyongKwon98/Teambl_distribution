from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(null=True, blank=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    data_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Keyword(models.Model):
    keyword = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.keyword


class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="projects"
    )  # 다른 곳에서 user.projects하면 Project object를 다 접근할 수 있게 됨
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    keywords = models.ManyToManyField(Keyword, blank=True)

    def __str__(self):
        return self.title


class Profile(models.Model):
    MAJOR_CHOICES = [
        # 자연과학대학
        #  학사
        ("물리학과", "물리학과"),
        ("수리과학과", "수리과학과"),
        ("화학과", "화학과"),
        #  석사, 박사
        ("나노과학기술대학원", "나노과학기술대학원"),
        ("양자대학원", "양자대학원"),
        # 생명과학기술대학
        #  학사
        ("생명과학과", "생명과학과"),
        ("뇌인지과학과", "뇌인지과학과"),
        #  석사, 박사
        ("의과학대학원", "의과학대학원"),
        ("공학생물학대학원", "공학생물학대학원"),
        ("줄기세포및재생생물학대학원", "줄기세포및재생생물학대학원"),
        # 공과대학
        #  학사
        ("기계공학과", "기계공학과"),
        ("항공우주공학과", "항공우주공학과"),
        ("전기및전자공학부", "전기및전자공학부"),
        ("전산학부", "전산학부"),
        ("건설및환경공학과", "건설및환경공학과"),
        ("바이오및뇌공학과", "바이오및뇌공학과"),
        ("산업디자인학과", "산업디자인학과"),
        ("산업시스템공학과", "산업시스템공학과"),
        ("생명화학공학과", "생명화학공학과"),
        ("신소재공학과", "신소재공학과"),
        ("원자력및양자공학과", "원자력및양자공학과"),
        ("반도체시스템공학과", "반도체시스템공학과"),
        #  석사, 박사
        ("조천식모빌리티대학원", "조천식모빌리티대학원"),
        ("김재철AI대학원", "김재철AI대학원"),
        ("녹색성장지속가능대학원", "녹색성장지속가능대학원"),
        ("반도체공학대학원", "반도체공학대학원"),
        ("인공지능반도체대학원", "인공지능반도체대학원"),
        ("메타버스대학원", "메타버스대학원"),
        ("시스템아키텍트대학원", "시스템아키텍트대학원"),
        # 인문사회융합과학대학
        #  학사
        ("디지털인문사회과학부", "디지털인문사회과학부"),
        #  석사, 박사
        ("문화기술대학원", "문화기술대학원"),
        ("문술미래전략대학원", "문술미래전략대학원"),
        ("과학기술정책대학원", "과학기술정책대학원"),
        # 경영대학
        #  학사
        ("경영공학부", "경영공학부"),
        ("기술경영학부", "기술경영학부"),
        #  석사, 박사
        ("KAIST경영전문대학원", "KAIST경영전문대학원"),
        ("금융전문대학원", "금융전문대학원"),
        ("경영자과정", "경영자과정"),
        ("기술경영전문대학원", "기술경영전문대학원"),
        ("글로벌디지털혁신대학원", "글로벌디지털혁신대학원"),
        ("바이오혁신경영전문대학원", "바이오혁신경영전문대학원"),
        # 융합인재학부
        #  학사
        ("융합인재학부", "융합인재학부"),
        # 안보융합원
        #  석사, 박사
        ("안보과학기술대학원", "안보과학기술대학원"),
        ("사이버안보기술대학원", "사이버안보기술대학원"),
        # 새내기과정
        #  학사
        ("새내기과정학부", "새내기과정학부"),
    ]

    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile", primary_key=True
    )
    user_name = models.CharField(max_length=100)  # 이름
    school = models.CharField(max_length=100)  # 학교
    current_academic_degree = models.CharField(max_length=10)  # 학력
    year = models.IntegerField()  # 입학연도
    major = models.CharField(
        max_length=100,
        choices=MAJOR_CHOICES,
        default="pending",
    )  # 전공
    keywords = models.ManyToManyField(Keyword, blank=True)  # 키워드
    one_degree_count = models.IntegerField(default=0)  # 1촌 수
    introduction = models.TextField(default="", max_length=1000)  # 소개

    def __str__(self):
        return self.user_name


# 툴 (프로필과 1:N)
class Tool(models.Model):
    tool = models.CharField(max_length=100)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="tools")

    def __str__(self):
        return self.name


# 경험 (프로필과 1:N)
class Experience(models.Model):
    experience = models.TextField()
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="experiences"
    )

    def __str__(self):
        return self.description[:50]  # 첫 50자를 보여줌


# 포트폴리오 링크 (프로필과 1:N)
class PortfolioLink(models.Model):
    portfolioLink = models.URLField()
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="portfolio_links"
    )

    def __str__(self):
        return self.urls


class InvitationLink(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("expired", "Expired"),
    ]

    inviter = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="invitation_links"
    )
    invitee_name = models.CharField(max_length=255)
    link = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    class Meta:
        unique_together = ("inviter", "link")

    def __str__(self):
        return self.link


# user A가 user B에게 1촌 신청해서 수락 된 경우. from_user: A, to_user: B
class Friend(models.Model):
    # 좌: db 저장 형태, 우: 실제 표시 형태
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]
    from_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="friends_from"
    )
    to_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="friends_to"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    class Meta:
        unique_together = ("to_user", "from_user")

    def __str__(self):
        return f"{self.from_user.email} is friends with {self.to_user.email}, status: {self.status}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('invitation_register', 'Invitation Register'),
        ('invitation_expired', 'Invitation Expired'),
        ('friend_accept', 'Friend Accept'),
        ('friend_reject', 'Friend Reject'),
        ('friend_request', 'Friend Request'),
    ]

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="notifications"
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=30, choices=NOTIFICATION_TYPE_CHOICES
    )

    def __str__(self):
        return f"Notification for {self.user.email} - {self.message}"
