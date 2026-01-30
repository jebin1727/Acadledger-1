
import zipfile
import xml.etree.ElementTree as ET
import sys
import os

docx_path = r"d:\Final-Year-Project\docs\Project Report Format.docx"

if not os.path.exists(docx_path):
    print(f"File not found: {docx_path}")
    sys.exit(1)

try:
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        
        # XML namespace for Word
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        body = tree.find('w:body', ns)
        if body is None:
            print("No body found in valid docx.")
            sys.exit(1)
            
        text_content = []
        for p in body.findall('w:p', ns):
            p_text = ""
            for r in p.findall('w:r', ns):
                t = r.find('w:t', ns)
                if t is not None and t.text:
                    p_text += t.text
            if p_text.strip():
                print(p_text)
                
except Exception as e:
    print(f"Error reading docx: {e}")
