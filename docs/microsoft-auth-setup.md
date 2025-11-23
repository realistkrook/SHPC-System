# Setting up Microsoft Authentication

## Is it Free?
**Yes.**
- **Azure Active Directory (Entra ID)**: The free tier is sufficient for this project. Since you are a school (Aotea College), you likely already have an educational tenant which is free for students and staff.
- **Supabase**: The free tier includes up to 50,000 Monthly Active Users (MAU).

## Step 1: Azure Portal Setup
1. Go to the [Azure Portal](https://portal.azure.com/) and log in with your school admin account.
2. Search for **"Microsoft Entra ID"** (formerly Azure Active Directory).
3. Click **"App registrations"** in the left sidebar.
4. Click **"+ New registration"**.
   - **Name**: `Aotea House Points`
   - **Supported account types**: "Accounts in this organizational directory only (Aotea College only - Single tenant)" - *Choose this to restrict it to your school.*
   - **Redirect URI**: Select **Web** and enter your Supabase Callback URL:
     - You can find this in Supabase Dashboard -> Authentication -> Providers -> Microsoft -> **Callback URL**.
     - It usually looks like: `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. Click **Register**.

## Step 2: Get Credentials
Once registered, you will see the **Overview** page.
1. Copy the **Application (client) ID**. You will need this.
2. Click **"Certificates & secrets"** in the left sidebar.
3. Click **"+ New client secret"**.
4. Add a description (e.g., "Supabase Auth") and set expiry (e.g., 24 months).
5. **IMPORTANT**: Copy the **Value** (not the Secret ID) immediately. You won't see it again.

## Step 3: Supabase Setup
1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** -> **Providers**.
3. Click **Microsoft**.
4. Toggle **Enable Microsoft**.
5. Enter the **Application (client) ID** from Step 2.1.
6. Enter the **Client Secret Value** from Step 2.5.
7. Under **Tenant URL** or **Tenant ID**, you might need your **Directory (tenant) ID** from the Azure Overview page if you selected "Single Tenant".
8. Click **Save**.

## Step 4: Testing
1. Go to your app's login page.
2. Click "Sign in with Microsoft".
3. It should redirect you to the Microsoft login page and then back to your app.

## Troubleshooting
- **"Admin approval needed"**: If you see this, your school's IT admin needs to grant consent for the app. You might need to ask them to "Grant admin consent for Aotea College" in the API Permissions tab in Azure.
