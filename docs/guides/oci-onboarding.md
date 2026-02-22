# OCI Onboarding & Security Guide

This guide will help you collect the "Keys" to your Cloud Foundation. You will need these to activate the Terraform blueprints and the CI/CD pipeline.

## 🔐 1. Generate SSH Keys
You need a matched pair of keys: a **Public Key** (which we tell Oracle Cloud about) and a **Private Key** (which you keep secret and give to GitHub).

### On Windows (PowerShell):
1. Open PowerShell and run:
   ```powershell
   ssh-keygen -t rsa -b 4096 -f "$HOME\.ssh\id_rsa_oci"
   ```
2. Press **Enter** to skip the passphrase (easier for automation).
3. This creates two files in `C:\Users\domte\.ssh\`:
   - `id_rsa_oci.pub`: Your **Public Key** (Safe to share).
   - `id_rsa_oci`: Your **Private Key** (🚨 KEEP THIS SECRET).

---

## 🆔 2. Locating OCI Identifiers (OCIDs)
Log in to your [Oracle Cloud Console](https://cloud.oracle.com/).

### A. Tenancy OCID
- Click the **Profile** icon (top right) -> **Tenancy: <YourName>**.
- Look for **OCID** and click **Copy**.

### B. User OCID
- Click the **Profile** icon -> **User Settings**.
- Look for **OCID** and click **Copy**.

### C. Compartment OCID
- Search for "Compartments" in the top search bar.
- Use your **Root Compartment** (named after your tenancy) or create a new one called `DevOps`.
- Click **Copy OCID**.

---

## 🔑 3. Generating the API Key (For Terraform)
Terraform needs permission to "talk" to your account.
1. In **User Settings** (from Step 2B), click **API Keys** on the left menu.
2. Click **Add API Key**.
3. Select **Generate API Key Pair** and click **Download Private Key**. 
   - Move this file to your `~/.ssh/` folder.
4. Click **Add**.
5. Copy the **Configuration File Preview**. It contains your **Fingerprint**.

---

## 🖼️ 4. Finding the Ubuntu ARM Image OCID
Oracle images are region-specific. 
1. Go to **Compute** -> **Instances** -> **Create Instance**.
2. Under **Image and shape**, click **Edit**.
3. Click **Change Image**.
4. Select **Canonical Ubuntu 22.04**.
5. Ensure **Shape** is `VM.Standard.A1.Flex`.
6. Look for **Image OCID** at the bottom of the selection (or use the search bar for "Images").

---

## 🍱 5. Storing Secrets in GitHub
Once you have everything, go to your GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions** and add:

| Secret Name | Source |
| :--- | :--- |
| `OCI_USER` | Usually `ubuntu` |
| `SSH_PRIVATE_KEY` | Content of your local `id_rsa_oci` |
| `OCI_SERVER_IP` | (Wait until Terraform creates the server!) |

> [!IMPORTANT]
> **DevOps Tip**: Never commit these values to your code. Always use GitHub Secrets or the `variables.tf` file (with a local `terraform.tfvars` that is git-ignored).
