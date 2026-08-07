from django.test import TestCase

import datetime
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import SavingsGoal
from notifications.models import Notification

class SavingsGoalAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='savings_user1', password='password123')
        self.user2 = User.objects.create_user(username='savings_user2', password='password123')
        self.future_date = (datetime.date.today() + datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        self.past_date = (datetime.date.today() - datetime.timedelta(days=10)).strftime('%Y-%m-%d')

        self.goal1 = SavingsGoal.objects.create(
            user=self.user1,
            goal_name='Emergency Fund',
            target_amount=1000.00,
            current_amount=200.00,
            deadline=self.future_date,
            notes='For rainy days'
        )

    def test_create_savings_goal(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "goal_name": "New Car",
            "target_amount": "5000.00",
            "current_amount": "1000.00",
            "deadline": self.future_date,
            "notes": "Down payment"
        }
        res = self.client.post('/api/savings/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['goal_name'], 'New Car')
        self.assertEqual(res.data['status'], 'In Progress')
        self.assertEqual(res.data['remaining_amount'], 4000.0)

        # Check notification
        notif = Notification.objects.filter(user=self.user1, title='Savings Goal Created').first()
        self.assertIsNotNone(notif)

    def test_auto_completion_status_and_notification(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "goal_name": "Tech Gadget",
            "target_amount": "500.00",
            "current_amount": "500.00",
            "deadline": self.future_date
        }
        res = self.client.post('/api/savings/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['is_completed'])
        self.assertEqual(res.data['status'], 'Completed')

        completed_notif = Notification.objects.filter(user=self.user1, title='Savings Goal Completed').first()
        self.assertIsNotNone(completed_notif)

    def test_update_savings_goal_to_completion(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "goal_name": "Emergency Fund",
            "target_amount": "1000.00",
            "current_amount": "1000.00",
            "deadline": self.future_date
        }
        res = self.client.put(f'/api/savings/{self.goal1.id}/update/', data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_completed'])
        self.assertEqual(res.data['status'], 'Completed')

    def test_past_deadline_validation_on_create(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "goal_name": "Old Goal",
            "target_amount": "100.00",
            "current_amount": "0.00",
            "deadline": self.past_date
        }
        res = self.client.post('/api/savings/', data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('deadline', res.data)

    def test_target_amount_validation(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "goal_name": "Zero Goal",
            "target_amount": "0.00",
            "deadline": self.future_date
        }
        res = self.client.post('/api/savings/', data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_ownership_isolation(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.get(f'/api/savings/{self.goal1.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_savings_summary_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/savings/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_savings_goal'], 1000.0)
        self.assertEqual(res.data['total_saved'], 200.0)
        self.assertEqual(res.data['remaining_savings'], 800.0)
        self.assertEqual(res.data['goal_completion_percentage'], 20.0)

