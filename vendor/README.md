# Browser document parsers

Vendored from the npm registry with npm integrity verification enabled:

- pdfjs-dist 6.5.438: build/pdf.mjs and build/pdf.worker.mjs (Apache-2.0; pdfjs-LICENSE).
- mammoth 1.13.0: mammoth.browser.min.js (BSD-2-Clause; mammoth-LICENSE).

These files are served locally; imports do not use a document-conversion service or CDN. PDF JavaScript evaluation is disabled. Mammoth is used only for raw text extraction, never HTML rendering.

To refresh, install exact reviewed versions outside the checkout with npm and copy these distribution files and licenses. Run both documented test commands afterwards. There is no application build step.
