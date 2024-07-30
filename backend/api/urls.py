from django.urls import path
from . import views

urlpatterns = [
    path("projects/", views.ProjectListCreate.as_view(), name="project-list"),
    path(
        "projects/delete/<int:pk>/",
        views.ProjectDelete.as_view(),
        name="delete-project",
    ),
    path("send_code/", views.SendCodeView.as_view(), name="send_code"),
    path("create-invitation-link/", views.CreateInvitationLinkView.as_view(), name='create-invitation-link'),
    path('delete-invitation-link/<int:pk>/', views.InvitationLinkDelete.as_view(), name='delete-invitation-link'),
    path('invitation-links/', views.InvitationLinkList.as_view(), name='invitation-links'),
]
