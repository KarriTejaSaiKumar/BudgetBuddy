from decimal import Decimal
from datetime import datetime, date
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q

from incomes.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


def _get_date_range_filters(date_field_name, start_date=None, end_date=None):
    """
    Helper utility to build Django Q objects for date range filtering.
    """
    q = Q()
    if start_date:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        q &= Q(**{f"{date_field_name}__gte": start_date})
    if end_date:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        q &= Q(**{f"{date_field_name}__lte": end_date})
    return q


def get_monthly_financial_report(user, start_date=None, end_date=None):
    """
    Compiles monthly financial summary report (Income, Expense, Balance, Savings, Remaining Budget).
    """
    income_q = _get_date_range_filters('date', start_date, end_date)
    expense_q = _get_date_range_filters('expense_date', start_date, end_date)

    income_agg = Income.objects.filter(Q(user=user) & income_q).aggregate(total=Sum('amount'))
    expense_agg = Expense.objects.filter(Q(user=user) & expense_q).aggregate(total=Sum('amount'))
    savings_agg = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('current_amount'))
    budget_agg = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))

    total_income = income_agg['total'] or Decimal('0.00')
    total_expense = expense_agg['total'] or Decimal('0.00')
    total_savings = savings_agg['total'] or Decimal('0.00')
    total_budget = budget_agg['total'] or Decimal('0.00')

    current_balance = total_income - total_expense
    remaining_budget = total_budget - total_expense

    return {
        "period": {
            "start_date": str(start_date) if start_date else None,
            "end_date": str(end_date) if end_date else None,
        },
        "summary": {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(current_balance),
            "total_savings": float(total_savings),
            "total_budget": float(total_budget),
            "remaining_budget": float(remaining_budget),
        }
    }


def get_expense_report(user, start_date=None, end_date=None):
    """
    Compiles itemized expense details and category breakdown for a selected date range.
    """
    date_q = _get_date_range_filters('expense_date', start_date, end_date)
    expense_qs = Expense.objects.filter(Q(user=user) & date_q).order_by('-expense_date')

    totals_agg = expense_qs.aggregate(
        total_amount=Sum('amount'),
        avg_amount=Avg('amount'),
        total_count=Count('id')
    )

    category_breakdown = (
        expense_qs.values('category')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('-total')
    )

    items = []
    for exp in expense_qs:
        items.append({
            "id": str(exp.id),
            "title": exp.title,
            "category": exp.category,
            "category_display": exp.get_category_display(),
            "amount": float(exp.amount),
            "date": str(exp.expense_date),
            "description": exp.description or "",
        })

    categories = []
    total_spent = totals_agg['total_amount'] or Decimal('0.00')
    for cat in category_breakdown:
        cat_total = cat['total'] or Decimal('0.00')
        percentage = (float(cat_total) / float(total_spent) * 100.0) if total_spent > 0 else 0.0
        categories.append({
            "category": cat['category'],
            "total_amount": float(cat_total),
            "transaction_count": cat['count'],
            "percentage": round(percentage, 2),
        })

    return {
        "period": {
            "start_date": str(start_date) if start_date else None,
            "end_date": str(end_date) if end_date else None,
        },
        "summary": {
            "total_expenses": float(total_spent),
            "average_expense": float(totals_agg['avg_amount'] or Decimal('0.00')),
            "transaction_count": totals_agg['total_count'] or 0,
        },
        "categories": categories,
        "expenses": items,
    }


def get_savings_report(user, start_date=None, end_date=None):
    """
    Compiles detailed savings goal progress and completion metrics.
    """
    goals_qs = SavingsGoal.objects.filter(user=user).order_by('deadline')

    goals_agg = goals_qs.aggregate(
        total_target=Sum('target_amount'),
        total_saved=Sum('current_amount'),
        goal_count=Count('id')
    )

    total_target = goals_agg['total_target'] or Decimal('0.00')
    total_saved = goals_agg['total_saved'] or Decimal('0.00')
    total_remaining = max(Decimal('0.00'), total_target - total_saved)
    overall_progress = (float(total_saved) / float(total_target) * 100.0) if total_target > 0 else 0.0

    items = []
    for goal in goals_qs:
        target = float(goal.target_amount)
        current = float(goal.current_amount)
        rem = max(0.0, target - current)
        pct = (current / target * 100.0) if target > 0 else 0.0
        status_label = "completed" if current >= target else "in_progress"

        items.append({
            "id": str(goal.id),
            "goal_name": goal.goal_name,
            "target_amount": target,
            "saved_amount": current,
            "remaining_amount": round(rem, 2),
            "progress_percentage": round(pct, 2),
            "deadline": str(goal.deadline),
            "status": status_label,
        })

    return {
        "summary": {
            "total_goals_count": goals_agg['goal_count'] or 0,
            "total_target_amount": float(total_target),
            "total_saved_amount": float(total_saved),
            "total_remaining_amount": float(total_remaining),
            "overall_progress_percentage": round(overall_progress, 2),
        },
        "savings_goals": items,
    }


def get_financial_summary_report(user, start_date=None, end_date=None):
    """
    Combines Financial Summary, Expense Summary, Income Summary, Budget Summary, Savings Summary, and Latest Notifications.
    """
    financial_summary = get_monthly_financial_report(user, start_date, end_date)
    expense_report = get_expense_report(user, start_date, end_date)
    savings_report = get_savings_report(user, start_date, end_date)

    income_q = _get_date_range_filters('date', start_date, end_date)
    income_qs = Income.objects.filter(Q(user=user) & income_q).order_by('-date')

    income_sources = (
        income_qs.values('source')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('-total')
    )

    income_items = []
    for inc in income_qs[:10]:
        income_items.append({
            "id": str(inc.id),
            "source": inc.source,
            "source_display": inc.get_source_display(),
            "amount": float(inc.amount),
            "date": str(inc.date),
            "description": inc.description or "",
        })

    budgets_qs = Budget.objects.filter(user=user).order_by('-year', '-month')
    budget_items = []
    for b in budgets_qs:
        budget_items.append({
            "id": str(b.id),
            "category": b.category,
            "category_display": b.get_category_display(),
            "budget_amount": float(b.budget_amount),
            "month": b.month,
            "year": b.year,
        })

    notifications_qs = Notification.objects.filter(user=user).order_by('-created_at')[:5]
    notification_items = []
    for n in notifications_qs:
        notification_items.append({
            "id": str(n.id),
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        })

    return {
        "financial_summary": financial_summary['summary'],
        "expense_summary": expense_report['summary'],
        "income_summary": {
            "total_income": financial_summary['summary']['total_income'],
            "sources": list(income_sources),
            "recent_incomes": income_items,
        },
        "budget_summary": {
            "total_budget": financial_summary['summary']['total_budget'],
            "budgets": budget_items,
        },
        "savings_summary": savings_report['summary'],
        "latest_notifications": notification_items,
    }


def get_export_ready_data(user, report_type='summary', start_date=None, end_date=None):
    """
    Returns normalized Python data structure formatted specifically for PDF and CSV file exports.
    """
    generated_at = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')
    user_identifier = user.email if getattr(user, 'email', None) else user.username

    if report_type == 'expenses':
        raw_data = get_expense_report(user, start_date, end_date)
        title = "Itemized Expense Report"
        headers = ["Date", "Title", "Category", "Amount", "Description"]
        rows = [
            [item["date"], item["title"], item["category_display"], f"${item['amount']:.2f}", item["description"]]
            for item in raw_data["expenses"]
        ]
    elif report_type == 'savings':
        raw_data = get_savings_report(user, start_date, end_date)
        title = "Savings Goals Progress Report"
        headers = ["Goal Name", "Target Amount", "Saved Amount", "Remaining", "Progress", "Deadline", "Status"]
        rows = [
            [
                item["goal_name"],
                f"${item['target_amount']:.2f}",
                f"${item['saved_amount']:.2f}",
                f"${item['remaining_amount']:.2f}",
                f"{item['progress_percentage']:.1f}%",
                item["deadline"],
                item["status"].upper(),
            ]
            for item in raw_data["savings_goals"]
        ]
    else:
        raw_data = get_financial_summary_report(user, start_date, end_date)
        title = "Comprehensive Financial Summary Report"
        headers = ["Metric", "Amount ($)"]
        summary = raw_data["financial_summary"]
        rows = [
            ["Total Income", f"${summary['total_income']:.2f}"],
            ["Total Expense", f"${summary['total_expense']:.2f}"],
            ["Net Balance", f"${summary['current_balance']:.2f}"],
            ["Total Savings", f"${summary['total_savings']:.2f}"],
            ["Total Budget", f"${summary['total_budget']:.2f}"],
            ["Remaining Budget", f"${summary['remaining_budget']:.2f}"],
        ]

    return {
        "metadata": {
            "report_title": title,
            "user": user_identifier,
            "generated_at": generated_at,
            "start_date": str(start_date) if start_date else "All Time",
            "end_date": str(end_date) if end_date else "Present",
            "report_type": report_type,
        },
        "table": {
            "headers": headers,
            "rows": rows,
        },
        "raw_data": raw_data,
    }
