from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

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
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

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
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, notification)
        
        notification.is_read = True
        notification.save()
        
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
        queryset = Notification.objects.filter(user=request.user, is_read=False)
        updated_count = queryset.update(is_read=True)
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
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
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
