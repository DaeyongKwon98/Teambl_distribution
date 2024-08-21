from rest_framework import serializers
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
)


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

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major",
            "keywords",
            "one_degree_count",
            "introduction",
            "tools",
            "experiences",
            "portfolio_links",
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
    major = serializers.CharField(required=False)
    tools = ToolSerializer(many=True, required=False)
    introduction = serializers.CharField(required=False)
    experiences = ExperienceSerializer(many=True, required=False)
    portfolio_links = PortfolioLinkSerializer(many=True, required=False)
    keywords = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major",
            "tools",
            "introduction",
            "experiences",
            "portfolio_links",
            "keywords",
        ]

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def update(self, instance, validated_data):
        tools_data = validated_data.pop("tools", None)
        experiences_data = validated_data.pop("experiences", None)
        portfolio_links_data = validated_data.pop("portfolio_links", None)
        # 키워드를 initial_data에서 추출
        keywords_data = self.initial_data.get("keywords", [])
        # keywords 필드를 validated_data에서 제거
        validated_data.pop("keywords", None)

        # Update basic fields only if they are provided in the validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

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
            "data_joined",
            "profile",
            "code",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "last_login": {"read_only": True},
            "is_superuser": {"read_only": True},
            "is_staff": {"read_only": True},
            "is_active": {"read_only": True},
            "data_joined": {"read_only": True},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        keywords_data = profile_data.pop("keywords", [])

        # CustomUser 인스턴스 생성
        user = CustomUser.objects.create_user(
            email=validated_data["email"], password=validated_data["password"]
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

    class Meta:
        model = Project
        fields = ["project_id", "user", "title", "content", "created_at", "keywords"]
        extra_kwargs = {"user": {"read_only": True}}

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def create(self, validated_data):
        # 키워드를 initial_data에서 추출
        keywords_data = self.initial_data.get("keywords", [])

        # keywords 필드를 validated_data에서 제거
        validated_data.pop("keywords", None)

        # Project 인스턴스 생성
        project = Project.objects.create(**validated_data)

        # 키워드를 프로젝트와 연결
        keyword_objs = []
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            keyword_objs.append(keyword_obj)

        # set() 메서드를 사용하여 Many-to-Many 관계 설정
        project.keywords.set(keyword_objs)

        return project


class InvitationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvitationLink
        fields = ["id", "inviter", "invitee_name", "link", "created_at", "status"]
        read_only_fields = ["id", "inviter", "created_at"]


class FriendCreateSerializer(serializers.ModelSerializer):
    to_user_email = serializers.EmailField(write_only=True)
    from_user = CustomUserSerializer(read_only=True)
    to_user = CustomUserSerializer(read_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Friend
        fields = ["id", "from_user", "to_user", "status", "to_user_email"]
        read_only_fields = ["id", "from_user", "to_user"]

    def validate_to_user_email(self, value):
        try:
            to_user = CustomUser.objects.get(email=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return to_user

    def validate(self, attrs):
        if "to_user_email" in attrs:
            from_user = self.context["request"].user
            to_user = attrs["to_user_email"]

            if from_user == to_user:
                raise serializers.ValidationError(
                    "You cannot be friends with yourself."
                )

            if Friend.objects.filter(from_user=from_user, to_user=to_user).exists():
                raise serializers.ValidationError("Friendship request already exists.")

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
    major = serializers.ListField(child=serializers.CharField(), required=False)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "message", "created_at", "is_read", "notification_type"]
        read_only_fields = ["id", "user", "created_at"]

    def validate_notification_type(self, value):
        if value not in dict(Notification.NOTIFICATION_TYPE_CHOICES).keys():
            raise serializers.ValidationError("Invalid notification type")
        return value
