# CAOS Desktop (Electron) & CI/CD Setup

CAOS is fully configured for **100% Local Desktop Execution** via Electron.js with automated GitHub Actions CI/CD for building Windows, macOS, and Linux executables.

---

## 1. Running Locally in Electron Development Mode

To run CAOS as a native desktop application during development:

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server in one terminal
npm run dev

# 3. In a second terminal, launch the Electron window
npm run electron:dev
```

---

## 2. Building Desktop Executables Locally

To generate offline-first standalone desktop installers or executables directly on your machine:

```bash
# Build for current OS
npm run electron:build

# Specific platforms:
npm run electron:build:win    # Windows (.exe installer & portable binary)
npm run electron:build:mac    # macOS (.dmg & .zip)
npm run electron:build:linux  # Linux (.AppImage & .deb)
```

The output binaries are saved directly to the `dist_electron/` directory.

---

## 3. Automated GitHub Actions (CI/CD)

The workflow file `.github/workflows/build-desktop.yml` is pre-configured to build multi-platform executables automatically on GitHub:

1. **On Push to `main` / `master`**: Automatically compiles and verifies desktop builds across Windows, macOS, and Linux runners, saving installer artifacts for download.
2. **On Git Tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`)**: Automatically generates a GitHub Release and attaches the `.exe`, `.dmg`, and `.AppImage` executables directly to the release page.
3. **Manual Trigger (Workflow Dispatch)**: You can also trigger the build on-demand anytime from the GitHub Actions tab in your repository.

---

## 4. Fully Local Data & API Architecture

- **Local Data**: All prospects, deals, activities, and custom schema fields persist locally via browser storage (`localStorage` & exportable JSON backups).
- **Personal API Keys**: Users can enter their Google Gemini API key directly in **Settings → AI & Gemini Keys**.
- **Credit-Optimized Model Auto-Selection**: CAOS uses a multi-tier fallback system (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`) so users on free-tier API keys experience zero downtime.
- **Mac Tech Branding**: Uses the native Mac Tech vector logo in high resolution across all desktop window frames and application headers.
