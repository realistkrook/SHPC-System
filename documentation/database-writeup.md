# Aotea College House Points

## Final Database Outcome Write-Up

This write-up describes the submitted `postgres-app` version of the Aotea College House Points system for AS91902.

## Purpose and end users

The purpose of the outcome is to manage Aotea College house points through a database-backed web application that supports four different user contexts:
- public viewers who need an accurate published leaderboard
- teachers who submit point requests
- whānau leaders who approve or reject requests
- administrators who manage accounts, publish results, add manual event points, and export media assets

The system uses:
- PostgreSQL for data storage
- Express for server-side logic
- React for the client interface

This structure was chosen because it allows the data to be stored centrally, queried dynamically, validated on the server, and presented differently depending on the user role.

## Database structure

The database is organised into multiple related tables.

### `profiles`
- stores staff and student records
- fields include:
  - `id`
  - `full_name`
  - `email`
  - `role`
  - `password_hash`
  - `is_active`
  - `last_login_at`
  - timestamps

This table supports both identity and role-based access control for staff users.

### `houses`
- stores each house and its live and published point totals
- fields include:
  - `id`
  - `name`
  - `points`
  - `published_points`
  - `published_at`
  - timestamps

This separates editing from publishing so administrators can prepare updates before making them public.

### `point_requests`
- stores teacher submissions and approval outcomes
- fields include:
  - `id`
  - `house_id`
  - `teacher_id`
  - `points`
  - `reason`
  - `status`
  - `reviewed_by`
  - `reviewed_at`
  - `submitted_at`

This table provides a full workflow rather than directly editing scores from the teacher side.

### `allowed_emails`
- stores approved addresses or domains for staff account creation
- fields include:
  - `email`
  - `role`
  - `note`
  - `created_at`

This supports administrative control over who may be issued a staff account.

## Complex techniques used

The outcome uses several complex database techniques expected by AS91902.

### Multiple related tables
- The design uses more than two tables with relationships between them.
- `point_requests` links staff and houses through foreign keys.

### Insert, update, and select queries for real workflows
- `SELECT` queries return public leaderboard data, staff records, and joined request information.
- `INSERT` queries create point requests, staff accounts, and allowed-email rules.
- `UPDATE` queries handle role changes, password resets, house point changes, publishing, and request approvals.

### Server-side dynamic linking to the frontend
- The React frontend does not store the house data permanently in the page.
- Instead, it requests live data from the Express API, which queries PostgreSQL and returns current records.
- This means data is presented dynamically for the purpose and end users.

### Transactions for data integrity
- Approving a request uses a transaction so the status update and house point increase happen together.
- Manual event points also use a transaction so the score change and request log entry stay consistent.

### Access permissions
- The submitted app now includes real authenticated staff access.
- Session-based login is linked to staff records in the database.
- Server-side role checks ensure different actions are available to teachers, whānau leaders, and admins only where appropriate.

This is a major improvement from the earlier demo-mode approach and is important for a refined database outcome.

## Efficient tools and techniques

The project uses efficient production techniques throughout.

### Shared middleware and shared client service
- The backend uses reusable authentication and role middleware rather than rewriting permission logic in each route.
- The frontend uses one API service layer for requests.

This improves maintainability and reduces repeated code.

### Hashed passwords and sessions
- Passwords are stored as hashes rather than plain text.
- Staff login uses server-side sessions with HTTP-only cookies.

This is more secure and better suited to the assessment requirement for authenticated access.

### Indexed and constrained schema
- enum types restrict roles and request statuses
- foreign keys preserve relational integrity
- unique email values prevent duplicate accounts
- indexes improve common lookups
- update triggers automatically maintain timestamps

### Published leaderboard workflow
- The app stores live points separately from published points.
- This is efficient for the school context because staff can manage internal changes while the public sees only approved published totals.

## How data is presented effectively

The same database supports several tailored views.

### Public view
- The public leaderboard shows published points in ranked order.
- This keeps the main output simple and appropriate for students and visitors.

### Teacher view
- Teachers submit point requests through a form.
- They can review their own request history and status outcomes.

### Whānau leader view
- Whānau leaders see pending requests and can approve or reject them.

### Admin view
- Admins manage staff accounts, allowed-email rules, house scores, manual event points, publishing, and export outputs.

This shows the data is not only stored properly but also presented effectively for different purposes and users.

## Iterative improvement

The project was improved over time rather than completed in one step.

Important stages include:
- initial house-points workflow and leaderboard features
- media export improvements
- public publishing workflow
- separation into `supabase-app` and `postgres-app`
- replacement of demo-style profile selection with real staff login
- replacement of frontend-only protection with server-side authorisation
- addition of staff account administration and password management
- addition of server integration tests

This demonstrates iterative improvement throughout design, development, and testing.

## Relevant implications

### Privacy
- Staff identities and emails are stored in the system.
- Because this is personal information, only authorised users should be able to access staff-only pages and actions.
- The final submitted app addresses this with real login and server-side role checks.

### Security
- Passwords are stored as hashes rather than plain text.
- Sessions are managed on the server and exposed to the browser through HTTP-only cookies.
- The API no longer trusts teacher/reviewer IDs sent by the client for protected workflows.

### Accessibility and usability
- The app keeps public viewing simple and gives each staff role only the controls they need.
- Forms use labels, structured layouts, and clear feedback messaging.
- Role-specific pages reduce clutter for end users.

### Legal and ethical considerations
- Access to school data should be limited to authorised staff.
- The app now reflects that expectation in the submitted implementation.
- Visual/media assets used in the project should still be credited appropriately in the final evidence pack.

### Future proofing
- The system is modular:
  - schema
  - auth middleware
  - API routes
  - reusable React components
- This makes it easier to extend later with reporting, password rotation rules, or deeper audit features.

## Final judgement

The submitted `postgres-app` now provides a refined database outcome because it combines:
- logical relational structure
- dynamic querying and updates
- data integrity protections
- efficient implementation techniques
- effective end-user presentation
- real authenticated staff access and permissions
- evidence of iterative refinement and testing

That makes it a much stronger AS91902 submission than the earlier demo-style version.
