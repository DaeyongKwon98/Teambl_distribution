from rest_framework import serializers
from .models import CustomUser, Project, Keyword, Profile


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ["keyword"]


class ProfileSerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major",
            "keywords",
        ]

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def create(self, validated_data):
        profile = Profile.objects.create(**validated_data)
        return profile


class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

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
        profile_data = self.initial_data.get("profile", {})
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

    # TODO: keywords 로직이 변경됨에 따라 update 로직 수정 필요!
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
