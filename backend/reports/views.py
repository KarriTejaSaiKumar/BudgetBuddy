import logging
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

logger = logging.getLogger(__name__)


from .services import (
    get_monthly_financial_report,
    get_expense_report,
    get_income_report,
    get_savings_report,
    get_financial_summary_report,
    get_export_ready_data,
)
from .serializers import (
    MonthlyFinancialReportSerializer,
    ExpenseReportSerializer,
    IncomeReportSerializer,
    SavingsReportSerializer,
    FinancialSummaryReportSerializer,
    DateFilterSerializer,
)
from .exports import export_report_file
from notifications.services import create_notification


class MonthlyFinancialReportView(APIView):
    """
    GET /api/reports/monthly/
    Returns monthly financial report indicators (Total Income, Total Expense, Balance, Savings, Remaining Budget).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            report_data = get_monthly_financial_report(
                request.user, start_date=start_date, end_date=end_date, timeframe=timeframe
            )
            serializer = MonthlyFinancialReportSerializer(report_data['summary'])
            return Response({
                "period": report_data["period"],
                "report": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compile monthly financial report.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExpenseReportView(APIView):
    """
    GET /api/reports/expenses/
    Returns itemized expense details and category statistics for the selected date range.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            report_data = get_expense_report(
                request.user, start_date=start_date, end_date=end_date, timeframe=timeframe
            )
            serializer = ExpenseReportSerializer(report_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compile expense report.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IncomeReportView(APIView):
    """
    GET /api/reports/incomes/
    Returns itemized income details and source statistics for the selected date range.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            report_data = get_income_report(
                request.user, start_date=start_date, end_date=end_date, timeframe=timeframe
            )
            serializer = IncomeReportSerializer(report_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compile income report.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SavingsReportView(APIView):
    """
    GET /api/reports/savings/
    Returns savings goals, target amounts, saved amounts, progress percentages, and goal status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            report_data = get_savings_report(
                request.user, start_date=start_date, end_date=end_date, timeframe=timeframe
            )
            serializer = SavingsReportSerializer(report_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compile savings report.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FinancialSummaryReportView(APIView):
    """
    GET /api/reports/financial-summary/
    Master executive report combining financial summary, expenses, income, budgets, savings, and notifications.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            report_data = get_financial_summary_report(
                request.user, start_date=start_date, end_date=end_date, timeframe=timeframe
            )
            serializer = FinancialSummaryReportSerializer(report_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compile financial summary report.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CombinedFinancialReportView(FinancialSummaryReportView):
    """
    GET /api/reports/combined/ - Alias for financial summary report.
    """
    pass


class ExportReadyReportView(APIView):
    """
    GET /api/reports/export-ready/?report_type=expenses
    Returns normalized Python dictionaries/tables formatted specifically for CSV and PDF exports.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')
        report_type = request.query_params.get('report_type', 'summary')

        valid_types = ['summary', 'expenses', 'incomes', 'income', 'savings']
        if report_type not in valid_types:
            return Response(
                {"error": f"Invalid report_type '{report_type}'. Allowed values: {valid_types}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            export_data = get_export_ready_data(
                request.user,
                report_type=report_type,
                start_date=start_date,
                end_date=end_date,
                timeframe=timeframe
            )
            return Response(export_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to generate export-ready report data.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# REPORT EXPORT API VIEWS (PDF & CSV DOWNLOAD ENDPOINTS WITH NOTIFICATIONS)
# ============================================================================

class BaseReportExportView(APIView):
    """
    Base view for report export requests. Validates date filters, invokes export engine, and creates notification.
    """
    permission_classes = [permissions.IsAuthenticated]
    report_type = 'summary'
    export_format = 'pdf'

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_date = filter_serializer.validated_data.get('start_date')
        end_date = filter_serializer.validated_data.get('end_date')
        timeframe = filter_serializer.validated_data.get('timeframe', 'current_month')

        try:
            response = export_report_file(
                user=request.user,
                report_type=self.report_type,
                export_format=self.export_format,
                start_date=start_date,
                end_date=end_date,
                timeframe=timeframe
            )

            # Step 7: Create in-app notification when report is exported
            create_notification(
                user=request.user,
                title="Report Generated",
                message=f'Your {self.report_type.capitalize()} ({self.export_format.upper()}) report has been generated successfully.',
                notification_type="report",
                priority="info"
            )

            return response
        except Exception as e:
            return Response(
                {"error": f"Failed to export {self.report_type} report as {self.export_format.upper()}.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MonthlyReportExportPDFView(BaseReportExportView):
    """GET /api/reports/export/monthly/pdf/"""
    report_type = 'summary'
    export_format = 'pdf'


class MonthlyReportExportCSVView(BaseReportExportView):
    """GET /api/reports/export/monthly/csv/"""
    report_type = 'summary'
    export_format = 'csv'


class ExpenseReportExportPDFView(BaseReportExportView):
    """GET /api/reports/export/expenses/pdf/"""
    report_type = 'expenses'
    export_format = 'pdf'


class ExpenseReportExportCSVView(BaseReportExportView):
    """GET /api/reports/export/expenses/csv/"""
    report_type = 'expenses'
    export_format = 'csv'


class IncomeReportExportPDFView(BaseReportExportView):
    """GET /api/reports/export/incomes/pdf/"""
    report_type = 'incomes'
    export_format = 'pdf'


class IncomeReportExportCSVView(BaseReportExportView):
    """GET /api/reports/export/incomes/csv/"""
    report_type = 'incomes'
    export_format = 'csv'


class SavingsReportExportPDFView(BaseReportExportView):
    """GET /api/reports/export/savings/pdf/"""
    report_type = 'savings'
    export_format = 'pdf'


class SavingsReportExportCSVView(BaseReportExportView):
    """GET /api/reports/export/savings/csv/"""
    report_type = 'savings'
    export_format = 'csv'


class FinancialSummaryReportExportPDFView(BaseReportExportView):
    """GET /api/reports/export/financial-summary/pdf/"""
    report_type = 'summary'
    export_format = 'pdf'


class FinancialSummaryReportExportCSVView(BaseReportExportView):
    """GET /api/reports/export/financial-summary/csv/"""
    report_type = 'summary'
    export_format = 'csv'

