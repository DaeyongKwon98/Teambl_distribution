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
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile", primary_key=True
    )
    user_name = models.CharField(max_length=100)  # 이름
    school = models.CharField(max_length=100)  # 학교
    current_academic_degree = models.CharField(max_length=10)  # 학력
    year = models.IntegerField()  # 입학연도
    major = models.CharField(max_length=100)  # 전공
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
