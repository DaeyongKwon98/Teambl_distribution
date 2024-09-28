from django.db import models
from django.db.models import Q
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
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_friend_counts(self, user_id=None):
        # user_id가 주어지면 해당 ID 사용, 그렇지 않으면 self.id 사용
        if user_id is None:
            user_id = self.id
    
        # 1촌 친구 목록을 찾습니다.
        first_degree_friends = Friend.objects.filter(
            (Q(from_user_id=user_id) | Q(to_user_id=user_id)) & Q(status="accepted")
        )
    
        first_degree_ids = set()
        for friend in first_degree_friends:
            if friend.from_user_id == user_id:
                first_degree_ids.add(friend.to_user.id)
            else:
                first_degree_ids.add(friend.from_user.id)
    
        # 2촌과 그들을 연결해주는 1촌의 ID 쌍을 저장할 리스트 (중복 제거를 위해 set 사용)
        second_degree_connections = set()
    
        print("1촌 목록:", first_degree_ids)
        print("현재 사용자 ID:", user_id)  # user_id를 출력해 올바르게 설정되었는지 확인
        
        # 2촌 찾기
        for friend_id in first_degree_ids:
            second_degree_friends = Friend.objects.filter(
                (Q(from_user_id=friend_id) | Q(to_user_id=friend_id))
                & Q(status="accepted")
            ).exclude(Q(from_user_id=user_id) | Q(to_user_id=user_id))
    
            print("현재 1촌:", friend_id)
    
            for friend in second_degree_friends:
                print(f"1촌 {friend_id}의 친구 {friend.from_user_id} - {friend.to_user_id} 조사중..")
    
                # 2촌 관계에서 나 자신과 1촌들을 제외하고 추가
                if friend.from_user_id == friend_id:
                    target_id = friend.to_user_id
                else:
                    target_id = friend.from_user_id
    
                print(f"비교: target_id = {target_id}, user_id = {user_id}")
    
                if target_id not in first_degree_ids and target_id != user_id:
                    second_degree_connections.add((target_id, friend_id))
                    print(f"({target_id}, {friend_id}) 추가")
    
        # 중복을 제거한 2촌 ID만 반환하기 위해 set을 사용
        second_degree_ids = {conn[0] for conn in second_degree_connections}
    
        print("second degree connections:", list(second_degree_connections))
    
        return first_degree_ids, second_degree_ids, list(second_degree_connections)



    def get_related_users_by_keywords(self):
        user_keywords = set(self.profile.keywords.values_list("keyword", flat=True))
        related_profiles = Profile.objects.exclude(user=self)

        user_similarity_list = []

        for profile in related_profiles:
            other_user_keywords = set(
                profile.keywords.values_list("keyword", flat=True)
            )
            common_keywords = user_keywords.intersection(other_user_keywords)

            if len(common_keywords) > 0:  # 공통 키워드가 있는 경우에만 리스트에 추가
                user_similarity_list.append(
                    {
                        "user": profile.user,
                        "common_keywords": list(common_keywords),
                        "similarity": len(
                            common_keywords
                        ),  # 공통 키워드 수를 유사도로 사용
                    }
                )
        # 유사도(공통 키워드 수) 기준으로 정렬
        user_similarity_list.sort(key=lambda x: x["similarity"], reverse=True)

        return user_similarity_list

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
    like_count = models.IntegerField(default=0)
    image = models.ImageField(upload_to="project_images/", blank=True, null=True)
    tagged_users = models.ManyToManyField(CustomUser, related_name="participating_projects", blank=True)
    contact = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="comments")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="comments")
    content = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def __str__(self):
        return f"Comment by {self.user.email} on {self.project.title}"
    

class Like(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="likes")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)  # 좋아요 누른 시간

    class Meta:
        unique_together = ("user", "project")  # 같은 유저가 같은 프로젝트에 여러 번 좋아요 누르지 못하게 함

    def __str__(self):
        return f"{self.user.email} likes {self.project.title}"


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
    major1 = models.CharField(
        max_length=100,
        choices=MAJOR_CHOICES,
        default="pending",
    )  # 전공 1
    major2 = models.CharField(
        max_length=100,
        choices=MAJOR_CHOICES,
        default="pending",
        blank=True,
        null=True,
    )  # 전공 2
    keywords = models.ManyToManyField(Keyword, blank=True)  # 키워드
    one_degree_count = models.IntegerField(default=0)  # 1촌 수
    introduction = models.TextField(default="", blank=True, max_length=1000)  # 소개
    image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )  # 프로필 이미지

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
    invitee_id = models.IntegerField(
        null=True, blank=True
    )  # 나중에 다시 unique=True 해야됨
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
        unique_together = ("to_user", "from_user", "status")

    @classmethod
    def create_or_replace_friendship(cls, from_user, to_user):
        # 거절된 상태의 친구 관계가 있는지 확인
        rejected_friendship = cls.objects.filter(
            models.Q(from_user=from_user, to_user=to_user) |
            models.Q(from_user=to_user, to_user=from_user),
            status="rejected"
        ).first()
        
        # 거절된 관계가 있으면 삭제
        if rejected_friendship:
            rejected_friendship.delete()
            print("rejected friendship deleted!")
        
        # 새로운 친구 관계 생성 (pending 상태로)
        new_friendship = cls.objects.create(from_user=from_user, to_user=to_user, status="pending")
        return new_friendship
    
    def __str__(self):
        return f"{self.from_user.email} is friends with {self.to_user.email}, status: {self.status}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ("invitation_register", "Invitation Register"),
        ("invitation_expired", "Invitation Expired"),
        ("friend_accept", "Friend Accept"),
        ("friend_reject", "Friend Reject"),
        ("friend_request", "Friend Request"),
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
    related_user_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.message}"


class Inquiry(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="inquiries"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Inquiry from {self.user.username} at {self.created_at}'

class SearchHistory(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="search_histories"
    )
    keyword = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Search by {self.user.username} for "{self.keyword}" at {self.created_at}'
