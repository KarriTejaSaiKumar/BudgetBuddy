from django.urls import path
from .views import (
    MonthlyFinancialReportView,
    ExpenseReportView,
    IncomeReportView,
    SavingsReportView,
    FinancialSummaryReportView,
    CombinedFinancialReportView,
    ExportReadyReportView,
    MonthlyReportExportPDFView,
    MonthlyReportExportCSVView,
    ExpenseReportExportPDFView,
    ExpenseReportExportCSVView,
    IncomeReportExportPDFView,
    IncomeReportExportCSVView,
    SavingsReportExportPDFView,
    SavingsReportExportCSVView,
    FinancialSummaryReportExportPDFView,
    FinancialSummaryReportExportCSVView,
)

urlpatterns = [
    # Standard Report Data Endpoints
    path('monthly/', MonthlyFinancialReportView.as_view(), name='report-monthly-financial'),
    path('expenses/', ExpenseReportView.as_view(), name='report-expenses'),
    path('incomes/', IncomeReportView.as_view(), name='report-incomes'),
    path('savings/', SavingsReportView.as_view(), name='report-savings'),
    path('financial-summary/', FinancialSummaryReportView.as_view(), name='report-financial-summary'),
    path('combined/', CombinedFinancialReportView.as_view(), name='report-combined'),
    path('export-ready/', ExportReadyReportView.as_view(), name='report-export-ready'),

    # Report Export File Endpoints (PDF & CSV Downloads)
    path('export/monthly/pdf/', MonthlyReportExportPDFView.as_view(), name='export-monthly-pdf'),
    path('export/monthly/csv/', MonthlyReportExportCSVView.as_view(), name='export-monthly-csv'),
    path('export/expenses/pdf/', ExpenseReportExportPDFView.as_view(), name='export-expenses-pdf'),
    path('export/expenses/csv/', ExpenseReportExportCSVView.as_view(), name='export-expenses-csv'),
    path('export/incomes/pdf/', IncomeReportExportPDFView.as_view(), name='export-incomes-pdf'),
    path('export/incomes/csv/', IncomeReportExportCSVView.as_view(), name='export-incomes-csv'),
    path('export/savings/pdf/', SavingsReportExportPDFView.as_view(), name='export-savings-pdf'),
    path('export/savings/csv/', SavingsReportExportCSVView.as_view(), name='export-savings-csv'),
    path('export/financial-summary/pdf/', FinancialSummaryReportExportPDFView.as_view(), name='export-financial-summary-pdf'),
    path('export/financial-summary/csv/', FinancialSummaryReportExportCSVView.as_view(), name='export-financial-summary-csv'),
]

