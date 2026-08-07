from .models import Notification
from .email_service import send_generic_notification_email

def create_notification(user, title, message, notification_type='system', priority='info', email_sent=False, send_email=False):
    """
    Creates and returns a new Notification instance for the given user.
    Reusable across all apps (expenses, budgets, incomes, etc.).
    If send_email is True, attempts to deliver an email notification.
    """
    if not title:
        title = "Notification"
    if notification_type:
        notification_type = notification_type.strip().lower()
    if priority:
        priority = priority.strip().lower()

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type or 'system',
        priority=priority or 'info',
        email_sent=email_sent,
        is_read=False
    )

    if send_email:
        sent = send_generic_notification_email(user=user, title=title, message=message)
        if sent and not notification.email_sent:
            notification.email_sent = True
            notification.save(update_fields=['email_sent'])

    return notification



def mark_notification_read(notification_id, user=None):
    """
    Marks a specific notification as read.
    If user is provided, verifies ownership.
    Returns the updated Notification instance, or None if not found.
    """
    try:
        queryset = Notification.objects.all()
        if user:
            queryset = queryset.filter(user=user)
        notification = queryset.get(pk=notification_id)
        if not notification.is_read:
            notification.is_read = True
            notification.save()
        return notification
    except Notification.DoesNotExist:
        return None


def mark_all_notifications_read(user):
    """
    Marks all unread notifications for a user as read.
    Returns the count of updated notifications.
    """
    return Notification.objects.filter(user=user, is_read=False).update(is_read=True)


def get_unread_notifications(user):
    """
    Returns a queryset of all unread notifications for a given user.
    """
    return Notification.objects.filter(user=user, is_read=False).order_by('-created_at')
