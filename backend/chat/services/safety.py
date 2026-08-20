"""
Safety and Boundary Validation Layer for BudgetBuddy AI Assistant.

Enforces scope limits, intercepts restricted queries (e.g. stock/crypto speculation,
tax evasion, jailbreaks, secret leakage), and provides safe redirect responses.
"""
import re
from typing import Tuple, Optional, List


class SafetyValidator:
    """
    Validates user queries against strict safety policies and scope restrictions.
    """

    # Prohibited speculative investment & trading topics
    SPECULATIVE_TRADING_PATTERNS = [
        r'\b(which|what)\s+(stock|stocks|crypto|cryptocurrency|coin|token|altcoin|shares?)\s+(should\s+i|to)\s+(buy|sell|trade|invest\s+in)\b',
        r'\b(should\s+i|can\s+i)\s+(buy|sell|short|trade|invest\s+in)\s+(bitcoin|btc|ethereum|eth|crypto|doge|solana|tesla|apple|nifty|sensex|options|futures|penny\s+stocks?)\b',
        r'\b(stock|crypto|forex|trading)\s+(tips|signals|predictions|picks|recommendations)\b',
        r'\b(get\s+rich\s+quick|guaranteed\s+returns?|100x\s+crypto|pump\s+and\s+dump)\b',
    ]

    # Prohibited tax evasion & legal advisory
    TAX_LEGAL_PATTERNS = [
        r'\b(how\s+to|help\s+me)\s+(evade|avoid\s+paying|hide\s+money\s+from|cheat\s+on)\s+(taxes|tax|irs|income\s+tax)\b',
        r'\b(tax\s+fraud|money\s+laundering|illegal\s+tax)\b',
    ]

    # Jailbreaks, prompt injection, and credential extraction
    JAILBREAK_PATTERNS = [
        r'\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|commands)\b',
        r'\b(what\s+is|show\s+me|reveal|print|repeat)\s+(your\s+)?(system\s+prompt|initial\s+prompt|secret\s+key|api\s+key|password|credentials?)\b',
        r'\b(drop\s+table|delete\s+from\s+auth|select\s+\*\s+from\s+django)\b',
        r'\b(dan\s+mode|jailbreak|developer\s+mode\s+enabled)\b',
    ]

    # Cross-user data access attempts
    CROSS_USER_PATTERNS = [
        r'\b(show|get|view|tell\s+me|what\s+is)\s+(other\s+users?|all\s+users?|another\s+user\'s|someone\s+else\'s)\s+(expenses|data|incomes|budgets|salaries)\b',
        r'\b(user\s+\d+|admin)\s+(expenses|income|salary|data|records)\b',
    ]

    @classmethod
    def validate(cls, message: str) -> Tuple[bool, Optional[str], Optional[str], List[str]]:
        """
        Validates message against safety rules.
        Returns:
            (is_safe: bool, restriction_type: Optional[str], safe_response: Optional[str], suggestions: List[str])
        """
        msg = message.lower().strip()

        # 1. Check Jailbreak / Prompt Extraction
        for pattern in cls.JAILBREAK_PATTERNS:
            if re.search(pattern, msg):
                return (
                    False,
                    "jailbreak_attempt",
                    "I am the BudgetBuddy AI Assistant. I can only assist you with managing your personal expenses, incomes, budgets, and savings goals.",
                    ["How much did I spend this month?", "Show my budget status", "Check my savings goals"]
                )

        # 2. Check Cross-User Data
        for pattern in cls.CROSS_USER_PATTERNS:
            if re.search(pattern, msg):
                return (
                    False,
                    "cross_user_data",
                    "For privacy and security, I can only access and discuss your own personal financial data.",
                    ["Show my expenses", "Check my monthly overview", "What is my remaining budget?"]
                )

        # 3. Check Speculative Trading / Stock Picks
        for pattern in cls.SPECULATIVE_TRADING_PATTERNS:
            if re.search(pattern, msg):
                return (
                    False,
                    "speculative_trading",
                    "I cannot provide specific stock picks, cryptocurrency trading signals, or speculative investment advice. BudgetBuddy is designed to help you track your cash flow, control expenses, and grow your personal savings.\n\nFor investment strategies, we recommend consulting a certified financial planner.",
                    ["How much can I safely save this month?", "Show my monthly surplus", "Check my savings goals"]
                )

        # 4. Check Tax Evasion / Illegal Advice
        for pattern in cls.TAX_LEGAL_PATTERNS:
            if re.search(pattern, msg):
                return (
                    False,
                    "illegal_tax",
                    "I cannot provide advice on tax avoidance or legal tax filing matters. Please consult a qualified tax professional or certified accountant.",
                    ["Show my total income this year", "Show my total expenses", "Give me a financial summary"]
                )

        return True, None, None, []
