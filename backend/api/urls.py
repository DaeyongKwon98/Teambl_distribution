from django.urls import path
from . import views

# User
urlpatterns = [
    path("current-user/", views.CurrentUserView.as_view(), name="current-user"),
    path("delete-user/", views.DeleteUserView.as_view(), name="delete-user"),
]

# Profile
urlpatterns += [
    path("profile/update/", views.ProfileUpdateView.as_view(), name="update-profile"),
]

# Keyword
urlpatterns += [
    path("keywords/", views.KeywordListView.as_view(), name="keyword-list"),
]

# Project
urlpatterns += [
    path("projects/", views.ProjectListCreate.as_view(), name="project-list"),
    path(
        "projects/delete/<int:pk>/",
        views.ProjectDelete.as_view(),
        name="delete-project",
    ),
]

# Invitation
urlpatterns += [
    path(
        "create-invitation-link/",
        views.CreateInvitationLinkView.as_view(),
        name="create-invitation-link",
    ),
    path(
        "delete-invitation-link/<int:pk>/",
        views.InvitationLinkDelete.as_view(),
        name="delete-invitation-link",
    ),
    path(
        "invitation-links/", views.InvitationLinkList.as_view(), name="invitation-links"
    ),
]

# Friends
urlpatterns += [
    path("friends/", views.ListCreateFriendView.as_view(), name="friend-list"),
    path(
        "friends/update/<int:pk>/",
        views.FriendUpdateView.as_view(),
        name="friend-update",
    ),
    path(
        "friends/delete/<int:pk>/",
        views.FriendDeleteView.as_view(),
        name="friend-delete",
    ),
]

# Notifications
urlpatterns += [
    path(
        "notifications/",
        views.NotificationListCreateView.as_view(),
        name="notification-list",
    ),
    path(
        "notifications/update/<int:pk>/",
        views.NotificationUpdateView.as_view(),
        name="notification-update",
    ),
    path(
        "notifications/delete/<int:pk>/",
        views.NotificationDeleteView.as_view(),
        name="notification-delete",
    ),
]

# Others
urlpatterns += [
    path("send_code/", views.SendCodeView.as_view(), name="send_code"),
    path("welcome/", views.WelcomeView.as_view(), name="welcome-view"),
    path("search/", views.SearchUsersAPIView.as_view(), name="search-view"),
    path(
        "get-user-distance/<int:pk>/",
        views.GetUserDistanceAPIView.as_view(),
        name="get-user-distance",
    ),
    path(
        "change-password/", views.ChangePasswordView.as_view(), name="change-password"
    ),
]
