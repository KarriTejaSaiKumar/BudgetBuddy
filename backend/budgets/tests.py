from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate
from rest_framework import status
import uuid
from budgets.models import Budget
from expenses.models import Expense
from incomes.models import Income
from budgets.serializers import BudgetSerializer

User = get_user_model()

class BudgetSerializerTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.user2 = User.objects.create_user(username='testuser2', password='password123')

    def test_budget_serializer_valid_creation(self):
        request = self.factory.post('/api/budgets/')
        request.user = self.user
        data = {
            'category': 'Food',
            'budget_amount': '500.00',
            'month': 7,
            'year': 2026
        }
        serializer = BudgetSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        budget = serializer.save(user=self.user)
        self.assertEqual(budget.category, 'food')
        self.assertEqual(budget.budget_amount, 500.00)


class DashboardSummaryAPITestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='dash_user1', password='password123')
        self.user2 = User.objects.create_user(username='dash_user2', password='password123')

    def test_dashboard_summary_with_records(self):
        Income.objects.create(
            user=self.user1,
            source='salary',
            amount=25000.00,
            description='Monthly Salary',
            date='2026-07-23'
        )
        Expense.objects.create(
            user=self.user1,
            title='Groceries',
            amount=18000.00,
            category='groceries',
            expense_date='2026-07-24'
        )
        Budget.objects.create(
            user=self.user1,
            category='groceries',
            budget_amount=22000.00,
            month=7,
            year=2026
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_income'], 25000.0)
        self.assertEqual(response.data['total_expense'], 18000.0)
        self.assertEqual(response.data['current_balance'], 7000.0)
        self.assertEqual(response.data['total_budget'], 22000.0)
        self.assertEqual(response.data['remaining_budget'], 4000.0)

        recent_txs = response.data['recent_transactions']
        self.assertEqual(len(recent_txs), 2)
        self.assertEqual(recent_txs[0]['type'], 'Expense')
        self.assertEqual(recent_txs[0]['title'], 'Groceries')
        self.assertEqual(recent_txs[1]['type'], 'Income')
        self.assertEqual(recent_txs[1]['title'], 'Monthly Salary')

    def test_dashboard_summary_empty_records(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_income'], 0)
        self.assertEqual(response.data['total_expense'], 0)
        self.assertEqual(response.data['current_balance'], 0)
        self.assertEqual(response.data['total_budget'], 0)
        self.assertEqual(response.data['remaining_budget'], 0)
        self.assertEqual(response.data['recent_transactions'], [])

    def test_dashboard_summary_unauthenticated(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
