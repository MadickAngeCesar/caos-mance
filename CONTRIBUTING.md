# Contributing to CAOS

Thank you for your interest in contributing to the Client Acquisition & Outreach System (CAOS)!

## Development Setup

1. Clone the repository.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Test the Electron desktop environment:
   ```bash
   npm run electron:dev
   ```

## Branching Strategy

- **`main`**: The stable production branch.
- **`feature/*`**: Create a feature branch for any new functionality (e.g., `feature/ai-enhancements`).
- **`bugfix/*`**: Create a bugfix branch for resolving issues (e.g., `bugfix/fix-prospect-keys`).

## Pull Request Process

1. **Verify Code**: Ensure all TypeScript checks pass by running `npm run lint`.
2. **Verify Build**: Ensure the application builds successfully via `npm run build`.
3. **Draft the PR**: Provide a clear summary of your changes, the motivation behind them, and screenshots if you modified the UI.
4. **Review**: Wait for review from the core MAC TECH maintainers before merging.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please maintain professionalism, respect, and constructive collaboration in all pull requests and issue discussions.
