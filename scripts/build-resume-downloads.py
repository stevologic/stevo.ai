"""Create the editable resume from verified master text.

Run with the Codex bundled Python, then use the packaged render_docx.py with
--emit_pdf. The PDF download is the PDF produced by rendering this DOCX.
"""

from pathlib import Path
import json

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
source = json.loads((ROOT / 'content/resume-download.json').read_text(encoding='utf-8'))
document = Document()
for style in document.styles:
    properties = style._element.find(qn('w:pPr'))
    if properties is not None:
        for border in list(properties.findall(qn('w:pBdr'))):
            properties.remove(border)
section = document.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = Inches(0.65)
section.left_margin = section.right_margin = Inches(0.65)
section.footer_distance = Inches(0.3)

for name in ('Normal', 'Title', 'Subtitle', 'Heading 1', 'List Bullet'):
    style = document.styles[name]
    style.font.name = 'Calibri'
    style.font.color.rgb = RGBColor(0, 0, 0)
    style._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:ascii'), 'Calibri')
    style._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:hAnsi'), 'Calibri')
normal = document.styles['Normal']
normal.font.size = Pt(11)
normal.paragraph_format.line_spacing = 1.03
normal.paragraph_format.space_after = Pt(5)
document.styles['Title'].font.size = Pt(23)
document.styles['Title'].paragraph_format.space_after = Pt(3)
document.styles['Subtitle'].font.size = Pt(12)
document.styles['Subtitle'].paragraph_format.space_after = Pt(6)
heading = document.styles['Heading 1']
heading.font.size = Pt(12)
heading.font.bold = True
heading.paragraph_format.space_before = Pt(10)
heading.paragraph_format.space_after = Pt(5)
heading.paragraph_format.keep_with_next = True
bullet = document.styles['List Bullet']
bullet.font.size = Pt(11)
bullet.paragraph_format.left_indent = Inches(0.16)
bullet.paragraph_format.first_line_indent = Inches(-0.1)
bullet.paragraph_format.space_after = Pt(3)

for block in source['blocks']:
    kind, text = block['kind'], block['text']
    style = {'title': 'Title', 'subtitle': 'Subtitle', 'heading': 'Heading 1',
             'bullet': 'List Bullet'}.get(kind, 'Normal')
    paragraph = document.add_paragraph(text, style=style)
    properties = paragraph._p.get_or_add_pPr()
    for border in list(properties.findall(qn('w:pBdr'))):
        properties.remove(border)
    if block.get('pageBreak'):
        paragraph.paragraph_format.page_break_before = True
        paragraph.paragraph_format.space_before = Pt(0)
    if kind == 'contact':
        paragraph.paragraph_format.space_after = Pt(3)
        for run in paragraph.runs:
            run.font.size = Pt(9.5)
    if kind in ('employer', 'role'):
        paragraph.paragraph_format.keep_with_next = True
        paragraph.paragraph_format.space_before = Pt(7 if kind == 'role' else 0)
        paragraph.paragraph_format.space_after = Pt(3)
        for run in paragraph.runs:
            run.bold = True

footer = section.footer.paragraphs[0]
footer.paragraph_format.space_after = Pt(0)
footer.add_run('Stephen M Abbott  |  ')
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)
for run in footer.runs:
    run.font.size = Pt(8)
document.core_properties.title = 'Stephen M Abbott Resume'
document.core_properties.author = 'Stephen M Abbott'
document.core_properties.subject = 'Cybersecurity and AI Executive'
document.core_properties.comments = 'Regenerated from verified approved master resume text.'
output = ROOT / 'public/resume-files/Stephen-Abbott-Resume.docx'
output.parent.mkdir(parents=True, exist_ok=True)
document.save(output)
print(f'Created {output.name}')
