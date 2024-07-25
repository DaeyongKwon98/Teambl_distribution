from rest_framework import serializers
from .models import CustomUser, Project, Keyword, Profile

# Json object를 Python object로 convert해준다. (and vice versa)


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ["id", "keyword"]


class ProfileSerializer(serializers.ModelSerializer):
    keywords = KeywordSerializer(many=True, required=False)

    class Meta:
        model = Profile
        fields = ["user_name", "major", "year", "keywords"]

    def create(self, validated_data):
        keywords_data = validated_data.pop("keywords", [])
        profile = Profile.objects.create(**validated_data)
        for keyword_data in keywords_data:
            keyword, created = Keyword.objects.get_or_create(
                keyword=keyword_data["keyword"]
            )
            profile.keywords.add(keyword)
        return profile


class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
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
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        profile_data = validated_data.pop("profile")

        user = CustomUser.objects.create_user(
            username=username, password=password, **validated_data
        )
        profile_data["user"] = user
        ProfileSerializer().create(profile_data)

        return user

    # TODO: keywords 로직이 변경됨에 따라 update 로직 수정 필요!
    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.set_password(validated_data["password"])
            validated_data.pop("password")
        return super().update(instance, validated_data)


class ProjectSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    keywords = serializers.SlugRelatedField(
        slug_field="keyword", queryset=Keyword.objects.all(), many=True
    )

    class Meta:
        model = Project
        fields = ["project_id", "user", "title", "content", "created_at", "keywords"]
        extra_kwargs = {"user": {"read_only": True}}

    def create(self, validated_data):
        print("프로젝트 생성")
        keywords_data = validated_data.pop("keywords", [])
        project = Project.objects.create(**validated_data)
        project.keywords.set(keywords_data)

        return project

    def update(self, instance, validated_data):
        keywords_data = validated_data.pop("keywords", [])
        instance = super().update(instance, validated_data)
        # instance.keywords.set(keywords_data)

        instance.keywords.clear()
        for keyword_data in keywords_data:
            keyword, created = Keyword.objects.get_or_create(
                keyword=keyword_data["keyword"]
            )
            instance.keywords.add(keyword)

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
        ]
        return representation
