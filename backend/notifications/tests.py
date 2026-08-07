import asyncio
import json
from django.test import TransactionTestCase
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from channels.testing import WebsocketCommunicator
from config.asgi import application
from .models import Notification

class NotificationWebSocketTests(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.token = str(AccessToken.for_user(self.user))

    def test_websocket_connection_success(self):
        async def run():
            communicator = WebsocketCommunicator(
                application, 
                f"/ws/notifications/?token={self.token}"
            )
            connected, subprotocol = await communicator.connect()
            self.assertTrue(connected)
            await communicator.disconnect()
        asyncio.run(run())

    def test_websocket_connection_unauthorized(self):
        async def run():
            communicator = WebsocketCommunicator(
                application, 
                "/ws/notifications/"
            )
            connected, subprotocol = await communicator.connect()
            self.assertFalse(connected)
        asyncio.run(run())

    def test_notification_broadcast(self):
        async def run():
            communicator = WebsocketCommunicator(
                application, 
                f"/ws/notifications/?token={self.token}"
            )
            connected, subprotocol = await communicator.connect()
            self.assertTrue(connected)

            # Create a notification in database
            from channels.db import database_sync_to_async
            create_notification = database_sync_to_async(Notification.objects.create)
            notification = await create_notification(
                user=self.user,
                message="Test broadcast notification"
            )

            # Receive the pushed message from WebSocket
            response = await communicator.receive_from()
            data = json.loads(response)

            self.assertEqual(data["message"], "Test broadcast notification")
            self.assertFalse(data["is_read"])
            
            await communicator.disconnect()
        asyncio.run(run())


from rest_framework.test import APITestCase
from rest_framework import status
from .services import (
    create_notification,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_notifications,
)

class NotificationServiceAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='notif_user1', password='password123')
        self.user2 = User.objects.create_user(username='notif_user2', password='password123')

    def test_notification_services(self):
        # Test create_notification
        n1 = create_notification(
            user=self.user1,
            title='Budget Exceeded',
            message='Food budget has reached 90%',
            notification_type='budget',
            priority='warning'
        )
        self.assertEqual(n1.title, 'Budget Exceeded')
        self.assertEqual(n1.notification_type, 'budget')
        self.assertEqual(n1.priority, 'warning')
        self.assertFalse(n1.is_read)

        # Test get_unread_notifications
        unread_qs = get_unread_notifications(self.user1)
        self.assertEqual(unread_qs.count(), 1)

        # Test mark_notification_read
        updated_n1 = mark_notification_read(n1.id, user=self.user1)
        self.assertTrue(updated_n1.is_read)
        self.assertEqual(get_unread_notifications(self.user1).count(), 0)

        # Test mark_all_notifications_read
        create_notification(self.user1, 'Test 2', 'Message 2')
        create_notification(self.user1, 'Test 3', 'Message 3')
        self.assertEqual(get_unread_notifications(self.user1).count(), 2)

        count = mark_all_notifications_read(self.user1)
        self.assertEqual(count, 2)
        self.assertEqual(get_unread_notifications(self.user1).count(), 0)

    def test_notification_api_endpoints(self):
        self.client.force_authenticate(user=self.user1)
        n1 = create_notification(self.user1, 'Salary Received', 'Income credited', 'income', 'success')
        n2 = create_notification(self.user1, 'High Expense', 'Large transaction', 'expense', 'warning')

        # Test GET /api/notifications/
        res = self.client.get('/api/notifications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        # Test GET /api/notifications/unread/
        res_unread = self.client.get('/api/notifications/unread/')
        self.assertEqual(res_unread.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_unread.data), 2)

        # Test filtering by type
        res_filter_type = self.client.get('/api/notifications/?type=income')
        self.assertEqual(res_filter_type.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_filter_type.data), 1)
        self.assertEqual(res_filter_type.data[0]['title'], 'Salary Received')

        # Test PATCH /api/notifications/<id>/read/
        res_read = self.client.patch(f'/api/notifications/{n1.id}/read/')
        self.assertEqual(res_read.status_code, status.HTTP_200_OK)
        self.assertTrue(res_read.data['is_read'])

        # Test PATCH /api/notifications/read-all/
        res_read_all = self.client.patch('/api/notifications/read-all/')
        self.assertEqual(res_read_all.status_code, status.HTTP_200_OK)
        self.assertEqual(res_read_all.data['updated_count'], 1)


from django.core import mail
from django.test import override_settings
from .email_service import (
    send_generic_notification_email,
    send_budget_alert_email,
    send_budget_exceeded_email,
    send_savings_goal_completed_email,
    send_monthly_report_email,
)

class NotificationEmailServiceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='emailuser', email='emailuser@example.com', password='password123')
        self.user_no_email = User.objects.create_user(username='noemailuser', password='password123')

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_generic_notification_email_success(self):
        success = send_generic_notification_email(self.user, 'Welcome', 'Welcome to BudgetBuddy')
        self.assertTrue(success)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Welcome to BudgetBuddy', mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].to, ['emailuser@example.com'])

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_budget_alert_and_exceeded_emails(self):
        alert_ok = send_budget_alert_email(self.user, 'Groceries', 850.00, 1000.00)
        self.assertTrue(alert_ok)

        exceeded_ok = send_budget_exceeded_email(self.user, 'Dining Out', 550.00, 500.00)
        self.assertTrue(exceeded_ok)
        self.assertEqual(len(mail.outbox), 2)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_savings_goal_completed_email(self):
        success = send_savings_goal_completed_email(self.user, 'New Laptop', 1500.00)
        self.assertTrue(success)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Goal Achieved', mail.outbox[0].subject)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_monthly_report_email(self):
        report_data = {'total_income': 5000.00, 'total_expense': 2000.00, 'current_balance': 3000.00}
        success = send_monthly_report_email(self.user, report_data)
        self.assertTrue(success)
        self.assertEqual(len(mail.outbox), 1)

    def test_send_email_graceful_failure_no_recipient_email(self):
        success = send_generic_notification_email(self.user_no_email, 'Hello', 'Test msg')
        self.assertFalse(success)
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend', EMAIL_HOST='')
    def test_send_email_graceful_failure_unconfigured_host(self):
        success = send_generic_notification_email(self.user, 'Hello', 'Test msg')
        self.assertFalse(success)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_create_notification_with_send_email_updates_email_sent(self):
        notif = create_notification(
            user=self.user,
            title="Important Alert",
            message="Check your budget",
            send_email=True
        )
        self.assertTrue(notif.email_sent)
        self.assertEqual(len(mail.outbox), 1)


