"""
Chat Orchestrator Service Layer for BudgetBuddy AI Assistant.

Coordinates:
1. Safety Boundary Validation ->
2. Multi-turn Intent & Entity Extraction ->
3. Strict User Data Context Building ->
4. Deterministic Calculations ->
5. External AI Provider Execution (with Seamless Deterministic Fallback) ->
6. Financial Insight Cards Generation ->
7. Contextual Suggestions (capped at 3) & Action Navigation Metadata.
"""
from typing import Dict, Any, List, Optional
from django.utils import timezone
from .intent import IntentClassifier, IntentResult
from .context import UserDataContextFactory
from .calculators import format_currency
from .safety import SafetyValidator
from .prompts import SYSTEM_PROMPT
from .provider import BaseAIProvider, AIProviderFactory


class ChatOrchestrator:
    """
    Main orchestrator for personal finance chat interactions.
    """

    def __init__(self, user, provider: Optional[BaseAIProvider] = None):
        self.user = user
        self.classifier = IntentClassifier()
        self.provider = provider

    def process(self, message: str, session_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Processes a user message and returns verified response, insight cards, suggestions, and metadata.
        """
        # Step 1: Safety and boundary validation
        is_safe, restriction, safe_reply, safe_suggestions = SafetyValidator.validate(message)
        if not is_safe:
            return {
                "response": safe_reply,
                "suggestions": safe_suggestions[:3],
                "action": None,
                "actions": [],
                "insights": [],
                "context": {
                    "intent": "restricted",
                    "restriction": restriction,
                }
            }

        # Step 2: Detect intent and required domains with multi-turn memory
        intent: IntentResult = self.classifier.classify(message, session_context=session_context)

        # Step 3: Build isolated user domain context
        context_data = UserDataContextFactory.build_context(self.user, intent)

        # Step 4: Clean context for internal AI schema
        clean_context = self._prepare_ai_context(intent, context_data)

        # Step 5: Try AI provider with deterministic fallback
        response_text = None
        if intent.primary_intent not in ('greetings',):
            active_provider = self.provider or AIProviderFactory.get_provider()
            try:
                response_text = active_provider.generate_response(
                    context=clean_context,
                    user_message=message,
                    system_prompt=SYSTEM_PROMPT
                )
            except Exception:
                response_text = None

        # If provider returned None/empty, fall back to exact deterministic engine
        if not response_text:
            response_text = self._generate_response(intent, context_data, message)

        # Step 6: Generate financial insight cards
        insights = self._generate_insight_cards(intent, context_data)

        # Step 7: Generate contextual follow-up suggestions (strictly up to 3)
        suggestions = self._generate_suggestions(intent, context_data)[:3]

        # Step 8: Format actions
        actions = [intent.action] if intent.action else []

        return {
            "response": response_text,
            "suggestions": suggestions,
            "action": intent.action,
            "actions": actions,
            "insights": insights,
            "context": clean_context,
        }

    def _generate_insight_cards(self, intent: IntentResult, ctx: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Build compact, structured financial insight cards grounded in verified context.
        """
        cards: List[Dict[str, Any]] = []
        domain_data = ctx.get("domains", {})
        summary = ctx.get("summary", {})

        # Budget Health Card
        if 'budgets' in domain_data:
            bud_metrics = domain_data['budgets'].get('metrics', {})
            if bud_metrics.get('has_data'):
                util = bud_metrics.get('overall_utilization_percentage', 0.0)
                rem = bud_metrics.get('total_budget_remaining', 0.0)
                exceeded = len(bud_metrics.get('exceeded_budgets', [])) > 0
                near_limit = len(bud_metrics.get('near_limit_budgets', [])) > 0

                status = 'danger' if exceeded else 'warning' if near_limit else 'success'
                cards.append({
                    "type": "budget_health",
                    "title": "Budget Health",
                    "value": f"{util:.0f}% used",
                    "subtitle": f"{format_currency(rem)} remaining",
                    "status": status,
                })

        # Savings Progress Card
        if 'savings' in domain_data:
            sav_metrics = domain_data['savings'].get('metrics', {})
            if sav_metrics.get('has_data'):
                pct = sav_metrics.get('overall_progress_percentage', 0.0)
                saved = sav_metrics.get('total_saved', 0.0)
                target = sav_metrics.get('total_target', 0.0)
                cards.append({
                    "type": "savings_progress",
                    "title": "Savings Progress",
                    "value": f"{pct:.0f}%",
                    "subtitle": f"{format_currency(saved)} / {format_currency(target)}",
                    "status": "success",
                })

        # Top Spending Category Card
        if 'expenses' in domain_data:
            exp_metrics = domain_data['expenses'].get('metrics', {})
            if exp_metrics.get('has_data') and exp_metrics.get('categories'):
                top_cat = exp_metrics['categories'][0]
                cards.append({
                    "type": "top_category",
                    "title": "Top Spending Category",
                    "value": top_cat['label'],
                    "subtitle": f"{format_currency(top_cat['amount'])} ({top_cat['percentage']}%)",
                    "status": "info",
                })

        # Safe to Spend Card
        if intent.primary_intent in ('safe_to_spend', 'summary') and summary:
            safe_spend = summary.get('safe_to_spend', 0.0)
            status = 'success' if summary.get('current_balance', 0.0) > 0 else 'danger'
            cards.append({
                "type": "safe_to_spend",
                "title": "Safe to Spend",
                "value": format_currency(safe_spend),
                "subtitle": f"{summary.get('cash_flow_status', 'balanced').title()} cash flow",
                "status": status,
            })

        return cards[:2]  # Limit to 2 most relevant cards to keep UI clean and compact

    def _generate_response(self, intent: IntentResult, ctx: Dict[str, Any], raw_message: str) -> str:
        domain_data = ctx.get("domains", {})

        # 1. GREETINGS
        if intent.primary_intent == 'greetings':
            name = self.user.first_name or self.user.username
            return (
                f"Hello {name}! I am your BudgetBuddy Assistant.\n\n"
                "I can analyze your personal finances in real-time. Ask me questions like:\n"
                "- *\"How much did I spend this month?\"*\n"
                "- *\"Am I over my food budget?\"*\n"
                "- *\"How much can I safely spend?\"*\n"
                "- *\"How are my savings goals?\"*\n"
                "- *\"Give me a financial summary\"*\n\n"
                "How can I help you manage your money today?"
            )

        # 2. EXPENSES
        if intent.primary_intent == 'expenses':
            exp_domain = domain_data.get("expenses", {})
            metrics = exp_domain.get("metrics", {})
            period_lbl = exp_domain.get("period_label", "this period")
            cat_filter = exp_domain.get("category_filter")

            if not metrics.get("has_data"):
                if cat_filter:
                    return f"You have no recorded expenses in the **{cat_filter.title()}** category for **{period_lbl}**."
                return f"You haven't logged any expenses for **{period_lbl}** yet. You can log one anytime!"

            if intent.is_extreme_query == 'highest':
                hi = metrics.get("highest_expense")
                if hi:
                    return f"Your largest expense for **{period_lbl}** was **\"{hi['title']}\"** for **{format_currency(hi['amount'], hi.get('currency', 'INR'))}** in the *{hi['category'].title()}* category on {hi['date']}."
            elif intent.is_extreme_query == 'lowest':
                lo = metrics.get("lowest_expense")
                if lo:
                    return f"Your smallest expense for **{period_lbl}** was **\"{lo['title']}\"** for **{format_currency(lo['amount'], lo.get('currency', 'INR'))}** in the *{lo['category'].title()}* category on {lo['date']}."

            if cat_filter:
                tot = metrics.get("total_expense", 0.0)
                cnt = metrics.get("transaction_count", 0)
                avg = metrics.get("average_transaction", 0.0)
                reply = f"In **{period_lbl}**, you spent a total of **{format_currency(tot)}** on **{cat_filter.title()}** across {cnt} transaction{'s' if cnt != 1 else ''}."
                if cnt > 1:
                    reply += f" (Average: {format_currency(avg)} per transaction)"

                recent = exp_domain.get("recent_items", [])
                if recent:
                    reply += "\n\n**Recent transactions:**\n"
                    for item in recent[:3]:
                        reply += f"- **{item['title']}**: {format_currency(item['amount'])} ({item['date']})\n"
                return reply.strip()

            tot_exp = metrics.get("total_expense", 0.0)
            avg_daily = metrics.get("average_daily_expense", 0.0)
            tx_cnt = metrics.get("transaction_count", 0)
            cats = metrics.get("categories", [])
            hi = metrics.get("highest_expense")

            reply = f"You spent a total of **{format_currency(tot_exp)}** in **{period_lbl}** ({tx_cnt} transactions, ~{format_currency(avg_daily)}/day).\n\n"
            if cats:
                reply += "**Category Breakdown**:\n"
                for c in cats:
                    reply += f"- **{c['label']}**: {format_currency(c['amount'])} ({c['percentage']}%)\n"

            if hi:
                reply += f"\nYour single largest purchase was **\"{hi['title']}\"** for **{format_currency(hi['amount'], hi.get('currency', 'INR'))}** ({hi['category'].title()})."

            return reply.strip()

        # 3. INCOMES
        if intent.primary_intent == 'incomes':
            inc_domain = domain_data.get("incomes", {})
            metrics = inc_domain.get("metrics", {})
            period_lbl = inc_domain.get("period_label", "this period")
            src_filter = inc_domain.get("source_filter")

            if not metrics.get("has_data"):
                if src_filter:
                    return f"You haven't recorded any income from **{src_filter.title()}** for **{period_lbl}**."
                return f"You haven't logged any income for **{period_lbl}** yet."

            tot_inc = metrics.get("total_income", 0.0)
            sources = metrics.get("sources", [])
            hi_inc = metrics.get("highest_income")

            reply = f"Your total logged income for **{period_lbl}** is **{format_currency(tot_inc)}**.\n\n"
            if sources:
                reply += "**Income Sources**:\n"
                for s in sources:
                    reply += f"- **{s['label']}**: {format_currency(s['amount'])} ({s['percentage']}%)\n"

            if hi_inc:
                reply += f"\nYour top income was **{format_currency(hi_inc['amount'])}** from *{hi_inc['source'].title()}*."

            return reply.strip()

        # 4. BUDGETS
        if intent.primary_intent == 'budgets':
            bud_domain = domain_data.get("budgets", {})
            metrics = bud_domain.get("metrics", {})
            period_lbl = bud_domain.get("period_label", "this month")
            cat_filter = bud_domain.get("category_filter")

            if not metrics.get("has_data"):
                if cat_filter:
                    return f"You do not have an active budget configured for **{cat_filter.title()}**."
                return "You do not have any active budgets set up. Go to the Budgets page to create spending limits for categories."

            budgets = metrics.get("budgets", [])
            exceeded = metrics.get("exceeded_budgets", [])
            near_limit = metrics.get("near_limit_budgets", [])

            reply = f"Here is your budget status for **{period_lbl}**:\n\n"
            for b in budgets:
                rem = b['remaining']
                status_text = "exceeded" if rem < 0 else "remaining"
                reply += f"- **{b['name']}**:\n"
                reply += f"  Limit: {format_currency(b['limit'], b['currency'])} | Spent: {format_currency(b['spent'], b['currency'])} ({b['utilization_percentage']}%)\n"
                reply += f"  Status: **{format_currency(abs(rem), b['currency'])} {status_text}**\n\n"

            if exceeded:
                reply += f"⚠️ **Alert**: You have exceeded the budget for: **{', '.join(exceeded)}**!\n"
            elif near_limit:
                reply += f"⚠️ **Warning**: You are approaching your limit on: **{', '.join(near_limit)}** (>85% used).\n"
            else:
                reply += "✅ **Great job!** All your spending is currently within your set budget limits.\n"

            return reply.strip()

        # 5. SAVINGS
        if intent.primary_intent == 'savings':
            sav_domain = domain_data.get("savings", {})
            metrics = sav_domain.get("metrics", {})

            if not metrics.get("has_data"):
                return "You have no active savings goals. Create a goal on the Savings page to start building your emergency fund or planning purchases!"

            goals = metrics.get("goals", [])
            tot_saved = metrics.get("total_saved", 0.0)
            tot_target = metrics.get("total_target", 0.0)
            overall_pct = metrics.get("overall_progress_percentage", 0.0)

            reply = f"Here is the status of your savings goals (Total Saved: **{format_currency(tot_saved)}** of **{format_currency(tot_target)}** — **{overall_pct}%**):\n\n"
            for g in goals:
                pct = g['progress_percentage']
                bars = min(10, int(pct // 10))
                progress_bar = f"`[{'=' * bars}{'.' * (10 - bars)}]`"

                status_tag = " [COMPLETED]" if g['is_completed'] else ""
                reply += f"- **{g['name']}**{status_tag}:\n"
                reply += f"  Target: {format_currency(g['target'])} | Saved: {format_currency(g['current'])} ({pct}%)\n"
                reply += f"  Progress: {progress_bar}\n"
                if not g['is_completed']:
                    reply += f"  Remaining: {format_currency(g['remaining'])} (Deadline: {g['deadline']})\n\n"
                else:
                    reply += f"  Goal achieved! 🎉\n\n"

            return reply.strip()

        # 6. SAFE TO SPEND
        if intent.primary_intent == 'safe_to_spend':
            summary = ctx.get("summary", {})
            tot_inc = summary.get("total_income", 0.0)
            tot_exp = summary.get("total_expense", 0.0)
            balance = summary.get("current_balance", 0.0)
            safe_spend = summary.get("safe_to_spend", 0.0)
            budget_rem = summary.get("total_budget_remaining", 0.0)

            reply = "### Safe-to-Spend Analysis:\n\n"
            reply += f"- **Current Month Income**: {format_currency(tot_inc)}\n"
            reply += f"- **Total Spent So Far**: {format_currency(tot_exp)}\n"
            reply += f"- **Current Net Balance**: {format_currency(balance)}\n"
            if budget_rem > 0:
                reply += f"- **Unspent Budget Allocations**: {format_currency(budget_rem)}\n"

            reply += f"\n💡 **Estimated Safe Spending Allowance**: **{format_currency(safe_spend)}**\n\n"
            if balance <= 0:
                reply += "⚠️ You have spent all your earnings for this month. Additional spending will put you into a deficit."
            elif safe_spend < balance:
                reply += "This conservative estimate leaves a cushion for your remaining planned budget commitments and savings targets."
            else:
                reply += "You have positive cash flow and healthy liquidity for discretionary spending."

            return reply.strip()

        # 7. SUMMARY / OVERVIEW
        if intent.primary_intent == 'summary':
            summary = ctx.get("summary", {})
            now = timezone.now()
            period_name = now.strftime('%B %Y')

            tot_inc = summary.get("total_income", 0.0)
            tot_exp = summary.get("total_expense", 0.0)
            net = summary.get("current_balance", 0.0)
            rate = summary.get("savings_rate", 0.0)
            tot_sav = summary.get("total_savings", 0.0)

            reply = f"Here is your financial overview for **{period_name}**:\n\n"
            reply += f"- **Total Income**: {format_currency(tot_inc)}\n"
            reply += f"- **Total Expenses**: {format_currency(tot_exp)}\n"
            reply += f"- **Net Cash Flow**: {format_currency(net)}\n"
            if tot_inc > 0:
                reply += f"- **Savings Rate**: {rate:.1f}%\n"
            if tot_sav > 0:
                reply += f"- **Total Accumulated Savings**: {format_currency(tot_sav)}\n"

            bud_metrics = domain_data.get("budgets", {}).get("metrics", {})
            exceeded = bud_metrics.get("exceeded_budgets", [])
            if exceeded:
                reply += f"\n⚠️ **Budget Alert**: Exceeded budget on: {', '.join(exceeded)}."
            elif net < 0:
                reply += "\n⚠️ **Notice**: You have spent more than you earned this month. Consider checking your expense breakdown."
            elif rate >= 20.0:
                reply += "\n🎉 **Great job!** You are saving more than 20% of your income this month."
            else:
                reply += "\nYou're in the green. Keeping non-essential spending controlled will accelerate your savings goals."

            return reply.strip()

        # 8. ANALYTICS / TRENDS
        if intent.primary_intent == 'analytics':
            ana_domain = domain_data.get("analytics", {})
            cat_dist = ana_domain.get("category_distribution", [])
            trend = ana_domain.get("monthly_trend", [])
            extremes = ana_domain.get("extremes", {})

            reply = "### Financial Analytics & Trends:\n\n"
            if cat_dist:
                top_cat = cat_dist[0]
                reply += f"- **Top Spending Category**: **{top_cat['category'].title()}** ({format_currency(top_cat['total_amount'])} — {top_cat['percentage']}% of all spending)\n"

            if trend:
                latest_m = trend[-1]
                reply += f"- **Latest Month Spending ({latest_m['month']})**: {format_currency(latest_m['total_amount'])} across {latest_m['transaction_count']} transactions\n"

            hi_exp = extremes.get("highest_expense")
            if hi_exp:
                reply += f"- **All-Time Largest Purchase**: \"{hi_exp['title']}\" ({format_currency(hi_exp['amount'])})\n"

            return reply.strip()

        # 9. REPORTS
        if intent.primary_intent == 'reports':
            rep_domain = domain_data.get("reports", {})
            recent_reps = rep_domain.get("recent_reports", [])
            tot_gen = rep_domain.get("total_generated", 0)

            reply = f"### Reports Overview:\n\n"
            reply += f"You have generated **{tot_gen}** periodic reports.\n\n"
            if recent_reps:
                reply += "**Recent Reports:**\n"
                for r in recent_reps:
                    reply += f"- **{r['type']} Report** (Generated on {r['generated_at']})\n"
            reply += "\nYou can generate, view, and export PDF/CSV reports anytime on the Reports page."
            return reply.strip()

        # 10. ADVICE / RECOMMENDATIONS
        if intent.primary_intent == 'advice':
            summary = ctx.get("summary", {})
            tot_inc = summary.get("total_income", 0.0)
            tot_exp = summary.get("total_expense", 0.0)
            net = summary.get("current_balance", 0.0)

            advice_items = []

            if tot_inc > 0 and tot_exp > tot_inc:
                advice_items.append("⚠️ **Spending Deficit**: Your monthly expenses exceed your income. Audit discretionary spending in shopping and dining to restore positive cash flow.")

            bud_metrics = domain_data.get("budgets", {}).get("metrics", {})
            exceeded = bud_metrics.get("exceeded_budgets", [])
            near_limit = bud_metrics.get("near_limit_budgets", [])
            if exceeded:
                advice_items.append(f"⚠️ **Budget Overruns**: You have exceeded limits on **{', '.join(exceeded)}**. Consider freezing purchases in these categories for the rest of the month.")
            elif near_limit:
                advice_items.append(f"⚠️ **Budget Warning**: You are nearing your limit on **{', '.join(near_limit)}** (>85% used).")

            exp_metrics = domain_data.get("expenses", {}).get("metrics", {})
            for c in exp_metrics.get("categories", []):
                if c['category'] in ['food', 'dining'] and c['percentage'] > 30.0:
                    advice_items.append(f"💡 **Food & Dining**: Accounts for **{c['percentage']}%** of your spending. Meal prep and cooking at home could save a significant portion.")
                elif c['category'] in ['entertainment', 'shopping'] and c['percentage'] > 25.0:
                    advice_items.append(f"💡 **Discretionary Spending**: **{c['label']}** is taking up **{c['percentage']}%** of your budget.")

            sav_metrics = domain_data.get("savings", {}).get("metrics", {})
            if net > 0 and sav_metrics.get("active_goals_count", 0) > 0:
                rec_contrib = net * 0.5
                advice_items.append(f"🎯 **Savings Recommendation**: You have a net cash surplus of {format_currency(net)}. Allocating {format_currency(rec_contrib)} (50% of surplus) to your active savings goals will fast-track your deadlines.")

            if not advice_items:
                advice_items.append("✅ **Healthy Financial Standing**: Your spending is balanced and within budget. Keep logging transactions consistently!")
                advice_items.append("💡 **Tip**: Consider setting a new savings goal or increasing your emergency fund target.")

            reply = "### Personalized Financial Advice:\n\n" + "\n\n".join(advice_items)
            return reply.strip()

        # 11. FALLBACK / UNKNOWN
        return (
            "I'm not sure how to answer that question. I can help you with specific queries about your real financial data. Try asking:\n"
            "- *\"What's my spending this month?\"*\n"
            "- *\"How much did I spend on food?\"*\n"
            "- *\"Show me my budgets\"*\n"
            "- *\"How are my savings goals?\"*\n"
            "- *\"How much can I safely spend?\"*\n"
            "- *\"Give me a monthly overview\"*\n"
            "- *\"Provide financial advice\"*"
        )

    def _generate_suggestions(self, intent: IntentResult, ctx: Dict[str, Any]) -> List[str]:
        domain_data = ctx.get("domains", {})

        if intent.primary_intent == 'expenses':
            if intent.category:
                return [
                    f"Show my biggest {intent.category} expense",
                    f"Am I within my {intent.category} budget?",
                    f"Compare {intent.category} spending with last month",
                ]
            return [
                "What is my largest expense?",
                "Show my spending by category",
                "Am I over my budget?",
            ]

        elif intent.primary_intent == 'incomes':
            return [
                "How much did I spend this month?",
                "Calculate my savings rate",
                "Show my full financial overview",
            ]

        elif intent.primary_intent == 'budgets':
            bud_metrics = domain_data.get("budgets", {}).get("metrics", {})
            if bud_metrics.get("exceeded_budgets"):
                return [
                    "Which budget is closest to its limit?",
                    "How much can I safely spend?",
                    "Give me advice to cut costs",
                ]
            return [
                "Which budget is closest to its limit?",
                "How much can I safely spend?",
                "Show my monthly expense breakdown",
            ]

        elif intent.primary_intent == 'savings':
            return [
                "How much can I safely save this month?",
                "Give me advice to reach goals faster",
                "Show my monthly cash surplus",
            ]

        elif intent.primary_intent == 'safe_to_spend':
            return [
                "Check my budget limits",
                "Show my biggest expenses this month",
                "How are my savings goals doing?",
            ]

        elif intent.primary_intent in ('summary', 'advice', 'analytics'):
            return [
                "Show my top spending categories",
                "Am I over any budget limits?",
                "How are my savings goals?",
            ]

        elif intent.primary_intent == 'reports':
            return [
                "Give me a monthly overview",
                "Show my expense trends",
                "Provide financial advice",
            ]

        return [
            "How much did I spend this month?",
            "Show my budget status",
            "How are my savings goals?",
        ]

    def _prepare_ai_context(self, intent: IntentResult, ctx: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "intent": intent.primary_intent,
            "period": intent.timeframe,
            "category_filter": intent.category,
            "source_filter": intent.source,
            "required_domains": intent.required_domains,
            "domains": ctx.get("domains", {}),
            "summary": ctx.get("summary", {}),
        }
