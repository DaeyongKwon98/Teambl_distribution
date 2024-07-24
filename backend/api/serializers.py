from rest_framework import serializers
from .models import CustomUser

# Json object를 Python object로 convert해준다. (and vice versa)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'last_login', 'is_superuser', 'is_staff', 'is_active', 'data_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'last_login': {'read_only': True},
            'is_superuser': {'read_only': True},
            'is_staff': {'read_only': True},
            'is_active': {'read_only': True},
            'data_joined': {'read_only': True},
        }

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(username=username, password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            validated_data.pop('password')
        return super().update(instance, validated_data)
