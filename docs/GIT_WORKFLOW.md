# ERM Platform — Git & Pull Request Workflow

> **Document type:** Engineering Process Guide  
> **Audience:** Repository owner + contributors  
> **Last updated:** 2026-02-23

---

## 1. Why Pull Requests?

Up to now, all changes have been pushed **directly to `main`**. That works for a solo developer moving fast, but introduces risk as the platform matures:

| Direct push to `main` | Pull Request workflow |
|---|---|
| No review gate | Changes reviewed before merging |
| CI runs after the fact | CI must pass **before** merge |
| Hard to revert a bad deploy | Bad commits never reach `main` |
| No audit trail of decisions | PR history documents every decision |

> **Core idea:** `main` is always deployable. Work happens on feature branches. Nothing reaches `main` without passing CI and (optionally) a review.

---

## 2. Mental Model

```
main ──────────────────────────────────────────────► always deployable
        ▲                    ▲
        │  merge             │  merge
        │                    │
  feature/fix-auth     feature/new-dashboard
  (your work here)     (collaborator's work)
```

- **`main`** — protected. Auto-deploys to OCI on every merge.
- **Feature branches** — where all work happens. Isolated. Safe to break.
- **Pull Request** — the gate between a feature branch and `main`.

---

## 3. Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/ai-risk-scoring` |
| Bug fix | `fix/<short-description>` | `fix/keycloak-ssl-error` |
| Documentation | `docs/<short-description>` | `docs/architecture-diagram` |
| Infrastructure | `infra/<short-description>` | `infra/add-redis-cache` |
| Hotfix (urgent) | `hotfix/<short-description>` | `hotfix/portal-down` |

---

## 4. The Full Workflow — Step by Step

### Step 1 — Create a branch
```bash
# Always branch from the latest main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Step 2 — Do your work
Make changes, commit often with meaningful messages:
```bash
git add .
git commit -m "feat(monitoring): add severity threshold configuration"
```

**Good commit message format** (Conventional Commits):
```
<type>(<scope>): <short summary>

Types: feat | fix | docs | ci | refactor | test | chore
```

### Step 3 — Push the branch
```bash
git push origin feature/your-feature-name
```

### Step 4 — Open a Pull Request on GitHub
1. Go to `github.com/Domtellis/erm-platform`
2. GitHub shows a banner: **"Compare & pull request"** — click it
3. Fill in:
   - **Title** — clear one-liner describing what changed
   - **Description** — what, why, and how to test it
   - **Link any related issues** if applicable
4. Click **"Create pull request"**

### Step 5 — CI runs automatically
The pipeline triggers on the PR:
- ✅ Lint + type-check passes → good to merge
- ❌ Build fails → fix it on the same branch, push again, CI re-runs

### Step 6 — Review (your role as owner)
As the repository owner, **you are the reviewer**:
- Read the diff on GitHub
- Leave comments on specific lines if needed
- Approve the PR when satisfied
- For solo work: self-approval is fine — the CI gate is what matters

### Step 7 — Merge
```
Merge strategy: "Squash and merge" (recommended for solo work)
```
This collapses all commits on the branch into one clean commit on `main`. Keeps the history readable.

Click **"Squash and merge"** → **"Confirm squash and merge"**

### Step 8 — Delete the branch
GitHub prompts you: **"Delete branch"** — always click it. Keeps the repo tidy.

### Step 9 — Deployment happens automatically
On merge to `main`, the CI pipeline runs:
1. Verify → Build → Package → Deploy to OCI ✅

---

## 5. Your Role as Repository Owner

| Responsibility | What to do |
|---|---|
| **Protect `main`** | Enable branch protection (see §6 below) |
| **Review PRs** | Check the diff, approve when ready |
| **Enforce CI as gate** | Never merge a red PR |
| **Keep branches short-lived** | PR open → reviewed → merged within 1–2 days |
| **Write descriptive PR descriptions** | Future-you will thank you |

---

## 6. Protecting `main` on GitHub (One-time Setup)

This prevents direct pushes to `main` — enforces the PR workflow:

1. Go to `github.com/Domtellis/erm-platform/settings/branches`
2. Click **"Add branch protection rule"**
3. Branch name pattern: `main`
4. Enable:
   - [x] **Require a pull request before merging**
   - [x] **Require status checks to pass before merging**
     - Add status check: `verify` (your CI job name)
   - [x] **Do not allow bypassing the above settings**
5. Click **"Save changes"**

> ⚠️ After enabling this, even you cannot push directly to `main`. Everything goes through a PR.

---

## 7. Quick Reference Card

```bash
# Start new work
git checkout main && git pull origin main
git checkout -b feature/my-feature

# During work
git add . && git commit -m "feat(scope): description"

# Ready for review
git push origin feature/my-feature
# → Open PR on GitHub → CI passes → Merge → Delete branch
```

---

## 8. What Changes With This Workflow

| Before | After |
|---|---|
| `git push origin main` directly | `git push origin feature/...` + PR |
| Pipeline runs after deploy | Pipeline runs before merge |
| Mistakes go live immediately | Mistakes are caught in CI before merge |
| History is a stream of commits | History is a clean log of features/fixes |

---

## 9. Exceptions — When Direct Push Is OK

- **Hotfixes** on a live outage where seconds matter — push to `main`, then open a "retroactive PR" for documentation
- **Documentation-only changes** — these skip CI anyway (via `paths-ignore`), so a direct push is low risk
- **Initial project setup** — as was done here

---

## 10. Related Files

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Pipeline definition — what runs on PR and merge |
| `docs/ARCHITECTURE.md` | System architecture — useful context for PR reviewers |
