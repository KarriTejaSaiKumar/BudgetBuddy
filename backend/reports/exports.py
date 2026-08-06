import csv
import io
from django.http import HttpResponse
from .services import get_export_ready_data


def generate_csv_response(export_data, filename):
    """
    Generates an HTTP Response with a downloadable CSV file.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)
    
    # Write Header Metadata
    metadata = export_data.get('metadata', {})
    writer.writerow([metadata.get('report_title', 'Report')])
    writer.writerow([f"Generated For: {metadata.get('user', '')}"])
    writer.writerow([f"Generated At: {metadata.get('generated_at', '')}"])
    writer.writerow([f"Period: {metadata.get('start_date', '')} to {metadata.get('end_date', '')}"])
    writer.writerow([])  # Empty line separator

    # Write Table Headers and Rows
    table = export_data.get('table', {})
    headers = table.get('headers', [])
    rows = table.get('rows', [])

    if headers:
        writer.writerow(headers)
    for row in rows:
        writer.writerow(row)

    return response


def generate_pdf_response(export_data, filename):
    """
    Generates a structured PDF binary stream HTTP Response.
    """
    metadata = export_data.get('metadata', {})
    table = export_data.get('table', {})
    headers = table.get('headers', [])
    rows = table.get('rows', [])

    buffer = io.BytesIO()

    # Simple, valid Minimalist PDF Document Stream
    title = metadata.get('report_title', 'Report')
    user = metadata.get('user', '')
    generated_at = metadata.get('generated_at', '')
    start_date = metadata.get('start_date', '')
    end_date = metadata.get('end_date', '')

    pdf_content = f"""%PDF-1.4
1 0 obj < /Type /Catalog /Pages 2 0 R > endobj
2 0 obj < /Type /Pages /Kids [3 0 R] /Count 1 > endobj
3 0 obj < /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources < /Font < /F1 5 0 R > > > endobj
5 0 obj < /Type /Font /Subtype /Type1 /BaseFont /Helvetica > endobj
4 0 obj < /Length 800 > stream
BT
/F1 18 Tf
50 740 Td
({title}) Tj
/F1 10 Tf
0 -25 Td
(User: {user} | Date: {generated_at}) Tj
0 -15 Td
(Period: {start_date} to {end_date}) Tj
0 -30 Td
/F1 12 Tf
(--- REPORT DATA ---) Tj
"""
    y_offset = -20
    for header in headers:
        pdf_content += f"0 {y_offset} Td\n({header}) Tj\n"
        y_offset = -15

    for row in rows:
        row_str = " | ".join(str(cell) for cell in row)
        # Escape parenthesis for raw PDF stream
        safe_row = row_str.replace("(", "[").replace(")", "]")
        pdf_content += f"0 -15 Td\n({safe_row[:80]}) Tj\n"

    pdf_content += """ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
0000000236 00000 n 
trailer < /Size 6 /Root 1 0 R >
startxref
1150
%%EOF"""

    response = HttpResponse(pdf_content.encode('utf-8', errors='ignore'), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def export_report_file(user, report_type, export_format, start_date=None, end_date=None, timeframe=None):
    """
    Main export dispatcher that retrieves report data and outputs formatted file responses.
    """
    export_data = get_export_ready_data(user, report_type=report_type, start_date=start_date, end_date=end_date)
    
    # Generate clean filename based on report_type, timeframe/date, and format
    tf_str = timeframe if timeframe else "report"
    filename = f"{report_type}_{tf_str}.{export_format.lower()}"

    if export_format.lower() == 'csv':
        return generate_csv_response(export_data, filename)
    else:
        return generate_pdf_response(export_data, filename)
