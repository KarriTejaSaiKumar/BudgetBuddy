from decimal import Decimal
from django.db.models import Sum, Count, Avg, F, Q, ExpressionWrapper, DecimalField
from django.db.models.functions import TruncMonth

from incomes.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal


def get_financial_summary(user):
    """
    Computes overall financial summary metrics for a given user.
    Returns:
        dict: Total income, total expenses, current balance, total savings, and remaining budget.
    """
    income_agg = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
    expense_agg = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))
    savings_agg = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('current_amount'))
    budget_agg = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))

    total_income = income_agg['total'] or Decimal('0.00')
    total_expense = expense_agg['total'] or Decimal('0.00')
    total_savings = savings_agg['total'] or Decimal('0.00')
    total_budget = budget_agg['total'] or Decimal('0.00')

    current_balance = total_income - total_expense
    remaining_budget = total_budget - total_expense

    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "current_balance": float(current_balance),
        "total_savings": float(total_savings),
        "remaining_budget": float(remaining_budget),
    }


def get_category_expense_analysis(user):
    """
    Calculates total expenses grouped by category for a given user.
    Returns:
        list of dicts containing category, total expense amount, percentage of total, and transaction count.
    """
    total_expense_agg = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))
    total_expense = total_expense_agg['total'] or Decimal('0.00')

    categories_query = (
        Expense.objects.filter(user=user)
        .values('category')
        .annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id'),
            avg_amount=Avg('amount')
        )
        .order_by('-total_amount')
    )

    result = []
    for item in categories_query:
        amount = item['total_amount'] or Decimal('0.00')
        percentage = (float(amount) / float(total_expense) * 100.0) if total_expense > 0 else 0.0
        result.append({
            "category": item['category'],
            "total_amount": float(amount),
            "percentage": round(percentage, 2),
            "transaction_count": item['transaction_count'],
            "avg_transaction_amount": float(item['avg_amount'] or Decimal('0.00')),
        })

    return result


def get_monthly_expense_trend(user):
    """
    Aggregates user expenses by month to display spending trends.
    Returns:
        list of dicts containing month label (YYYY-MM), total expense amount, and transaction count.
    """
    monthly_query = (
        Expense.objects.filter(user=user)
        .annotate(month=TruncMonth('expense_date'))
        .values('month')
        .annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        )
        .order_by('month')
    )

    result = []
    for item in monthly_query:
        month_str = item['month'].strftime('%Y-%m') if item['month'] else 'N/A'
        result.append({
            "month": month_str,
            "total_amount": float(item['total_amount'] or Decimal('0.00')),
            "transaction_count": item['transaction_count'],
        })

    return result


def get_expense_extremes(user):
    """
    Finds the highest, lowest, latest, and oldest expenses for a given user.
    Returns:
        dict containing highest, lowest, latest, and oldest expense record summaries.
    """
    user_expenses = Expense.objects.filter(user=user)

    highest = user_expenses.order_by('-amount').first()
    lowest = user_expenses.order_by('amount').first()
    latest = user_expenses.order_by('-expense_date', '-created_at').first()
    oldest = user_expenses.order_by('expense_date', 'created_at').first()

    def format_expense(exp):
        if not exp:
            return None
        return {
            "id": str(exp.id),
            "title": exp.title,
            "amount": float(exp.amount),
            "category": exp.category,
            "date": str(exp.expense_date),
            "description": exp.description,
        }

    return {
        "highest_expense": format_expense(highest),
        "lowest_expense": format_expense(lowest),
        "latest_expense": format_expense(latest),
        "oldest_expense": format_expense(oldest),
    }


def get_recent_transactions(user, limit=10):
    """
    Merges recent Income and Expense records into a single unified timeline.
    Returns:
        list of dicts representing unified transaction records ordered by date descending.
    """
    incomes = (
        Income.objects.filter(user=user)
        .order_by('-date', '-created_at')[:limit]
    )
    expenses = (
        Expense.objects.filter(user=user)
        .order_by('-expense_date', '-created_at')[:limit]
    )

    transactions = []

    for inc in incomes:
        transactions.append({
            "id": str(inc.id),
            "transaction_type": "income",
            "title": f"Income: {inc.get_source_display()}",
            "amount": float(inc.amount),
            "category": inc.source,
            "date": str(inc.date),
            "created_at": inc.created_at.isoformat(),
        })

    for exp in expenses:
        transactions.append({
            "id": str(exp.id),
            "transaction_type": "expense",
            "title": exp.title,
            "amount": float(exp.amount),
            "category": exp.category,
            "date": str(exp.expense_date),
            "created_at": exp.created_at.isoformat(),
        })

    # Sort merged transactions by date descending, then created_at descending
    transactions.sort(key=lambda t: (t['date'], t['created_at']), reverse=True)

    return transactions[:limit]


def get_active_savings_goals(user):
    """
    Retrieves all active savings goals for a given user along with progress calculations.
    Returns:
        list of dicts containing savings goal details, target amount, current amount, remaining amount, and progress percentage.
    """
    goals = SavingsGoal.objects.filter(user=user).order_by('deadline')

    result = []
    for goal in goals:
        target = float(goal.target_amount)
        current = float(goal.current_amount)
        remaining = max(0.0, target - current)
        progress_pct = (current / target * 100.0) if target > 0 else 0.0
        is_completed = current >= target

        result.append({
            "id": str(goal.id),
            "goal_name": goal.goal_name,
            "target_amount": target,
            "current_amount": current,
            "remaining_amount": round(remaining, 2),
            "progress_percentage": round(progress_pct, 2),
            "is_completed": is_completed,
            "deadline": str(goal.deadline),
        })

    return result
