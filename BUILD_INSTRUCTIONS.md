# Hosting Guide: GitHub Pages + Hostinger Domain (viosgrowthacademy.com)

This guide shows how to host the site for FREE on GitHub Pages and point your
domain (from Hostinger) at it. Replace `YOUR-USERNAME` below with your GitHub
username (e.g. `john`, `myname`).

## Part 1 — Get the site live on GitHub Pages

The site already auto-builds thanks to the file `.github/workflows/deploy.yml`.
Every time you upload new files to `main`, GitHub builds the site automatically
(~1-2 minutes) and keeps it live.

### Step 1: Re-upload your latest files
1. Open your repo on github.com → click **Add file** → **Upload files**.
2. From your project folder (`vios-growth-academy`), drag these into the page:
   - the **`src`** folder (whole folder),
   - **`vite.config.ts`**,
   - **`index.html`**.
3. Click **Commit changes** → **Commit directly to the main branch** → **Commit**.

### Step 2: Make sure Pages uses the auto-build
1. In the repo, open **Settings** → **Pages** (left menu).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
   (Not "Deploy from a branch".)
3. After uploads finish, open the **Actions** tab and wait for the run to turn
   green ✓.

### Step 3: Check it works
- Your temporary address is: `https://YOUR-USERNAME.github.io/REPO-NAME/`
- Press **Ctrl+F5** to hard-refresh.
- You should see the site (splash fades out within a second).

## Part 2 — Point your Hostinger domain to GitHub Pages

### Step 1: Tell GitHub about your domain
1. In the repo: **Settings** → **Pages** → **Custom domain**.
2. Type `viosgrowthacademy.com` → click **Save**.
   (Leave the "Enforce HTTPS" box unchecked for now.)

### Step 2: Update DNS at Hostinger
1. Log in to your **Hostinger hPanel**.
2. Go to **Domains** → select `viosgrowthacademy.com` →
   **Advanced** → **DNS Zone Editor** (or **DNS / Nameservers**).
3. **Delete** any existing `A` records that point to the old hosting IP.
4. Add these **A records** (host = `@`, or leave blank):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
5. Add this **CNAME record**:
   - host = `www`, points to `YOUR-USERNAME.github.io`
6. TTL can stay at the default (3600). **Save**.

### Step 3: Wait and enable HTTPS
- DNS takes from a few minutes up to ~1 hour to spread.
- Keep checking GitHub **Settings → Pages**. When the custom domain shows
  "DNS check successful", tick **Enforce HTTPS** and verify it finishes
  (certificate usually appears within a day).
- Your site is then live at `https://viosgrowthacademy.com`.

## Part 3 — Allow login/admin on the new domain (Firebase)

1. Go to the **Firebase console**
   (https://console.firebase.google.com) → open project
   `gen-lang-client-0059730100`.
2. Go to **Authentication** → **Settings** → **Authorized domains**.
3. Click **Add domain** and add BOTH:
   - `YOUR-USERNAME.github.io`
   - `viosgrowthacademy.com`

Without this, the admin login page stops working on the new address.

## Troubleshooting

- **Stuck on the splash screen**: hard-refresh (Ctrl+F5). If it stays, you
  forgot to re-upload `src`, `vite.config.ts`, or `index.html`, or Pages Source
  is not set to "GitHub Actions".
- **"404" errors in the console**: same cause — upload the latest files and
  wait for the green Actions run.
- **Domain says "Site not reached"**: DNS still propagating, or old A records
  from Hostinger were not deleted. Wait up to an hour.
- **Admin page won't open**: add the new domain under Firebase Authorized
  domains (Part 3).