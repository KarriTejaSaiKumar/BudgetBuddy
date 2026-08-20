"""
Deterministic Financial Calculation Engine for BudgetBuddy AI Assistant.

Performs exact mathematical and financial arithmetic in pure Python/Django ORM
to guarantee zero hallucination of financial numbers.
"""
from decimal import Decimal
from typing import Dict, List, Any, Optional
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Min, Max


def format_currency(amount: float | Decimal | int | None, currency: str = 'INR') -> str:
    """
    Format numeric values into standard human-readable currency strings.
    """
    if amount is None:
        val = 0.0
    elif isinstance(amount, Decimal):
        val = float(amount)
    else:
        val = float(amount)

    symbol_map = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'AED': 'AED ',
        'CAD': 'CA$',
        'AUD': 'A$',
        'SGD': 'S$',
    }
    symbol = symbol_map.get(currency.upper(), f"{currency} ")
    return f"{symbol}{val:,.2f}"


def calculate_income_metrics(incomes_qs) -> Dict[str, Any]:
    """
    Calculate deterministic income metrics from an Income queryset.
    """
    if not incomes_qs.exists():
        return {
            "total_income": 0.0,
            "transaction_count": 0,
            "average_income": 0.0,
            "highest_income": None,
            "sources": [],
            "has_data": False,
        }

    agg = incomes_qs.aggregate(
        total=Sum('amount'),
        count=Count('id'),
        avg=Avg('amount'),
        max_amount=Max('amount')
    )

    total_income = float(agg['total'] or Decimal('0.00'))
    count = agg['count'] or 0
    avg_income = float(agg['avg'] or Decimal('0.00'))

    # Source breakdown
    sources_agg = incomes_qs.values('source').annotate(
        total_amount=Sum('amount'),
        tx_count=Count('id')
    ).order_by('-total_amount')

    sources_list = []
    for item in sources_agg:
        amt = float(item['total_amount'] or Decimal('0.00'))
        pct = (amt / total_income * 100.0) if total_income > 0 else 0.0
        sources_list.append({
            "source": item['source'],
            "label": item['source'].replace('_', ' ').title(),
            "amount": amt,
            "percentage": round(pct, 2),
            "count": item['tx_count'],
        })

    highest_inc = incomes_qs.order_by('-amount').first()
    highest_dict = None
    if highest_inc:
        highest_dict = {
            "id": str(highest_inc.id),
            "source": highest_inc.source,
            "amount": float(highest_inc.amount),
            "date": str(highest_inc.date),
            "description": highest_inc.description or '',
        }

    return {
        "total_income": round(total_income, 2),
        "transaction_count": count,
        "average_income": round(avg_income, 2),
        "highest_income": highest_dict,
        "sources": sources_list,
        "has_data": True,
    }


def calculate_expense_metrics(expenses_qs, days_in_period: Optional[int] = None) -> Dict[str, Any]:
    """
    Calculate deterministic expense metrics from an Expense queryset.
    """
    if not expenses_qs.exists():
        return {
            "total_expense": 0.0,
            "transaction_count": 0,
            "average_transaction": 0.0,
            "average_daily_expense": 0.0,
            "highest_expense": None,
            "lowest_expense": None,
            "categories": [],
            "payment_methods": [],
            "has_data": False,
        }

    agg = expenses_qs.aggregate(
        total=Sum('amount'),
        count=Count('id'),
        avg=Avg('amount')
    )

    total_expense = float(agg['total'] or Decimal('0.00'))
    count = agg['count'] or 0
    avg_tx = float(agg['avg'] or Decimal('0.00'))

    # Category breakdown
    categories_agg = expenses_qs.values('category').annotate(
        total_amount=Sum('amount'),
        tx_count=Count('id')
    ).order_by('-total_amount')

    categories_list = []
    for item in categories_agg:
        amt = float(item['total_amount'] or Decimal('0.00'))
        pct = (amt / total_expense * 100.0) if total_expense > 0 else 0.0
        categories_list.append({
            "category": item['category'],
            "label": item['category'].replace('_', ' ').title(),
            "amount": amt,
            "percentage": round(pct, 2),
            "count": item['tx_count'],
        })

    # Payment methods breakdown
    pm_agg = expenses_qs.values('payment_method').annotate(
        total_amount=Sum('amount'),
        tx_count=Count('id')
    ).order_by('-total_amount')

    pm_list = []
    for item in pm_agg:
        amt = float(item['total_amount'] or Decimal('0.00'))
        pct = (amt / total_expense * 100.0) if total_expense > 0 else 0.0
        pm_list.append({
            "payment_method": item['payment_method'],
            "label": item['payment_method'].replace('_', ' ').title(),
            "amount": amt,
            "percentage": round(pct, 2),
            "count": item['tx_count'],
        })

    highest = expenses_qs.order_by('-amount').first()
    lowest = expenses_qs.order_by('amount').first()

    def format_exp(exp):
        if not exp:
            return None
        return {
            "id": str(exp.id),
            "title": exp.title,
            "amount": float(exp.amount),
            "category": exp.category,
            "payment_method": exp.payment_method,
            "date": str(exp.expense_date),
            "currency": exp.currency,
        }

    # Daily average calculation
    if days_in_period and days_in_period > 0:
        avg_daily = total_expense / days_in_period
    else:
        avg_daily = total_expense / 30.0 if total_expense > 0 else 0.0

    return {
        "total_expense": round(total_expense, 2),
        "transaction_count": count,
        "average_transaction": round(avg_tx, 2),
        "average_daily_expense": round(avg_daily, 2),
        "highest_expense": format_exp(highest),
        "lowest_expense": format_exp(lowest),
        "categories": categories_list,
        "payment_methods": pm_list,
        "has_data": True,
    }


def calculate_budget_metrics(budgets_qs, expenses_qs) -> Dict[str, Any]:
    """
    Calculate deterministic budget utilization and status matched against expenses.
    """
    if not budgets_qs.exists():
        return {
            "total_budget_allocated": 0.0,
            "total_budget_spent": 0.0,
            "total_budget_remaining": 0.0,
            "overall_utilization_percentage": 0.0,
            "active_budgets_count": 0,
            "budgets": [],
            "exceeded_budgets": [],
            "near_limit_budgets": [],
            "has_data": False,
        }

    # Pre-aggregate expenses by category from expenses_qs
    cat_expense_map = {}
    for item in expenses_qs.values('category').annotate(tot=Sum('amount')):
        cat_expense_map[item['category']] = float(item['tot'] or Decimal('0.00'))

    total_allocated = 0.0
    total_spent = 0.0
    budgets_list = []
    exceeded_list = []
    near_limit_list = []

    for b in budgets_qs:
        limit = float(b.budget_amount)
        spent = cat_expense_map.get(b.category, 0.0)
        remaining = limit - spent
        utilization = (spent / limit * 100.0) if limit > 0 else 0.0

        if utilization > 100.0:
            status = 'exceeded'
            exceeded_list.append(b.budget_name or b.get_category_display())
        elif utilization >= 85.0:
            status = 'near_limit'
            near_limit_list.append(b.budget_name or b.get_category_display())
        else:
            status = 'within_budget'

        total_allocated += limit
        total_spent += spent

        budgets_list.append({
            "id": str(b.id),
            "name": b.budget_name or f"{b.get_category_display()} Budget",
            "category": b.category,
            "limit": round(limit, 2),
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "utilization_percentage": round(utilization, 2),
            "status": status,
            "currency": b.currency,
        })

    total_remaining = total_allocated - total_spent
    overall_util = (total_spent / total_allocated * 100.0) if total_allocated > 0 else 0.0

    return {
        "total_budget_allocated": round(total_allocated, 2),
        "total_budget_spent": round(total_spent, 2),
        "total_budget_remaining": round(total_remaining, 2),
        "overall_utilization_percentage": round(overall_util, 2),
        "active_budgets_count": len(budgets_list),
        "budgets": budgets_list,
        "exceeded_budgets": exceeded_list,
        "near_limit_budgets": near_limit_list,
        "has_data": True,
    }


def calculate_savings_metrics(savings_qs) -> Dict[str, Any]:
    """
    Calculate deterministic savings metrics and progress across all goals.
    """
    if not savings_qs.exists():
        return {
            "total_target": 0.0,
            "total_saved": 0.0,
            "total_remaining": 0.0,
            "overall_progress_percentage": 0.0,
            "active_goals_count": 0,
            "completed_goals_count": 0,
            "goals": [],
            "has_data": False,
        }

    total_target = 0.0
    total_saved = 0.0
    goals_list = []
    completed_count = 0
    active_count = 0
    today = timezone.now().date()

    for g in savings_qs:
        target = float(g.target_amount)
        current = float(g.current_amount)
        remaining = max(0.0, target - current)
        pct = (current / target * 100.0) if target > 0 else 0.0
        is_comp = g.is_completed or (current >= target)

        if is_comp:
            completed_count += 1
        else:
            active_count += 1

        days_left = (g.deadline - today).days if g.deadline else None

        total_target += target
        total_saved += current

        goals_list.append({
            "id": str(g.id),
            "name": g.goal_name,
            "target": round(target, 2),
            "current": round(current, 2),
            "remaining": round(remaining, 2),
            "progress_percentage": round(pct, 2),
            "is_completed": is_comp,
            "deadline": str(g.deadline),
            "days_left": days_left,
        })

    total_remaining = max(0.0, total_target - total_saved)
    overall_pct = (total_saved / total_target * 100.0) if total_target > 0 else 0.0

    return {
        "total_target": round(total_target, 2),
        "total_saved": round(total_saved, 2),
        "total_remaining": round(total_remaining, 2),
        "overall_progress_percentage": round(overall_pct, 2),
        "active_goals_count": active_count,
        "completed_goals_count": completed_count,
        "goals": goals_list,
        "has_data": True,
    }


def calculate_financial_summary(
    income_metrics: Dict[str, Any],
    expense_metrics: Dict[str, Any],
    budget_metrics: Optional[Dict[str, Any]] = None,
    savings_metrics: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Combine domain metrics to calculate high-level financial summary and safe-to-spend allowance.
    """
    total_income = income_metrics.get("total_income", 0.0)
    total_expense = expense_metrics.get("total_expense", 0.0)
    current_balance = total_income - total_expense
    savings_rate = ((current_balance / total_income) * 100.0) if total_income > 0 else 0.0

    total_budget_remaining = budget_metrics.get("total_budget_remaining", 0.0) if budget_metrics else 0.0
    total_savings_target_remaining = savings_metrics.get("total_remaining", 0.0) if savings_metrics else 0.0

    # Safe-to-spend is calculated conservatively based on available balance vs unallocated limit
    if current_balance <= 0:
        safe_to_spend = 0.0
    else:
        # If user has budget remaining, safe-to-spend is bounded by the lesser of current balance and unspent budget
        if budget_metrics and budget_metrics.get("has_data") and total_budget_remaining > 0:
            safe_to_spend = max(0.0, min(current_balance, total_budget_remaining))
        else:
            safe_to_spend = max(0.0, current_balance)

    if current_balance > 0:
        cash_flow_status = 'surplus'
    elif current_balance < 0:
        cash_flow_status = 'deficit'
    else:
        cash_flow_status = 'balanced'

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "current_balance": round(current_balance, 2),
        "savings_rate": round(savings_rate, 2),
        "safe_to_spend": round(safe_to_spend, 2),
        "cash_flow_status": cash_flow_status,
        "total_savings": savings_metrics.get("total_saved", 0.0) if savings_metrics else 0.0,
        "total_budget_allocated": budget_metrics.get("total_budget_allocated", 0.0) if budget_metrics else 0.0,
        "total_budget_remaining": total_budget_remaining,
    }
