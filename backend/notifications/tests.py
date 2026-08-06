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
