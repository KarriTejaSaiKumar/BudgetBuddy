from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Expense

class ExpenseAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        
        self.expense1 = Expense.objects.create(
            user=self.user1,
            title='Rent Payment',
            amount=1000.00,
            category='housing',
            expense_date='2026-07-01'
        )

    def test_unauthenticated_access_returns_401(self):
        response = self.client.get('/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_expense_with_category_case_normalization(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Supermarket Groceries",
            "amount": "150.75",
            "category": "Groceries",  # Capitalized input
            "expense_date": "2026-07-20"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'groceries')

    def test_create_expense_invalid_amount_returns_400(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Invalid Amount Expense",
            "amount": "-50.00",
            "category": "food",
            "expense_date": "2026-07-20"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_all_expenses_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_single_expense_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_expense_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        data = {"title": "Updated Rent Payment", "amount": "1050.00", "category": "housing", "expense_date": "2026-07-01"}
        response = self.client.put(f'/api/expenses/{self.expense1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Updated Rent Payment")

    def test_delete_expense_returns_204(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_cross_user_access_returns_404(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_expense_summary_endpoint_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/expenses/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_expense'], 1000.00)

    def test_expense_summary_endpoint_no_expenses_returns_zero(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/expenses/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_expense'], 0)


    def test_filter_expenses_by_valid_category_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        # Create second expense with different category
        Expense.objects.create(
            user=self.user1,
            title='Dinner',
            amount=50.00,
            category='food',
            expense_date='2026-07-21'
        )
        response = self.client.get('/api/expenses/?category=food')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'food')

    def test_filter_expenses_by_invalid_category_returns_400(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/expenses/?category=invalid_category')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', response.data)

    def test_sort_expenses_valid_options(self):
        self.client.force_authenticate(user=self.user1)
        Expense.objects.create(
            user=self.user1,
            title='Cheap Lunch',
            amount=15.00,
            category='food',
            expense_date='2026-07-10'
        )
        Expense.objects.create(
            user=self.user1,
            title='Expensive Dinner',
            amount=200.00,
            category='food',
            expense_date='2026-07-20'
        )

        # Test highest
        res_highest = self.client.get('/api/expenses/?sort=highest')
        self.assertEqual(res_highest.status_code, status.HTTP_200_OK)
        amounts = [float(item['amount']) for item in res_highest.data]
        self.assertEqual(amounts, sorted(amounts, reverse=True))

        # Test lowest
        res_lowest = self.client.get('/api/expenses/?sort=lowest')
        self.assertEqual(res_lowest.status_code, status.HTTP_200_OK)
        amounts_low = [float(item['amount']) for item in res_lowest.data]
        self.assertEqual(amounts_low, sorted(amounts_low))

        # Test oldest
        res_oldest = self.client.get('/api/expenses/?sort=oldest')
        self.assertEqual(res_oldest.status_code, status.HTTP_200_OK)
        dates = [item['expense_date'] for item in res_oldest.data]
        self.assertEqual(dates, sorted(dates))

        # Test combined category and sort
        res_combined = self.client.get('/api/expenses/?category=food&sort=highest')
        self.assertEqual(res_combined.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item['category'] == 'food' for item in res_combined.data))
        food_amounts = [float(item['amount']) for item in res_combined.data]
        self.assertEqual(food_amounts, [200.00, 15.00])

        # Test sort invalid
    def test_sort_expenses_invalid_returns_400(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/expenses/?sort=invalid_sort')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sort', response.data)

    def test_create_expense_with_new_fields(self):
        from budgets.models import Budget
        budget1 = Budget.objects.create(user=self.user1, category='food', budget_amount=500.00, month=8, year=2026)
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Electronics Purchase",
            "amount": "250.00",
            "currency": "usd",
            "category": "other",
            "payment_method": "Credit Card",
            "transaction_time": "14:30:00",
            "budget": budget1.id,
            "expense_date": "2026-08-07"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['currency'], 'USD')
        self.assertEqual(response.data['payment_method'], 'credit_card')
        self.assertEqual(response.data['payment_method_display'], 'Credit Card')
        self.assertEqual(str(response.data['budget']), str(budget1.id))

    def test_create_expense_invalid_currency_returns_400(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Coffee",
            "amount": "5.00",
            "currency": "INVALID_CURRENCY",
            "category": "food",
            "expense_date": "2026-08-07"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_expense_invalid_payment_method_returns_400(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Lunch",
            "amount": "15.00",
            "payment_method": "INVALID_METHOD",
            "category": "food",
            "expense_date": "2026-08-07"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_expense_with_other_user_budget_returns_400(self):
        from budgets.models import Budget
        budget_user2 = Budget.objects.create(user=self.user2, category='food', budget_amount=500.00, month=8, year=2026)
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Sneaky Expense",
            "amount": "50.00",
            "budget": budget_user2.id,
            "category": "food",
            "expense_date": "2026-08-07"
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('budget', response.data)

    def test_filter_expenses_by_currency_and_payment_method(self):
        self.client.force_authenticate(user=self.user1)
        Expense.objects.create(
            user=self.user1,
            title='UPI Payment',
            amount=300.00,
            currency='INR',
            payment_method='upi',
            category='utilities',
            expense_date='2026-08-07'
        )
        Expense.objects.create(
            user=self.user1,
            title='USD Online Sub',
            amount=10.00,
            currency='USD',
            payment_method='credit_card',
            category='entertainment',
            expense_date='2026-08-07'
        )

        res_curr = self.client.get('/api/expenses/?currency=USD')
        self.assertEqual(res_curr.status_code, status.HTTP_200_OK)
        res_pm = self.client.get('/api/expenses/?payment_method=upi')
        self.assertEqual(res_pm.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item['payment_method'] == 'upi' for item in res_pm.data))

    def test_create_expense_triggers_notification(self):
        from notifications.models import Notification
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "Grocery Run",
            "amount": "120.00",
            "currency": "INR",
            "category": "groceries",
            "expense_date": "2026-08-07"
        }
        res = self.client.post('/api/expenses/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        notif = Notification.objects.filter(user=self.user1, notification_type='expense', title='Expense Added').first()
        self.assertIsNotNone(notif)
        self.assertIn('Grocery Run', notif.message)
        self.assertEqual(notif.priority, 'success')

    def test_update_expense_triggers_notification(self):
        from notifications.models import Notification
        self.client.force_authenticate(user=self.user1)
        data = {"title": "Updated Rent", "amount": "1100.00", "currency": "INR", "category": "housing", "expense_date": "2026-07-01"}
        res = self.client.put(f'/api/expenses/{self.expense1.id}/', data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        notif = Notification.objects.filter(user=self.user1, notification_type='expense', title='Expense Updated').first()
        self.assertIsNotNone(notif)
        self.assertIn('Updated Rent', notif.message)
        self.assertEqual(notif.priority, 'info')

    def test_delete_expense_triggers_notification(self):
        from notifications.models import Notification
        self.client.force_authenticate(user=self.user1)
        exp_id = self.expense1.id
        exp_title = self.expense1.title
        res = self.client.delete(f'/api/expenses/{exp_id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        notif = Notification.objects.filter(user=self.user1, notification_type='expense', title='Expense Deleted').first()
        self.assertIsNotNone(notif)
        self.assertIn(exp_title, notif.message)
        self.assertEqual(notif.priority, 'warning')





