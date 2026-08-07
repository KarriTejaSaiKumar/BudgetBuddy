import datetime
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from incomes.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


class ReportsAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='reports_user1', password='password123')
        self.user2 = User.objects.create_user(username='reports_user2', password='password123')

        today = datetime.date.today()
        self.today_str = today.strftime('%Y-%m-%d')
        prev_month = today.replace(day=1) - datetime.timedelta(days=15)
        self.prev_month_str = prev_month.strftime('%Y-%m-%d')

        # User 1 data
        Income.objects.create(user=self.user1, source='salary', amount=5000.00, date=self.today_str)
        Expense.objects.create(
            user=self.user1,
            title='Groceries',
            amount=200.00,
            currency='INR',
            payment_method='upi',
            category='groceries',
            expense_date=self.today_str
        )
        Budget.objects.create(user=self.user1, category='groceries', budget_amount=1000.00, month=today.month, year=today.year)
        SavingsGoal.objects.create(user=self.user1, goal_name='Trip Fund', target_amount=1500.00, current_amount=300.00, deadline=self.today_str)

    def test_monthly_report_current_month(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/monthly/?timeframe=current_month')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        report = res.data['report']
        self.assertEqual(report['total_income'], '5000.00')
        self.assertEqual(report['total_expense'], '200.00')
        self.assertEqual(report['current_balance'], '4800.00')
        self.assertEqual(report['total_savings'], '300.00')

    def test_custom_date_range_report(self):
        self.client.force_authenticate(user=self.user1)
        url = f'/api/reports/expenses/?timeframe=custom&start_date={self.today_str}&end_date={self.today_str}'
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['expenses']), 1)
        item = res.data['expenses'][0]
        self.assertEqual(item['title'], 'Groceries')
        self.assertEqual(item['currency'], 'INR')
        self.assertEqual(item['payment_method'], 'upi')

    def test_income_report(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/incomes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['incomes']), 1)
        self.assertEqual(res.data['incomes'][0]['source'], 'salary')

    def test_savings_report(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/savings/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['savings_goals']), 1)
        self.assertEqual(res.data['savings_goals'][0]['goal_name'], 'Trip Fund')

    def test_combined_financial_report(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/combined/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('financial_summary', res.data)
        self.assertIn('expense_summary', res.data)
        self.assertIn('income_summary', res.data)
        self.assertIn('budget_summary', res.data)
        self.assertIn('savings_summary', res.data)

    def test_csv_export_triggers_notification(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/export/expenses/csv/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename=', res['Content-Disposition'])

        notif = Notification.objects.filter(user=self.user1, notification_type='report', title='Report Generated').first()
        self.assertIsNotNone(notif)
        self.assertIn('Expenses (CSV)', notif.message)

    def test_pdf_export_triggers_notification(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/reports/export/monthly/pdf/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'application/pdf')
        self.assertTrue(res.content.startswith(b'%PDF-1.4'))

        notif = Notification.objects.filter(user=self.user1, notification_type='report', title='Report Generated').first()
        self.assertIsNotNone(notif)
        self.assertIn('Summary (PDF)', notif.message)

    def test_user_ownership_isolation(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.get('/api/reports/monthly/?timeframe=current_month')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        report = res.data['report']
        self.assertEqual(report['total_income'], '0.00')
        self.assertEqual(report['total_expense'], '0.00')

