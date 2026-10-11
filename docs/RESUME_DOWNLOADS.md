# Resume downloads

The PDF and Word downloads are regenerated from the complete approved master text in `content/resume-download.json`. They are newly authored files, not recovered copies of the original Library binaries. The source records the original Library IDs for provenance. Those Library items are unchanged.

`scripts/build-resume-downloads.py` creates the editable Word document using the Codex bundled Python and python-docx. Render it with the documents skill's unchanged `render_docx.py`, using `--emit_pdf` and a task-local QA output directory. The PDF download must be that rendered Word document, so both formats carry the same content and layout.

Before finalizing, inspect every rendered page image. Run `scripts/verify-resume-downloads.py --pdf <rendered-PDF> --finalize` with the same bundled Python. It checks all approved text blocks in order, the DOCX package, PDF signature, two-page layout, matching historical titles and dates, and required verified facts. It then places the PDF in `public/resume-files` and records source and download hashes in `content/resume-downloads.generated.json`.

The static-export tests verify the toolbar links, byte-identical exported downloads, file signatures and hashes. They also reject changes to the resume sources after verification, preventing a stale download from being published alongside revised page content. Regenerate and repeat QA when the resume's factual source changes.

Do not materialize or patch the original Library items as part of regeneration. No new claims, dates, credentials, metrics or portraits should be added during document formatting.
