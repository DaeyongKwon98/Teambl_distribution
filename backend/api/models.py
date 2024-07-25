from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Email field must be set")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        return self.create_user(username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=128, unique=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(null=True, blank=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    data_joined = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.username

class Keyword(models.Model):
    keyword = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.keyword

class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="projects") # 다른 곳에서 user.projects하면 Project object를 다 접근할 수 있게 됨
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    keywords = models.ManyToManyField(Keyword, blank=True)

    def __str__(self):
        return self.title

# class Profile(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="profile")
#     user_name = models.CharField(max_length=100)
#     major = models.CharField(max_length=100)
#     year = models.IntegerField()
#     keywords = models.ManyToManyField(Keyword, blank=True)

#     def __str__(self):
#         return self.user_name

# class InvitationLink(models.Model):
#     id = models.AutoField(primary_key=True)
#     inviter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="invitation_links")
#     link = models.CharField(max_length=255, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ('inviter', 'link')

#     def __str__(self):
#         return self.link

# class Friend(models.Model):
#     to_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="friends_to")
#     from_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="friends_from")
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ('to_user', 'from_user')

#     def __str__(self):
#         return f"{self.from_user.email} is friends with {self.to_user.email}"