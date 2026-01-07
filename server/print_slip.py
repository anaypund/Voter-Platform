import sys
import json
import base64
import os
import tempfile
from pathlib import Path
import platform
from dotenv import load_dotenv

# Set UTF-8 encoding for stdout and stdin
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8')


load_dotenv()

if platform.system() == "Windows":
    dll_dir = os.getenv("WEASYPRINT_DLL_DIRECTORIES")
    if dll_dir:
        os.environ["WEASYPRINT_DLL_DIRECTORIES"] = dll_dir

from weasyprint import HTML

def image_to_base64(image_path):
    """Convert image to base64 string"""
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except FileNotFoundError:
        return None

def main():
    try:
        # Read JSON from stdin with UTF-8 encoding
        input_text = sys.stdin.read()
        data = json.loads(input_text)
        
        # Get photo path from arguments or use default
        photo_path = sys.argv[1] if len(sys.argv) > 1 else "public/images/Slip-banner.jpg"
        
        # Try to convert image to base64
        photo_base64 = image_to_base64(photo_path)
        if photo_base64:
            photo_src = f"data:image/png;base64,{photo_base64}"
        else:
            photo_src = ""
        
        # Get absolute path to font file
        script_dir = Path(__file__).parent.parent
        font_path = script_dir / "public" / "fonts" / "NotoSerifDevanagari-VariableFont_wdth,wght.ttf"
        
        # Convert to file:// URL for WeasyPrint
        font_url = font_path.as_uri()
        
        # Determine father or husband name
        father_or_husband = ""
        father_name = data.get('Father Name', '').strip()
        husband_name = data.get('Husband Name', '').strip()
        
        if father_name:
            father_or_husband = f"वडिलांचे नाव: {father_name}"
        elif husband_name:
            father_or_husband = f"पतीचे नाव: {husband_name}"
        
        house_no = str(data.get('House_Number', '')).strip()
        if not house_no:
            house_no = ''
        
        # Create single block HTML
        block = f"""
        <div class="block">
            <div class="block-photo-wrapper">
                <img src="{photo_src}" class="block-photo" alt="Photo" />
            </div>
            <div class="block-text">
                <div class="line1">अमरावती महानगरपालिका  &nbsp;&nbsp;  प्रभाग क्र : {data.get('ward', '')}</div>
                <div class="line1">यादी भाग क्र. {data.get('Yaadi_bhaag_kr', '')} &nbsp;&nbsp; {data.get('Yaadi_bhaag_address', '')}</div>
                <div class="spacer"></div>
                <div class="row-split">
                    <span>अ.क्र.: {data.get('Index', '')}</span>
                    <span class="epic">EPIC: {data.get('epic_no', '')}</span>
                </div>
                <div>मतदाराचे नाव: {data.get('Name', '')}</div>
                <div>{father_or_husband}</div>
                <div>घर क्रमांक: {house_no} &nbsp;&nbsp; वय : {data.get('Age', '')} &nbsp;&nbsp; लिंग : {data.get('Gender', '')}</div>
                <div> मतदान केंद्र: {data.get('booth', '')}</div>
            </div>
        </div>
        """
        
        # Create HTML with exact design from your working script
        html_text = f"""
        <!DOCTYPE html>
        <html lang="mr">
        <head>
        <meta charset="UTF-8">
        <style>
        @page {{
            size: A4;
            margin: 0;
        }}
        @font-face {{
            font-family: "NotoDeva";
            src: url("{font_url}");
        }}
        body {{
            font-family: "NotoDeva";
            margin: 0;
            padding: 0;
            font-size: 12pt;
        }}
        .page-break {{
            page-break-after: always;
        }}
        .block {{
            width: 46%;
            height: 15.8rem;
            float: left;
            box-sizing: border-box;
            font-size: 8pt;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            margin: 12px;
            margin-left: 18px;
            margin-bottom: 28px;
            border: 1.5px solid #333;
            background: #fff;
        }}
        .block-photo-wrapper {{
            width: 100%;
            display: flex;
            border-bottom: 1.5px solid #333;
            justify-content: center;
            align-items: center;
        }}
        .block-photo {{
            width: 100%;
            height: auto;
            object-fit: cover;
        }}
        .block-text {{
            padding: 10px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }}
        .line1 {{
            font-weight: bold;
            font-size: 7pt;
            text-align: center;
            width: 100%;   
        }}
        .spacer {{
            height: 11px;
        }}
        .row-split{{
            display:flex;
            width:100%;
        }}

        .row-split span{{
            font-size:8pt;
        }}

        .row-split .epic{{
            margin-left:auto;
            text-align:right;
            font-weight:bold;
        }}

        </style>
        </head>
        <body>
        {block}
        </body>
        </html>
        """
        
        # Generate PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tf:
            HTML(string=html_text).write_pdf(tf.name)
            print(tf.name, flush=True)  # Print filename to stdout with flush

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
