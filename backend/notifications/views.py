from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from .services import (
    create_notification,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_notifications,
)

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a notification to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class NotificationCreateView(generics.CreateAPIView):
    """
    POST /api/notifications/create/ - Create a new notification for the authenticated user.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/ - List all notifications for the authenticated user.
    Supports filtering by ?type=expense, ?priority=warning, ?is_read=false, ?unread_only=true
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        notification_type = self.request.query_params.get('type', None) or self.request.query_params.get('notification_type', None)
        if notification_type and notification_type.strip():
            queryset = queryset.filter(notification_type=notification_type.strip().lower())

        priority = self.request.query_params.get('priority', None)
        if priority and priority.strip():
            queryset = queryset.filter(priority=priority.strip().lower())

        is_read_param = self.request.query_params.get('is_read', None)
        if is_read_param is not None and is_read_param.strip():
            val = is_read_param.strip().lower()
            if val in ['true', '1']:
                queryset = queryset.filter(is_read=True)
            elif val in ['false', '0']:
                queryset = queryset.filter(is_read=False)

        unread_only = self.request.query_params.get('unread_only', None)
        if unread_only is not None and unread_only.strip().lower() in ['true', '1']:
            queryset = queryset.filter(is_read=False)

        return queryset

class NotificationUnreadListView(generics.ListAPIView):
    """
    GET /api/notifications/unread/ - List all unread notifications for authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return get_unread_notifications(self.request.user)

class NotificationRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/notifications/<uuid:pk>/ - Retrieve details of a specific notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/notifications/<uuid:pk>/update/ - Update a specific notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

class NotificationDestroyView(generics.DestroyAPIView):
    """
    DELETE /api/notifications/<uuid:pk>/delete/ - Delete a specific notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationMarkAsReadView(APIView):
    """
    PATCH /api/notifications/<uuid:pk>/read/ - Mark a notification as read.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def patch(self, request, pk, *args, **kwargs):
        notification = mark_notification_read(pk, user=request.user)
        if not notification:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

class NotificationSummaryView(APIView):
    """
    GET /api/notifications/summary/ - Summary of all, unread, and read notifications for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(user=request.user)
        total = queryset.count()
        unread = queryset.filter(is_read=False).count()
        read = total - unread
        return Response({
            "total_notifications": total,
            "unread_notifications": unread,
            "read_notifications": read
        }, status=status.HTTP_200_OK)

class NotificationMarkAllAsReadView(APIView):
    """
    PATCH /api/notifications/read-all/ - Mark all notifications as read for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        updated_count = mark_all_notifications_read(request.user)
        return Response({
            "message": "All notifications marked as read.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/ - Count of unread notifications for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        unread_count = get_unread_notifications(request.user).count()
        return Response({
            "unread_count": unread_count
        }, status=status.HTTP_200_OK)

class NotificationDeleteReadView(APIView):
    """
    DELETE /api/notifications/delete-read/ - Delete all read notifications for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        queryset = Notification.objects.filter(user=request.user, is_read=True)
        deleted_count, _ = queryset.delete()
        return Response({
            "message": "Read notifications deleted successfully.",
            "deleted_count": deleted_count
        }, status=status.HTTP_200_OK)

