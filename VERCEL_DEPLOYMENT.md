# GitHub → Vercel deployment

This project sends completed anonymous survey responses through a server-only
Vercel endpoint to the deployed Google Apps Script. The Apps Script then writes
one response per row to Google Sheets.

## 1. Upload to GitHub

1. Extract the supplied ZIP.
2. Create a new **private** GitHub repository named `mental-health-survey`.
3. Upload the **contents** of the extracted folder. `package.json` must be at
   the repository root.

Do not upload `.env`, `.env.local`, `.vercel`, or `node_modules`. The supplied
`.gitignore` already excludes them.

## 2. Import into Vercel

1. Open <https://vercel.com/new>.
2. Select the `mental-health-survey` GitHub repository.
3. Choose the `bijit03s-projects` scope.
4. Keep the root directory as `./`.
5. If Vercel asks for a framework, select **Next.js**.
6. Leave the build command at its detected default (`npm run build`).

## 3. Provision the backend secret

On your Windows computer, open PowerShell inside the extracted project folder
and run:

```powershell
.\setup-backend.ps1
```

The script creates a secure random secret, provisions the Apps Script, and
prints the two values needed by Vercel. Do not put the printed secret in GitHub.

If Windows blocks the script, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-backend.ps1
```

## 4. Add the secure environment variables

In **Vercel → Project → Settings → Environment Variables**, add both variables
for Production, Preview, and Development:

| Name | Value |
| --- | --- |
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbzDC-9cPiqoXtuCxsMTce1yZyUxrxy1Z3EAFyfPpbXY1NIxn8FEMYGxEqLEL_1rs_Tk_A/exec` |
| `GOOGLE_APPS_SCRIPT_SECRET` | The same long secret provisioned in Apps Script |

Never add the secret to GitHub or to browser-side code.

## 5. Deploy and test

1. Click **Deploy**.
2. Open the Vercel production URL.
3. Complete one controlled test response.
4. Open the `Responses` tab in the Google Sheet and confirm one new row appears.

If submission fails, check that the Apps Script deployment is set to **Execute
as: Me** and **Who has access: Anyone**, and that the secret in Vercel exactly
matches the provisioned Apps Script secret.
