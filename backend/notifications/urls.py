from django.urls import path
from .views import (
    NotificationListView,
    NotificationUnreadListView,
    NotificationCreateView,
    NotificationRetrieveView,
    NotificationUpdateView,
    NotificationDestroyView,
    NotificationMarkAsReadView,
    NotificationSummaryView,
    NotificationMarkAllAsReadView,
    NotificationUnreadCountView,
    NotificationDeleteReadView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread/', NotificationUnreadListView.as_view(), name='notification-unread-list'),
    path('create/', NotificationCreateView.as_view(), name='notification-create'),
    path('summary/', NotificationSummaryView.as_view(), name='notification-summary'),
    path('read-all/', NotificationMarkAllAsReadView.as_view(), name='notification-read-all'),
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('delete-read/', NotificationDeleteReadView.as_view(), name='notification-delete-read'),
    path('<uuid:pk>/', NotificationRetrieveView.as_view(), name='notification-detail'),
    path('<uuid:pk>/update/', NotificationUpdateView.as_view(), name='notification-update'),
    path('<uuid:pk>/read/', NotificationMarkAsReadView.as_view(), name='notification-read'),
    path('<uuid:pk>/delete/', NotificationDestroyView.as_view(), name='notification-delete'),
]

