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

    def test_budget_creation_with_new_fields_and_month_year_derivation(self):
        request = self.factory.post('/api/budgets/')
        request.user = self.user
        data = {
            'budget_name': 'Summer Travel Budget',
            'category': 'travel',
            'budget_amount': '1500.00',
            'currency': 'usd',
            'notes': 'Vacation expenses',
            'start_date': '2026-08-01',
            'end_date': '2026-08-15',
            'is_active': True
        }
        serializer = BudgetSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        budget = serializer.save(user=self.user)
        self.assertEqual(budget.budget_name, 'Summer Travel Budget')
        self.assertEqual(budget.currency, 'USD')
        self.assertEqual(budget.month, 8)
        self.assertEqual(budget.year, 2026)
        self.assertTrue(budget.is_active)

    def test_budget_invalid_currency_returns_error(self):
        request = self.factory.post('/api/budgets/')
        request.user = self.user
        data = {
            'category': 'travel',
            'budget_amount': '100.00',
            'currency': 'INVALID_CURR'
        }
        serializer = BudgetSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('currency', serializer.errors)

    def test_budget_end_date_earlier_than_start_date_returns_error(self):
        request = self.factory.post('/api/budgets/')
        request.user = self.user
        data = {
            'category': 'travel',
            'budget_amount': '100.00',
            'start_date': '2026-08-15',
            'end_date': '2026-08-01'
        }
        serializer = BudgetSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('end_date', serializer.errors)


class BudgetAPIFilterSortTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='budget_api_user', password='password123')
        self.client.force_authenticate(user=self.user)

        self.b1 = Budget.objects.create(
            user=self.user,
            budget_name='Food Budget',
            category='food',
            budget_amount=500.00,
            currency='INR',
            start_date='2026-08-01',
            end_date='2026-08-31',
            is_active=True
        )
        self.b2 = Budget.objects.create(
            user=self.user,
            budget_name='USD Travel Budget',
            category='travel',
            budget_amount=1200.00,
            currency='USD',
            start_date='2026-09-01',
            end_date='2026-09-15',
            is_active=False
        )

    def test_filter_budgets_by_category_currency_is_active(self):
        # Filter by category
        res = self.client.get('/api/budgets/?category=food')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['category'], 'food')

        # Filter by currency
        res = self.client.get('/api/budgets/?currency=USD')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['currency'], 'USD')

        # Filter by is_active
        res = self.client.get('/api/budgets/?is_active=false')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['budget_name'], 'USD Travel Budget')

    def test_sort_budgets_by_start_date_end_date_amount(self):
        # Sort by budget_amount descending
        res = self.client.get('/api/budgets/?sort=-budget_amount')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        amounts = [float(item['budget_amount']) for item in res.data]
        self.assertEqual(amounts, [1200.00, 500.00])

        # Sort by start_date ascending
        res = self.client.get('/api/budgets/?sort=start_date')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        dates = [item['start_date'] for item in res.data]
        self.assertEqual(dates, ['2026-08-01', '2026-09-01'])


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


class BudgetSummaryAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='summary_user', password='password123')
        self.other_user = User.objects.create_user(username='other_summary_user', password='password123')
        self.client.force_authenticate(user=self.user)

        self.budget = Budget.objects.create(
            user=self.user,
            budget_name='Dining Out',
            category='food',
            budget_amount=100.00,
            currency='INR'
        )

    def test_budget_summary_status_on_track(self):
        # 50% spent -> On Track
        Expense.objects.create(user=self.user, title='Lunch', amount=50.00, category='food', expense_date='2026-08-01')
        res = self.client.get(f'/api/budgets/{self.budget.id}/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['budget_name'], 'Dining Out')
        self.assertEqual(res.data['currency'], 'INR')
        self.assertEqual(res.data['amount_spent'], 50.00)
        self.assertEqual(res.data['remaining_amount'], 50.00)
        self.assertEqual(res.data['utilization_percentage'], 50.00)
        self.assertEqual(res.data['status'], 'On Track')

    def test_budget_summary_status_near_limit(self):
        # 85% spent -> Near Limit
        Expense.objects.create(user=self.user, title='Dinner', amount=85.00, category='food', expense_date='2026-08-02')
        res = self.client.get(f'/api/budgets/{self.budget.id}/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['utilization_percentage'], 85.00)
        self.assertEqual(res.data['status'], 'Near Limit')

    def test_budget_summary_status_over_budget(self):
        # 110% spent -> Over Budget
        Expense.objects.create(user=self.user, title='Feast', amount=110.00, category='food', expense_date='2026-08-03')
        res = self.client.get(f'/api/budgets/{self.budget.id}/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['utilization_percentage'], 110.00)
        self.assertEqual(res.data['status'], 'Over Budget')
        self.assertEqual(res.data['remaining_amount'], 0.0)

    def test_budget_summary_user_ownership_isolation(self):
        self.client.force_authenticate(user=self.other_user)
        res = self.client.get(f'/api/budgets/{self.budget.id}/summary/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


