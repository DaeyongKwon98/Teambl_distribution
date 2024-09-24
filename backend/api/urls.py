from django.urls import path
from . import views

# User
urlpatterns = [
    path("current-user/", views.CurrentUserView.as_view(), name="current-user"),
    path("delete-user/", views.DeleteUserView.as_view(), name="delete-user"),
    path("user/<int:id>/", views.OtherUserView.as_view(), name="other-user"),
    path("latest-user-id/", views.LatestUserIdView.as_view(), name="latest-user-id"),
]

# Profile
urlpatterns += [
    path("profile/update/", views.ProfileUpdateView.as_view(), name="update-profile"),
    path(
        "profile/<int:userid>/", views.CurrentProfileView.as_view(), name="user-profile"
    ),
    path(
        "profile/updateOneDegreeCount/<int:user_id>/",
        views.UpdateOneDegreeCountView.as_view(),
        name="update-profile-one-degree-count",
    ),
]

# Keyword
urlpatterns += [
    path("keywords/", views.KeywordListView.as_view(), name="keyword-list"),
]

# Project
urlpatterns += [
    path("projects/", views.ProjectListCreate.as_view(), name="project-list"),
    path(
        "projects/every/",
        views.ProjectEveryListCreate.as_view(),
        name="project-every-list",
    ),
    path(
        "projects/<int:pk>/edit/",
        views.ProjectUpdateView.as_view(),
        name="project-edit",
    ),
    path(
        "projects/delete/<int:pk>/",
        views.ProjectDelete.as_view(),
        name="delete-project",
    ),
    path(
        "projects/<int:project_id>/like-toggle/",
        views.ProjectLikeToggleView.as_view(),
        name="project-like-toggle",
    ),
    path(
        'projects/<int:project_id>/liked-status/', 
        views.ProjectLikedStatusView.as_view(), 
        name='project-liked-status'
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
        "friends/<int:user_id>/",
        views.ListFriendView.as_view(),
        name="friend-list-with-userId",
    ),
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
    path(
        "notifications-unread-count/",
        views.UnreadNotificationCountView.as_view(),
        name="notification-unread-count",
    ),
]

# User Similarity
urlpatterns += [
    path(
        "user-similarity/",
        views.KeywordBasedUserSimilarityView.as_view(),
        name="user-similarity",
    ),
]

# Password
urlpatterns += [
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "check-password/",
        views.CheckPasswordView.as_view(),
        name="check-password",
    ),
]

# 이메일로 문의 보내기 기능이 구현되어서 삭제해도 되지 않을까..?
# Inquiry
urlpatterns += [
    path("create-inquiry/", views.InquiryCreateView.as_view(), name="create-inquiry"),
]

# Email
urlpatterns += [
    path("send_code/", views.SendCodeView.as_view(), name="send_code"),
    path("send_email/", views.SendEmailView.as_view(), name="send_email"),
]

# Search History
urlpatterns += [
    path(
        "search-history/",
        views.SearchHistoryListCreateView.as_view(),
        name="search-history-list-create",
    ),
    path(
        "search-history/<int:pk>/",
        views.SearchHistoryDeleteView.as_view(),
        name="search-history-delete",
    ),
]

# Comment
urlpatterns += [
    path(
        "projects/<int:project_id>/comments/",
        views.CommentListView.as_view(),
        name="comment-list",
    ),
    path(
        "projects/<int:project_id>/comments/create/",
        views.CommentCreateView.as_view(),
        name="comment-create",
    ),
    path(
        "comments/<int:pk>/edit/",
        views.CommentUpdateView.as_view(),
        name="comment-edit",
    ),
    path(
        "comments/<int:pk>/delete/",
        views.CommentDeleteView.as_view(),
        name="comment-delete",
    ),
]

# Others
urlpatterns += [
    path("check-email/", views.CheckEmailExistsView.as_view(), name="check-email"),
    path("welcome/", views.WelcomeView.as_view(), name="welcome-view"),
    path("search/", views.SearchUsersAPIView.as_view(), name="search-view"),
    path(
        "get-user-distance/<int:pk>/",
        views.GetUserDistanceAPIView.as_view(),
        name="get-user-distance",
    ),
    path(
        "user-statistics-difference/",
        views.UserStatisticsDifferenceView.as_view(),
        name="user-statistics-difference",
    ),
    path(
        "path/<int:target_user_id>/",
        views.GetUserAllPathsAPIView.as_view(),
        name="get-all-user-paths",
    ),
]
