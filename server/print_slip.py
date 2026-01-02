import sys
import json
import tempfile
from weasyprint import HTML

def main():
    try:
        # Read JSON from stdin
        data = json.load(sys.stdin)
        
        # Render HTML (Simple string template)
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page {{ size: 80mm 120mm; margin: 0; }}
                body {{ font-family: sans-serif; padding: 10px; font-size: 12px; }}
                .header {{ text-align: center; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; }}
                .row {{ margin-bottom: 5px; }}
                .label {{ font-weight: bold; display: inline-block; width: 80px; }}
                .footer {{ margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px solid #ccc; padding-top: 5px; }}
            </style>
        </head>
        <body>
            <div class="header">
                VOTER SLIP
            </div>
            <div class="row"><span class="label">Name:</span> {data.get('Name', '')}</div>
            <div class="row"><span class="label">Father/Husb:</span> {data.get('Husband Name', '')}</div>
            <div class="row"><span class="label">Age:</span> {data.get('Age', '')}</div>
            <div class="row"><span class="label">Gender:</span> {data.get('Gender', '')}</div>
            <div class="row"><span class="label">EPIC No:</span> {data.get('epic_no', '')}</div>
            <div class="row"><span class="label">Booth:</span> {data.get('booth', '')}</div>
            <div class="row"><span class="label">Ward:</span> {data.get('ward', '')}</div>
             <div class="row"><span class="label">Address:</span> {data.get('ward_address', '')}</div>
            
            <div class="footer">
                Please carry your Identity Card.
            </div>
        </body>
        </html>
        """
        
        # Generate PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tf:
            HTML(string=html_content).write_pdf(tf.name)
            print(tf.name) # Print filename to stdout

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
