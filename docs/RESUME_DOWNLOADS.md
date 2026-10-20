# Resume downloads

The PDF and Word downloads are regenerated from the complete approved master text in `content/resume-download.json`. They are newly authored files, not recovered copies of the original Library binaries. The source records the original Library IDs for provenance. Those Library items are unchanged.

`scripts/build-resume-downloads.py` writes both downloads from `content/resume-download.json`: the Word document (python-docx) and a two-page PDF of the same approved text blocks (reportlab). Install the Python packages listed in `scripts/requirements-resume-downloads.txt`, then run `npm run resume:downloads`. That build step is followed by `scripts/verify-resume-downloads.py --finalize`, which checks all approved text blocks in order, the DOCX package, PDF signature, two-page layout, matching historical titles and dates, and required verified facts. It then records source and download hashes in `content/resume-downloads.generated.json`.

The static-export tests verify the toolbar links, byte-identical exported downloads, file signatures and hashes. They also reject changes to the resume sources after verification, preventing a stale download from being published alongside revised page content. Regenerate and repeat QA when the resume's factual source changes.

Do not materialize or patch the original Library items as part of regeneration. No new claims, dates, credentials, metrics or portraits should be added during document formatting.
