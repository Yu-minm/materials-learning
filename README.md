# MATERIALS LEARNING LAB: Scan Edition

Edition: `2026-10-02.scan.1`. The existing browser edition has been updated with the supplied scanned PDF.

- 36 textbook pages: p40-p50 and p283-p307.
- 49 separately cropped figures and 19 source views, all replaced from the scan.
- Printed p51 and p282 are physically cropped out, including source views.
- 96 questions, 54 terms, transcripts, source links, and record IDs are unchanged.
- Deployment path, catalog version, and learning database keys are unchanged.

Upload the CONTENTS of `01_UPLOAD_APP` and `02_UPLOAD_IMAGES` into the same repository root.
The ZIP itself, the two batch parent folders, and `99_REFERENCE` do not belong at the site root.
The prebuilt site needs no Node.js or command-line installation for deployment.
For an existing site, keep the same repository and Pages URL. Back up learning records before updating.

Use `check.html` to verify the deployment. Its optional image-content verification downloads 104 images
(about 101 MB) and compares SHA-256 hashes with the scan manifest.

The scan image revision bypasses older photographic image cache keys. Existing text transcription limitations remain.
This package does not add authentication or grant permission to publish the supplied textbook.

GitHub documentation checked on 2026-10-02:
- [Adding a file to a repository](https://docs.github.com/ja/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Configuring a publishing source](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
