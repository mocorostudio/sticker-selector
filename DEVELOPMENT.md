# Development workflow for sticker selector

- **main**: Stable GitHub Pages release branch. Do not modify while testing.
- **development**: Build fixes and new features here first.
- **CI**: `.github/workflows/sticker-check.yml` runs the JavaScript syntax and essential UI checks on changes.
- **Release**: Check CI result, test key flows with mock data, then manually merge into main and verify on iPhone.
- **Privacy**: Tests must never modify production Drive folders or animal masters.
- **Limits**: Current checks are static. Google login, actual Drive writes and real iPhone rendering still require separate verification.
