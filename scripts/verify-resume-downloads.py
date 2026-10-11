"""Verify rendered PDF and DOCX text against the approved canonical source.

Use --pdf PATH --finalize after render_docx.py --emit_pdf and visual QA.
Finalization places the verified PDF in public and records immutable hashes.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import unicodedata
from zipfile import ZipFile

from docx import Document
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--pdf', type=Path)
parser.add_argument('--finalize', action='store_true')
args = parser.parse_args()
source_path = ROOT / 'content/resume-download.json'
source = json.loads(source_path.read_text(encoding='utf-8'))
docx_path = ROOT / 'public/resume-files/Stephen-Abbott-Resume.docx'
pdf_output = ROOT / 'public/resume-files/Stephen-Abbott-Resume.pdf'
pdf_path = args.pdf or pdf_output

def normalized(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value))

with ZipFile(docx_path) as package:
    assert package.testzip() is None, 'DOCX package is corrupt'
    assert 'word/document.xml' in package.namelist()
paragraphs = [p.text for p in Document(docx_path).paragraphs]
expected = [block['text'] for block in source['blocks']]
assert paragraphs == expected, 'DOCX text differs from the approved source'
assert pdf_path.read_bytes().startswith(b'%PDF-'), 'PDF signature is missing'
pdf = PdfReader(pdf_path)
assert len(pdf.pages) == 2, f'Expected two pages, found {len(pdf.pages)}'
pdf_text = normalized('\n'.join(page.extract_text() for page in pdf.pages))
cursor = 0
for block in expected:
    needle = normalized(block)
    location = pdf_text.find(needle, cursor)
    assert location >= 0, f'PDF is missing or reorders source text: {block[:90]}'
    cursor = location + len(needle)

career = json.loads((ROOT / 'content/resume.json').read_text(encoding='utf-8'))['careerExperience']
roles = [block['text'].split(' | ') for block in source['blocks'] if block['kind'] == 'role']
def title_words(value):
    return normalized(value.replace('&', 'and').replace(',', '')).lower()
assert len(roles) == len(career)
for (title, dates), published in zip(roles, career):
    assert dates == published['dates'], 'Employment dates differ between formats'
    assert title_words(title) == title_words(published['title']), 'Historical titles differ'
for fact in ('11-person', '26', '75%', '92%', '99.99%', 'published iOS app',
             'Wire Hold', 'Arizona Now', 'Desert Wander', 'Shiba Studio',
             'WinterHunt: multiplayer hunting-game prototype in development',
             'CRISC bootcamp training'):
    assert normalized(fact) in pdf_text, f'Missing verified fact: {fact}'

if args.finalize:
    if pdf_path.resolve() != pdf_output.resolve():
        shutil.copyfile(pdf_path, pdf_output)
    source_files = ['content/resume-download.json', 'content/resume.json',
                    'content/resume-projects.json', 'app/resume/page.tsx',
                    'lib/career.ts', 'lib/credentials.ts', 'lib/contact.ts']
    manifest = {
        'regenerated': True,
        'sourceLibraryIds': source['provenance']['library_file_ids'],
        # Normalize source-text newlines across Windows/Linux. Download hashes
        # remain exact binary hashes.
        'sources': {name: hashlib.sha256((ROOT / name).read_text(encoding='utf-8').encode('utf-8')).hexdigest()
                    for name in source_files},
        'files': {path.name: {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                             'sizeBytes': path.stat().st_size}
                  for path in (pdf_output, docx_path)},
        'pages': 2,
        'verifiedTextBlocks': len(expected),
    }
    (ROOT / 'content/resume-downloads.generated.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Verified {len(expected)} approved text blocks in PDF and DOCX, two pages, matching roles and dates.')
