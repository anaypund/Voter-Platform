#!/usr/bin/env python3
"""
HTML to PDF Converter for Voter Slips
Uses wkhtmltopdf (via pdfkit) to render HTML to PDF with proper formatting
"""

import sys
import json
from pathlib import Path

try:
    import pdfkit
except ImportError:
    print("Error: pdfkit not installed. Run: pip install pdfkit")
    sys.exit(1)

def html_to_pdf(html_content: str, output_path: str) -> dict:
    """
    Convert HTML content to PDF file
    
    Args:
        html_content: HTML string with voter slip design
        output_path: Path where PDF should be saved
        
    Returns:
        dict with status and file info
    """
    try:
        # Ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Options for wkhtmltopdf
        options = {
            'page-size': 'A4',
            'margin-top': '5mm',
            'margin-right': '5mm',
            'margin-bottom': '5mm',
            'margin-left': '5mm',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'print-media-type': None,
        }
        
        # Convert HTML to PDF
        pdfkit.from_string(html_content, output_path, options=options)
        
        # Verify file was created
        if Path(output_path).exists():
            file_size = Path(output_path).stat().st_size
            return {
                'status': 'success',
                'filePath': output_path,
                'fileSize': file_size,
                'message': f'PDF generated: {file_size} bytes'
            }
        else:
            return {
                'status': 'error',
                'message': 'PDF file was not created'
            }
            
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Error converting HTML to PDF: {str(e)}'
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 render_slip_to_pdf.py <html_file> <output_pdf>")
        sys.exit(1)
    
    html_file = sys.argv[1]
    output_pdf = sys.argv[2]
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        result = html_to_pdf(html_content, output_pdf)
        print(json.dumps(result))
        sys.exit(0 if result['status'] == 'success' else 1)
    except Exception as e:
        print(json.dumps({
            'status': 'error',
            'message': str(e)
        }))
        sys.exit(1)
