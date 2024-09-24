from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser,
    Project,
    Keyword,
    Profile,
    InvitationLink,
    Friend,
    Tool,
    Experience,
    PortfolioLink,
    Notification,
    Inquiry,
    SearchHistory,
    Like,
    Comment,
)
import os


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # JWT 토큰에 userId를 추가
        token["userId"] = user.id

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # 로그인 응답에 userId 추가
        data.update({"userId": self.user.id})

        return data


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ["keyword"]


class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = ["id", "tool"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "experience"]


class PortfolioLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioLink
        fields = ["id", "portfolioLink"]


class ProfileCreateSerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()
    tools = ToolSerializer(many=True, required=False)
    experiences = ExperienceSerializer(many=True, required=False)
    portfolio_links = PortfolioLinkSerializer(many=True, required=False)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major1",
            "major2",
            "keywords",
            "one_degree_count",
            "introduction",
            "tools",
            "experiences",
            "portfolio_links",
            "image",
        ]

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def create(self, validated_data):
        profile = Profile.objects.create(**validated_data)
        return profile


class ProfileUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(required=False)
    school = serializers.CharField(required=False)
    current_academic_degree = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    major1 = serializers.CharField(required=False)
    major2 = serializers.CharField(required=False, allow_blank=True)
    tools = ToolSerializer(many=True, required=False)
    introduction = serializers.CharField(required=False, allow_blank=True)
    experiences = ExperienceSerializer(many=True, required=False)
    portfolio_links = PortfolioLinkSerializer(many=True, required=False)
    keywords = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major1",
            "major2",
            "tools",
            "introduction",
            "experiences",
            "portfolio_links",
            "keywords",
            "image",
        ]

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def update(self, instance, validated_data):
        # 이미지 추출 (new_image, old_image )
        new_image = validated_data.get("image", None)
        old_image = instance.image

        # tools 추출
        tools_data = validated_data.pop("tools", None)

        # experiences 추출
        experiences_data = validated_data.pop("experiences", None)

        # portfolio_links 추출
        portfolio_links_data = validated_data.pop("portfolio_links", None)

        # 키워드를 initial_data에서 추출
        keywords_data = self.initial_data.get("keywords", None)
        # keywords 필드를 validated_data에서 제거
        validated_data.pop("keywords", None)

        # Update basic fields only if they are provided in the validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 기존 이미지 삭제 (새 이미지가 업로드된 경우)
        if new_image and old_image and old_image != new_image:
            if os.path.isfile(old_image.path):
                os.remove(old_image.path)

        # Update tools
        if tools_data is not None:
            instance.tools.all().delete()  # 기존 tools 삭제
            for tool_data in tools_data:
                Tool.objects.create(profile=instance, **tool_data)

        # Update experiences
        if experiences_data is not None:
            instance.experiences.all().delete()  # 기존 experiences 삭제
            for experience_data in experiences_data:
                Experience.objects.create(profile=instance, **experience_data)

        # Update portfolio links
        if portfolio_links_data is not None:
            instance.portfolio_links.all().delete()  # 기존 portfolio links 삭제
            for portfolio_link_data in portfolio_links_data:
                PortfolioLink.objects.create(profile=instance, **portfolio_link_data)

        # Update keywords
        if keywords_data is not None:
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)

            # set() 메서드를 사용하여 Many-to-Many 관계 설정
            instance.keywords.set(keyword_objs)

        return instance

    def to_representation(self, instance):
        """Return instance data including the keywords as a list of strings."""
        representation = super().to_representation(instance)
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
        ]
        return representation


class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileCreateSerializer()
    code = serializers.CharField(write_only=True, required=False)
    user_name = serializers.CharField(source='profile.user_name', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "password",
            "last_login",
            "is_superuser",
            "is_staff",
            "is_active",
            "date_joined",
            "profile",
            "code",
            "user_name",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "last_login": {"read_only": True},
            "is_superuser": {"read_only": True},
            "is_active": {"read_only": True},
            "date_joined": {"read_only": True},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        keywords_data = profile_data.pop("keywords", [])

        # CustomUser 인스턴스 생성
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            is_staff=validated_data.get("is_staff", False),
        )

        # Profile 인스턴스 생성 및 CustomUser와 연결
        profile = Profile.objects.create(user=user, **profile_data)

        # Keywords 추가
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            profile.keywords.add(keyword_obj)

        return user

    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.set_password(validated_data["password"])
            validated_data.pop("password")
        return super().update(instance, validated_data)


class ProjectSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    keywords = serializers.SerializerMethodField()
    tagged_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )

    class Meta:
        model = Project
        fields = [
            "project_id",
            "user",
            "title",
            "content",
            "created_at",
            "keywords",
            "like_count",
            "image",
            "tagged_users",
        ]
        extra_kwargs = {"user": {"read_only": True}}

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tagged_users'] = CustomUserSerializer(instance.tagged_users.all(), many=True).data
        return representation

    def create(self, validated_data):
        # Extract keywords and tagged users
        keywords_data = self.initial_data.get("keywords", [])
        tagged_users_data = validated_data.pop("tagged_users", [])

        # Create the Project instance
        project = Project.objects.create(**validated_data)

        # Set keywords
        keyword_objs = []
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            keyword_objs.append(keyword_obj)
        project.keywords.set(keyword_objs)

        # Set tagged users
        if tagged_users_data:
            project.tagged_users.set(tagged_users_data)

        return project

    def update(self, instance, validated_data):
        # Extract keywords and tagged users
        keywords_data = self.initial_data.get("keywords", [])
        tagged_users_data = validated_data.pop("tagged_users", [])

        # Update basic fields
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        if 'image' in validated_data:
            instance.image = validated_data['image']

        instance.save()

        # Update keywords
        if keywords_data:
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)
            instance.keywords.set(keyword_objs)
        else:
            instance.keywords.clear()

        # Update tagged users
        if tagged_users_data:
            instance.tagged_users.set(tagged_users_data)
        else:
            instance.tagged_users.clear()

        return instance


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["user", "project", "created_at"]


class InvitationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvitationLink
        fields = [
            "id",
            "inviter",
            "invitee_name",
            "invitee_id",
            "link",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "inviter", "created_at"]


class FriendCreateSerializer(serializers.ModelSerializer):
    to_user_id = serializers.IntegerField(
        write_only=True, error_messages={"invalid": "유효한 사용자 ID를 입력해주세요."}
    )
    from_user = CustomUserSerializer(read_only=True)
    to_user = CustomUserSerializer(read_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Friend
        fields = ["id", "from_user", "to_user", "status", "to_user_id"]
        read_only_fields = ["id", "from_user", "to_user"]

    def validate(self, attrs):
        from_user = self.context["request"].user
        to_user_id = attrs.get("to_user_id")

        # 이메일에 해당하는 사용자가 있는지 확인
        try:
            to_user = CustomUser.objects.get(id=to_user_id)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"message": "해당 ID의 유저가 없습니다."})

        # 자신에게 1촌 신청하는지 확인
        if from_user == to_user:
            raise serializers.ValidationError(
                {"message": "자신에게 1촌 신청할 수 없습니다."}
            )

        # 이미 1촌인 유저인지 확인
        if Friend.objects.filter(
            from_user=from_user, to_user=to_user, status="accepted"
        ).exists():
            raise serializers.ValidationError({"message": "이미 1촌인 유저입니다."})

        # 검증 완료 후 attrs에 추가
        attrs["from_user"] = from_user
        attrs["to_user"] = to_user
        return attrs

    def create(self, validated_data):
        from_user = self.context["request"].user
        to_user = validated_data.pop("to_user")
        return Friend.objects.create(
            from_user=from_user, to_user=to_user, status="pending"
        )


class FriendUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["status"]

    def validate_status(self, value):
        if value not in dict(Friend.STATUS_CHOICES).keys():
            raise serializers.ValidationError("Invalid status")
        return value


class SearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    degree = serializers.ListField(child=serializers.IntegerField(), required=False)
    majors = serializers.ListField(child=serializers.CharField(), required=False)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "message",
            "created_at",
            "is_read",
            "notification_type",
            "related_user_id",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def validate_notification_type(self, value):
        if value not in dict(Notification.NOTIFICATION_TYPE_CHOICES).keys():
            raise serializers.ValidationError("Invalid notification type")
        return value


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "profile"]


# 사용자와 공통 키워드를 반환
class RelatedUserSerializer(serializers.Serializer):
    user = UserDetailSerializer()
    common_keywords = serializers.ListField(child=serializers.CharField())
    similarity = serializers.IntegerField()


class SecondDegreeProfileSerializer(serializers.Serializer):
    second_degree_profile_id = serializers.IntegerField(help_text="2촌 사용자의 ID")
    connector_friend_id = serializers.IntegerField(
        help_text="2촌과 연결된 1촌 사용자의 ID"
    )


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ["id", "user", "text", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ["id", "user", "keyword", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.profile.user_name", read_only=True
    )  # 댓글 작성자 이름 추가

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "user_name",
            "project",
            "content",
            "created_at",
            "likes",
        ]
        read_only_fields = ["user", "project", "created_at", "likes"]
