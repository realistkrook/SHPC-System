# Setting up Microsoft Authentication

## Is it Free?
**Yes.**
- **Azure Active Directory (Entra ID)**: The free tier is sufficient for this project. Since you are a school (Aotea College), you likely already have an educational tenant which is free for students and staff.
- **Supabase**: The free tier includes up to 50,000 Monthly Active Users (MAU).

## Step 1: Azure Portal Setup
1. Go to the [Azure Portal](https://portal.azure.com/) and log in with your school admin account.
2. Search 
for **"Microsoft Entra ID"** (formerly Azure Active Directory).
3. Click **"App registrations"** in the left sidebar.
4. Click **"+ New registration"**.
   - **Name**: `Aotea House Points`
   - **Supported account types**: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"**.
     - *This allows the sign-in flow to work from your personal Azure account, but the App itself will BLOCK anyone who doesn't have an `@aotea.school.nz` email.*
   - **Redirect URI**: Select **Web** and enter your Supabase Callback URL:
     - You can find this in Supabase Dashboard -> Authentication -> Providers -> Microsoft -> **Callback URL**.
     - It usually looks like: `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. Click **Register**.

## Step 2: Get Credentials
Once registered, you will see the **Overview** page.
1. Copy the **Application (client) ID**. You will need this for Supabase.
2. Click **"Certificates & secrets"** in the left sidebar.
3. Click **"+ New client secret"**.
4. Add a description (e.g., "Supabase Auth") and set expiry (e.g., 24 months).
5. **CRITICAL**: Copy the **Value** column immediately.
   - *Note: Do NOT copy the "Secret ID". You need the "Value". It will be hidden after you leave the page.*

## Step 3: Supabase Setup
1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** -> **Providers**.
3. Click **Microsoft**.
4. Toggle **Enable Microsoft**.
5. Enter the **Application (client) ID** from Step 2.1.
6. Enter the **Client Secret Value** from Step 2.5.
7. **Azure Tenant URL**:
   - Since you selected **Multitenant** ("Accounts in any organizational directory"), enter:
     `https://login.microsoftonline.com/common`
   - *If that doesn't work, try leaving it blank.*
8. Click **Save**.

## Step 4: API Permissions (Crucial for "Error getting user email")
If you see `Error getting user email`, do this:
1. Go back to your App Registration in Azure.
2. Click **"API permissions"** in the left sidebar.
3. Click **"+ Add a permission"** -> **Microsoft Graph** -> **Delegated permissions**.
4. Search for and check:
   - `email`
   - `openid`
   - `profile`
   - `User.Read` (usually enabled by default)
5. Click **Add permissions**.
6. **IMPORTANT**: If you see a button **"Grant admin consent for..."**, click it and say Yes. (This might be greyed out if you are not an admin, but for personal accounts it should work).

## Step 5: Token Configuration (Optional but Recommended)
1. Click **"Token configuration"** in the left sidebar.
2. Click **"+ Add optional claim"**.
3. Select **ID**, then check **email**.
4. Click **Add**.

## Step 6: Testing
1. Go to your app's login page.
2. Click "Sign in with Microsoft".
3. It should redirect you to the Microsoft login page and then back to your app.

## Troubleshooting
- **"Admin approval needed"**: If you see this, your school's IT admin needs to grant consent for the app. You might need to ask them to "Grant admin consent for Aotea College" in the API Permissions tab in Azure.
