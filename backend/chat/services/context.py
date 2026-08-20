"""
User Data Context Layer for BudgetBuddy AI Assistant.

Builds strictly user-scoped, minimal domain contexts from Django ORM models.
Ensures zero data leakage between users and prevents querying unrequested domains.
"""
import calendar
from datetime import date, timedelta
from typing import Dict, Any, Optional, List, Tuple
from django.utils import timezone
from django.db.models import Sum, Q

from incomes.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from reports.models import Report
from analytics.services import (
    get_category_expense_analysis,
    get_monthly_expense_trend,
    get_expense_extremes,
)
from .calculators import (
    calculate_income_metrics,
    calculate_expense_metrics,
    calculate_budget_metrics,
    calculate_savings_metrics,
    calculate_financial_summary,
)
from .intent import IntentResult


def get_timeframe_bounds(timeframe: str) -> Tuple[Optional[date], Optional[date], int, int, str]:
    """
    Compute start_date, end_date, month, year, and human-friendly period label.
    """
    now = timezone.now().date()
    current_year = now.year
    current_month = now.month

    if timeframe == 'last_month':
        if current_month == 1:
            lm_month = 12
            lm_year = current_year - 1
        else:
            lm_month = current_month - 1
            lm_year = current_year
        _, last_day = calendar.monthrange(lm_year, lm_month)
        start_d = date(lm_year, lm_month, 1)
        end_d = date(lm_year, lm_month, last_day)
        label = f"{calendar.month_name[lm_month]} {lm_year}"
        return start_d, end_d, lm_month, lm_year, label

    elif timeframe == 'this_year':
        start_d = date(current_year, 1, 1)
        end_d = date(current_year, 12, 31)
        label = f"Year {current_year}"
        return start_d, end_d, current_month, current_year, label

    elif timeframe == 'all_time':
        label = "All Time"
        return None, None, current_month, current_year, label

    else:
        # Default: current_month
        _, last_day = calendar.monthrange(current_year, current_month)
        start_d = date(current_year, current_month, 1)
        end_d = date(current_year, current_month, last_day)
        label = f"{calendar.month_name[current_month]} {current_year}"
        return start_d, end_d, current_month, current_year, label


class ExpenseContextBuilder:
    """
    Builds context for Expense domain strictly for user=user.
    """
    @staticmethod
    def build(user, timeframe: str = 'current_month', category: Optional[str] = None) -> Dict[str, Any]:
        start_d, end_d, month, year, period_label = get_timeframe_bounds(timeframe)

        qs = Expense.objects.filter(user=user)
        if start_d and end_d:
            qs = qs.filter(expense_date__gte=start_d, expense_date__lte=end_d)
        if category:
            qs = qs.filter(category=category)

        days_in_period = None
        if start_d and end_d:
            days_in_period = (end_d - start_d).days + 1

        metrics = calculate_expense_metrics(qs, days_in_period=days_in_period)

        # Recent transactions (minimal fields)
        recent_items = [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category,
                "date": str(exp.expense_date),
                "payment_method": exp.payment_method,
            }
            for exp in qs.order_by('-expense_date', '-created_at')[:5]
        ]

        return {
            "domain": "expenses",
            "period": timeframe,
            "period_label": period_label,
            "category_filter": category,
            "metrics": metrics,
            "recent_items": recent_items,
        }


class IncomeContextBuilder:
    """
    Builds context for Income domain strictly for user=user.
    """
    @staticmethod
    def build(user, timeframe: str = 'current_month', source: Optional[str] = None) -> Dict[str, Any]:
        start_d, end_d, month, year, period_label = get_timeframe_bounds(timeframe)

        qs = Income.objects.filter(user=user)
        if start_d and end_d:
            qs = qs.filter(date__gte=start_d, date__lte=end_d)
        if source:
            qs = qs.filter(source=source)

        metrics = calculate_income_metrics(qs)

        recent_items = [
            {
                "source": inc.source,
                "amount": float(inc.amount),
                "date": str(inc.date),
                "description": inc.description or '',
            }
            for inc in qs.order_by('-date', '-created_at')[:5]
        ]

        return {
            "domain": "incomes",
            "period": timeframe,
            "period_label": period_label,
            "source_filter": source,
            "metrics": metrics,
            "recent_items": recent_items,
        }


class BudgetContextBuilder:
    """
    Builds context for Budget domain strictly for user=user.
    """
    @staticmethod
    def build(user, timeframe: str = 'current_month', category: Optional[str] = None) -> Dict[str, Any]:
        start_d, end_d, month, year, period_label = get_timeframe_bounds(timeframe)

        budgets_qs = Budget.objects.filter(user=user, is_active=True)
        if category:
            budgets_qs = budgets_qs.filter(category=category)

        expenses_qs = Expense.objects.filter(user=user)
        if start_d and end_d:
            expenses_qs = expenses_qs.filter(expense_date__gte=start_d, expense_date__lte=end_d)
        if category:
            expenses_qs = expenses_qs.filter(category=category)

        metrics = calculate_budget_metrics(budgets_qs, expenses_qs)

        return {
            "domain": "budgets",
            "period": timeframe,
            "period_label": period_label,
            "category_filter": category,
            "metrics": metrics,
        }


class SavingsContextBuilder:
    """
    Builds context for Savings domain strictly for user=user.
    """
    @staticmethod
    def build(user) -> Dict[str, Any]:
        qs = SavingsGoal.objects.filter(user=user).order_by('deadline')
        metrics = calculate_savings_metrics(qs)

        return {
            "domain": "savings",
            "metrics": metrics,
        }


class AnalyticsContextBuilder:
    """
    Builds context for Analytics domain strictly for user=user.
    """
    @staticmethod
    def build(user) -> Dict[str, Any]:
        category_analysis = get_category_expense_analysis(user)
        monthly_trend = get_monthly_expense_trend(user)
        extremes = get_expense_extremes(user)

        return {
            "domain": "analytics",
            "category_distribution": category_analysis,
            "monthly_trend": monthly_trend,
            "extremes": extremes,
        }


class ReportsContextBuilder:
    """
    Builds context for Reports domain strictly for user=user.
    """
    @staticmethod
    def build(user) -> Dict[str, Any]:
        recent_reports = Report.objects.filter(user=user).order_by('-generated_at')[:3]
        reports_list = [
            {
                "id": str(r.id),
                "type": r.get_report_type_display(),
                "generated_at": r.generated_at.strftime('%Y-%m-%d %H:%M'),
                "has_data": bool(r.data),
            }
            for r in recent_reports
        ]

        return {
            "domain": "reports",
            "recent_reports": reports_list,
            "total_generated": Report.objects.filter(user=user).count(),
        }


class UserDataContextFactory:
    """
    Factory that selectively builds only the requested domain contexts.
    """
    @classmethod
    def build_context(cls, user, intent: IntentResult) -> Dict[str, Any]:
        context: Dict[str, Any] = {
            "user": {
                "username": user.username,
                "email": user.email,
            },
            "intent": intent.primary_intent,
            "domains": {},
        }

        req_domains = set(intent.required_domains)

        if 'expenses' in req_domains:
            context["domains"]["expenses"] = ExpenseContextBuilder.build(
                user=user,
                timeframe=intent.timeframe,
                category=intent.category
            )

        if 'incomes' in req_domains:
            context["domains"]["incomes"] = IncomeContextBuilder.build(
                user=user,
                timeframe=intent.timeframe,
                source=intent.source
            )

        if 'budgets' in req_domains:
            context["domains"]["budgets"] = BudgetContextBuilder.build(
                user=user,
                timeframe=intent.timeframe,
                category=intent.category
            )

        if 'savings' in req_domains:
            context["domains"]["savings"] = SavingsContextBuilder.build(user=user)

        if 'analytics' in req_domains:
            context["domains"]["analytics"] = AnalyticsContextBuilder.build(user=user)

        if 'reports' in req_domains:
            context["domains"]["reports"] = ReportsContextBuilder.build(user=user)

        # Multi-domain financial summary calculation when appropriate
        inc_data = context["domains"].get("incomes", {}).get("metrics", {})
        exp_data = context["domains"].get("expenses", {}).get("metrics", {})
        bud_data = context["domains"].get("budgets", {}).get("metrics")
        sav_data = context["domains"].get("savings", {}).get("metrics")

        if inc_data and exp_data:
            context["summary"] = calculate_financial_summary(
                income_metrics=inc_data,
                expense_metrics=exp_data,
                budget_metrics=bud_data,
                savings_metrics=sav_data
            )

        return context
