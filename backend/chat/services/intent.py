"""
Intent Classification and Entity Extraction Engine for BudgetBuddy AI Assistant.

Analyzes natural language queries to detect required financial domains,
category filters, timeframe scopes, multi-turn session memory, and UI action navigation intents.
"""
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field


@dataclass
class IntentResult:
    primary_intent: str
    required_domains: List[str] = field(default_factory=list)
    category: Optional[str] = None
    source: Optional[str] = None
    timeframe: str = 'current_month'
    action: Optional[Dict[str, str]] = None
    is_comparison: bool = False
    is_extreme_query: Optional[str] = None  # 'highest', 'lowest', 'latest'


class IntentClassifier:
    """
    Rule-based, deterministic NLP classifier tailored for personal finance queries.
    Supports multi-turn conversational context memory.
    """

    CATEGORY_MAP = {
        'food': ['food', 'dining', 'restaurant', 'restaurants', 'eat', 'eating', 'dinner', 'lunch', 'breakfast', 'coffee', 'snack', 'cafe'],
        'groceries': ['groceries', 'grocery', 'supermarket', 'supermarkets', 'provisions', 'vegetables', 'fruits'],
        'housing': ['housing', 'rent', 'mortgage', 'house', 'apartment', 'flat'],
        'utilities': ['utilities', 'utility', 'electricity', 'water', 'gas', 'power', 'internet', 'wifi', 'broadband'],
        'transport': ['transport', 'transportation', 'transit', 'uber', 'ola', 'cab', 'taxi', 'fuel', 'petrol', 'diesel', 'travel', 'commute', 'flight', 'train', 'bus'],
        'entertainment': ['entertainment', 'movie', 'movies', 'cinema', 'netflix', 'spotify', 'games', 'gaming', 'concert', 'fun', 'outing', 'party'],
        'shopping': ['shopping', 'clothes', 'clothing', 'apparel', 'amazon', 'flipkart', 'gadgets', 'electronics'],
        'healthcare': ['healthcare', 'health', 'medical', 'medicine', 'medicines', 'doctor', 'hospital', 'clinic', 'pharmacy', 'insurance'],
        'bills': ['bills', 'bill', 'subscription', 'subscriptions', 'recharge', 'maintenance', 'fees'],
        'education': ['education', 'course', 'courses', 'tuition', 'books', 'school', 'college', 'university', 'training'],
    }

    INCOME_SOURCE_MAP = {
        'salary': ['salary', 'paycheck', 'wage', 'wages', 'job'],
        'freelance': ['freelance', 'side hustle', 'consulting', 'gig', 'contract', 'freelancing'],
        'investments': ['investment', 'investments', 'dividend', 'dividends', 'stocks', 'returns', 'crypto', 'interest'],
        'gifts': ['gift', 'gifts', 'reward', 'bonus', 'cashback'],
    }

    def classify(self, message: str, session_context: Optional[Dict[str, Any]] = None) -> IntentResult:
        msg = message.lower().strip()
        session_ctx = session_context or {}

        # Extract entities
        category = self._extract_category(msg)
        source = self._extract_source(msg)
        has_explicit_timeframe, timeframe = self._extract_timeframe(msg)
        is_comparison = self._check_comparison(msg)
        is_extreme = self._check_extremes(msg)

        # Multi-turn memory: inherit context if not explicitly provided
        if not has_explicit_timeframe and session_ctx.get('period'):
            timeframe = session_ctx['period']

        if not category and session_ctx.get('category_filter') and ('that' in msg or 'it' in msg or is_comparison):
            category = session_ctx['category_filter']

        # 1. GREETINGS
        greetings = ['hi', 'hello', 'hey', 'greetings', 'hola', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon']
        if any(re.search(rf'\b{re.escape(g)}\b', msg) for g in greetings) and len(msg.split()) <= 4:
            return IntentResult(
                primary_intent='greetings',
                required_domains=[],
                category=category,
                timeframe=timeframe
            )

        # 2. SAFE TO SPEND / AFFORDABILITY
        safe_spend_keywords = ['safely spend', 'safe to spend', 'can i spend', 'can i afford', 'how much can i spend', 'available to spend', 'spending power']
        if any(k in msg for k in safe_spend_keywords):
            return IntentResult(
                primary_intent='safe_to_spend',
                required_domains=['incomes', 'expenses', 'budgets', 'savings'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/budgets", "label": "View Budgets"}
            )

        # 3. COMPREHENSIVE OVERVIEW / SUMMARY
        summary_keywords = ['summary', 'overview', 'dashboard', 'status', 'financial summary', 'overall report', 'finances', 'financial health', 'net worth', 'balance']
        if any(k in msg for k in summary_keywords) or ('how am i doing' in msg) or ('financial overview' in msg):
            return IntentResult(
                primary_intent='summary',
                required_domains=['incomes', 'expenses', 'budgets', 'savings', 'analytics'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/analytics", "label": "View Analytics"}
            )

        # 4. ADVICE / RECOMMENDATIONS / TIPS
        advice_keywords = ['advice', 'tip', 'tips', 'suggest', 'suggestion', 'suggestions', 'recommend', 'recommendation', 'help me save', 'how to save', 'cut costs', 'reduce spending']
        if any(k in msg for k in advice_keywords):
            return IntentResult(
                primary_intent='advice',
                required_domains=['incomes', 'expenses', 'budgets', 'savings'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/savings", "label": "View Savings Goals"}
            )

        # 5. MULTI-DOMAIN: EXPENSES + BUDGETS
        if any(b in msg for b in ['budget', 'limit']) and any(e in msg for e in ['spend', 'spent', 'expense', 'over', 'left', 'remaining', 'used', 'within']):
            route = f"/budgets"
            label = f"View {category.title() + ' ' if category else ''}Budget"
            return IntentResult(
                primary_intent='budgets',
                required_domains=['budgets', 'expenses'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": route, "label": label}
            )

        # 6. BUDGETS
        budget_keywords = ['budget', 'budgets', 'spending limit', 'spending limits', 'allowance']
        if any(k in msg for k in budget_keywords):
            return IntentResult(
                primary_intent='budgets',
                required_domains=['budgets', 'expenses'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/budgets", "label": "Go to Budgets"}
            )

        # 7. SAVINGS GOALS
        savings_keywords = ['save', 'saving', 'savings', 'goal', 'goals', 'emergency fund', 'target']
        if any(k in msg for k in savings_keywords):
            return IntentResult(
                primary_intent='savings',
                required_domains=['savings'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/savings", "label": "Go to Savings"}
            )

        # 8. ANALYTICS / TRENDS
        analytics_keywords = ['trend', 'trends', 'pattern', 'patterns', 'chart', 'analytics', 'monthly expense trend', 'spending graph', 'history']
        if any(k in msg for k in analytics_keywords):
            return IntentResult(
                primary_intent='analytics',
                required_domains=['analytics', 'expenses'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/analytics", "label": "View Analytics"}
            )

        # 9. REPORTS
        reports_keywords = ['report', 'reports', 'monthly report', 'weekly report', 'download report', 'export']
        if any(k in msg for k in reports_keywords):
            return IntentResult(
                primary_intent='reports',
                required_domains=['reports', 'incomes', 'expenses'],
                category=category,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/reports", "label": "View Reports"}
            )

        # 10. INCOMES
        income_keywords = ['income', 'incomes', 'earn', 'earning', 'earnings', 'earned', 'salary', 'deposit', 'revenue', 'paycheck']
        if any(k in msg for k in income_keywords):
            return IntentResult(
                primary_intent='incomes',
                required_domains=['incomes'],
                category=category,
                source=source,
                timeframe=timeframe,
                action={"type": "navigate", "route": "/incomes", "label": "View Incomes"}
            )

        # 11. EXPENSES (OR FOLLOW-UPS WITH CATEGORY / EXTREME / COMPARISON)
        expense_keywords = ['expense', 'expenses', 'spend', 'spending', 'spent', 'cost', 'costs', 'buy', 'bought', 'purchase', 'purchases', 'paid', 'transactions', 'bills']
        if any(k in msg for k in expense_keywords) or category is not None or is_extreme is not None or is_comparison:
            route = f"/expenses?category={category}" if category else "/expenses"
            label = f"View {category.title() + ' ' if category else ''}Expenses"
            return IntentResult(
                primary_intent='expenses',
                required_domains=['expenses'],
                category=category,
                timeframe=timeframe,
                is_comparison=is_comparison,
                is_extreme_query=is_extreme,
                action={"type": "navigate", "route": route, "label": label}
            )

        # 12. NAVIGATION SPECIFIC
        if msg.startswith(('open ', 'go to ', 'show me ', 'navigate to ')):
            if 'saving' in msg or 'goal' in msg:
                return IntentResult(primary_intent='savings', required_domains=['savings'], action={"type": "navigate", "route": "/savings", "label": "Go to Savings"})
            if 'budget' in msg:
                return IntentResult(primary_intent='budgets', required_domains=['budgets', 'expenses'], action={"type": "navigate", "route": "/budgets", "label": "Go to Budgets"})
            if 'income' in msg:
                return IntentResult(primary_intent='incomes', required_domains=['incomes'], action={"type": "navigate", "route": "/incomes", "label": "Go to Incomes"})
            if 'report' in msg:
                return IntentResult(primary_intent='reports', required_domains=['reports'], action={"type": "navigate", "route": "/reports", "label": "Go to Reports"})
            if 'analytic' in msg:
                return IntentResult(primary_intent='analytics', required_domains=['analytics'], action={"type": "navigate", "route": "/analytics", "label": "Go to Analytics"})
            return IntentResult(primary_intent='expenses', required_domains=['expenses'], action={"type": "navigate", "route": "/expenses", "label": "Go to Expenses"})

        # 13. FALLBACK / UNKNOWN
        return IntentResult(
            primary_intent='unknown',
            required_domains=['incomes', 'expenses', 'budgets', 'savings'],
            category=category,
            timeframe=timeframe
        )

    def _extract_category(self, msg: str) -> Optional[str]:
        for cat, keywords in self.CATEGORY_MAP.items():
            for kw in keywords:
                if re.search(rf'\b{re.escape(kw)}\b', msg):
                    return cat
        return None

    def _extract_source(self, msg: str) -> Optional[str]:
        for src, keywords in self.INCOME_SOURCE_MAP.items():
            for kw in keywords:
                if re.search(rf'\b{re.escape(kw)}\b', msg):
                    return src
        return None

    def _extract_timeframe(self, msg: str) -> tuple[bool, str]:
        if any(k in msg for k in ['last month', 'previous month', 'past month']):
            return True, 'last_month'
        if any(k in msg for k in ['this year', 'current year', 'yearly', 'annual', 'annually']):
            return True, 'this_year'
        if any(k in msg for k in ['all time', 'all-time', 'overall', 'total ever', 'lifetime']):
            return True, 'all_time'
        if any(k in msg for k in ['this month', 'current month']):
            return True, 'current_month'
        # Default to current month if no explicit timeframe found
        return False, 'current_month'

    def _check_comparison(self, msg: str) -> bool:
        return any(k in msg for k in ['compare', 'compared', 'difference', 'versus', 'vs', 'more than last', 'less than last'])

    def _check_extremes(self, msg: str) -> Optional[str]:
        if any(k in msg for k in ['biggest', 'highest', 'largest', 'max', 'most expensive', 'top expense', 'largest purchase']):
            return 'highest'
        if any(k in msg for k in ['smallest', 'lowest', 'cheapest', 'min', 'least']):
            return 'lowest'
        if any(k in msg for k in ['latest', 'recent', 'last transaction', 'newest']):
            return 'latest'
        return None
