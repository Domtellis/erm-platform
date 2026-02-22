# Contributing to ERM Platform

Welcome to your DevOps journey! To maintain a professional, high-quality platform, we follow the **GitHub Flow** branching strategy. This ensures that the `main` branch is always stable and ready for deployment.

## 🌿 Branching Strategy: GitHub Flow

### 1. The `main` Branch
- **Status**: Production-ready.
- **Rule**: Never push directly to `main`. All changes must arrive via a **Pull Request (PR)**.

### 2. Feature Branches
When starting a new task, create a short-lived feature branch from `main`.
- **Naming**: `feat/` (features), `fix/` (bugs), `docs/` (documentation), `refactor/` (code cleanup).
- **Example**: `feat/ai-risk-service-scaling`

### 3. The Workflow
1. **Create Branch**: `git checkout -b feat/your-feature-name`
2. **Commit Changes**: Make atomic, focused commits.
3. **Pull Request**: Push your branch to GitHub and open a Pull Request.
4. **CI Validation**: Automated tests (GitHub Actions) must pass before merging.
5. **Merge**: Once green, merge into `main` and delete the feature branch.

---

## 🏗️ Development Workflow (Local)

### Monorepo Management
We use **TurboRepo** to manage our microservices and web apps.
- **Build All**: `make build` (uses intelligent caching)
- **Test All**: `make test`
- **Full CI Check**: `make ci` (Lint + Build + Test)

### Secret Management
- **Never** commit `.env` files or API keys (Gemini, Keycloak).
- Use `sample.env` as a template for new contributors.
- Store sensitive values in **GitHub Secrets** for CI/CD.

---

## 🧪 Testing Standards
- **Unit Tests**: Required for all business logic in NestJS services.
- **Contract Tests**: Run `pact` tests to ensure services can communicate.
- **Documentation**: If you change an API, update the `README.md` and Swagger specs.

---

> [!TIP]
> **DevOps Tip**: High-performing teams merge early and often. Aim for PRs that can be reviewed in under 5 minutes.
