import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _is_email_configured():
    """
    Checks if email host or local testing backend is configured.
    """
    backend = getattr(settings, 'EMAIL_BACKEND', '')
    if 'locmem' in backend or 'console' in backend or 'filebased' in backend:
        return True
    host = getattr(settings, 'EMAIL_HOST', '')
    return bool(host and host.strip())


def _send_email_helper(user, subject, template_name, context):
    """
    Helper function to render HTML and text content and send email safely.
    Returns True on success, False on failure. Never raises exceptions.
    """
    try:
        recipient_email = getattr(user, 'email', None)
        if not recipient_email or not recipient_email.strip():
            logger.info(f"Skipping email delivery for user '{getattr(user, 'username', 'Unknown')}': No email address configured.")
            return False

        if not _is_email_configured():
            logger.info(f"Skipping email delivery for user '{getattr(user, 'username', 'Unknown')}': SMTP settings (EMAIL_HOST) not configured.")
            return False

        context['user'] = user
        if 'action_url' not in context:
            context['action_url'] = 'http://localhost:3000'

        html_content = render_to_string(template_name, context)
        text_content = strip_tags(html_content)

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@budgetbuddy.com')

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email.strip()]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        logger.info(f"Successfully sent email '{subject}' to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email '{subject}' to user '{getattr(user, 'username', 'Unknown')}': {str(e)}")
        return False


def send_generic_notification_email(user, title, message, action_url=None):
    """
    Sends generic notification email.
    """
    subject = f"BudgetBuddy: {title}"
    context = {
        'title': title,
        'message': message,
        'action_url': action_url or 'http://localhost:3000'
    }
    return _send_email_helper(user, subject, 'notifications/emails/generic_notification.html', context)


def send_budget_alert_email(user, budget_name, spent, limit, currency='INR'):
    """
    Sends budget warning alert email when spending reaches >= 80%.
    """
    subject = f"Budget Warning: {budget_name}"
    context = {
        'budget_name': budget_name,
        'spent': spent,
        'limit': limit,
        'currency': currency,
        'action_url': 'http://localhost:3000/budgets'
    }
    return _send_email_helper(user, subject, 'notifications/emails/budget_alert.html', context)


def send_budget_exceeded_email(user, budget_name, spent, limit, currency='INR'):
    """
    Sends budget exceeded alert email when spending exceeds limit.
    """
    subject = f"Budget Exceeded: {budget_name}"
    context = {
        'budget_name': budget_name,
        'spent': spent,
        'limit': limit,
        'currency': currency,
        'action_url': 'http://localhost:3000/budgets'
    }
    return _send_email_helper(user, subject, 'notifications/emails/budget_exceeded.html', context)


def send_savings_goal_completed_email(user, goal_name, target_amount, currency='INR'):
    """
    Sends savings goal achievement email.
    """
    subject = f"Goal Achieved: {goal_name}"
    context = {
        'goal_name': goal_name,
        'target_amount': target_amount,
        'currency': currency,
        'action_url': 'http://localhost:3000/savings'
    }
    return _send_email_helper(user, subject, 'notifications/emails/savings_goal_completed.html', context)


def send_monthly_report_email(user, report_data=None):
    """
    Sends monthly financial summary report email.
    """
    subject = "BudgetBuddy: Your Monthly Financial Report"
    context = {
        'report_data': report_data or {},
        'action_url': 'http://localhost:3000/reports'
    }
    return _send_email_helper(user, subject, 'notifications/emails/monthly_report.html', context)
