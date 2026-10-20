# v9 development status

All implementation changes belong to `development`. `main`, live PNGs, animal masters and production Drive are unchanged. No Pages deployment workflow is added.

## One supported entry point

`index.html` uses `app.mjs`, `app.css`, `selection-core.mjs` and `sync-engine.mjs`. The previous thirteen experimental pages now redirect here; their original implementations remain in Git history (baseline `89410de`). This removes stacked event-handler replacements and multiple independent write workflows.

The primary phone actions are **未選抜を読み込む** and **選抜確定・Drive同期**. File import, backgrounds, bulk rating and JSON/CSV export are under an expandable panel. Existing localStorage/IndexedDB keys and existing image identities remain in place. Newly imported local images use a content hash; identical legacy blobs reuse their original ID. Local imports do not receive candidate/attempt IDs or technical approval by inference.

## Safe development transport

This build intentionally has **no enabled real Drive write transport**. The default UI explains that real Drive integration is unavailable; local PNG/ZIP selection works. For a functional mock preview:

```sh
npm ci
npm run dev
# Open the printed localhost URL with /?mock=1
```

The mock HTTP server binds to localhost, stores only synthetic records in process memory and resets on restart. The engine treats that remote state independently from browser storage, so browser reload tests exercise resumable synchronization. Tests block all external requests except a fulfilled, local JSZip script fixture; no Google login/token/production IDs are used.

## Identity and synchronization contract

Records require `imageId`, `candidate`, `attemptId`, `driveFileId`, `filename`, `technicalPassed`, `folder`, rating, comment and confirmation. Candidate IDs can repeat across attempts; image IDs and Drive IDs cannot. A defective record fails individually. An explicit confirmation is required before adapter IO that writes.

The shared engine verifies the file, writes and reads back an independent journal event, moves only when required, reads back the file, saves and reads back the rating, then completes and verifies the journal. Stable operation IDs include a user-edit revision, preserving o → h → o histories while preventing retries from adding duplicate events. Lost responses after any write are retried using the same operation ID. Previously confirmed ratings alone do not prove that a completion history exists.

Production v9 policy: o → adopt; h → hold; x retains its current PNG folder and saves history only. `testReject` routes x to reject **only on a mock adapter**. There is no PNG delete or upload endpoint.

## Validation

```sh
npm test
npx playwright install --with-deps chromium webkit
npm run test:browser
```

CI runs on pushes to development and on PRs. Playwright uses a 390×844 touch viewport in Chromium and WebKit, tests actual decoded PNGs, ratings/comments/background retention, reload, confirmation gating, partial failures, history idempotency, corrupt PNG isolation and 130-image ZIP import/reimport/export. This is browser emulation, not proof of behavior on a physical iPhone.

## Remaining integration work

- Implement and independently test a real Drive/Sheets adapter with an explicit target allowlist, conditional writes and remote event uniqueness; reconnect OAuth and real read-only loading. The earlier test-page REST writes were not carried into the supported entry point because they lacked this contract.
- Map the live v9 animal master schema and technical-pass evidence before connecting real PNGs. The supplied v3 workbook was inspected read-only: it contains 116 candidates and history templates, but it does not establish live v9 image/Drive IDs, attempt mappings or technical approvals. No personal workbook contents are committed.
- Test real Google authorization, access limits and readback using isolated test folders before production activation. Production testing requires separately authorized scope.
- Add cross-device conflict handling before enabling a real adapter. Current UI prevents overlap in the same page; the mock journal is not a production distributed lock.
- Check physical iPhone Safari and storage eviction behavior. Export JSON regularly; browser storage is not a durable backup.
- ZIP parsing depends on pinned JSZip 3.10.1 from a CDN in the UI. CI supplies identical local bytes; offline ZIP import and ZIP expansion limits remain to be improved.
