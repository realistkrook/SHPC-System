# Aotea College House Points

## Updated Excellence Analysis for `postgres-app`

Assessment basis:
- `2026 DTS300 Course Outline.docx`
- `Assessment Schedule Student Copy.docx`
- submitted outcome: `postgres-app`

## Overall judgement

The main Excellence blockers identified in the earlier review have now been addressed in the `postgres-app` submission.

The submitted app now demonstrates:
- a refined relational database structure
- real authenticated logon for authorised staff users
- server-side role enforcement
- dynamic database-driven pages for different end users
- iterative improvement from the earlier demo-mode version
- documented testing and verification evidence

## Excellence criteria now met

### 1. Real authenticated logon for authorised users

The old profile-picker login has been replaced with real staff login using:
- school email
- hashed passwords
- server-side session cookies
- active/inactive account control

Why this matters:
- The assessment schedule expects authenticated logon for authorised users.
- This requirement is now met by the submitted Postgres version.

Implemented features:
- login endpoint in `server/routes/auth.js`
- hashed password utility in `server/auth/passwords.js`
- session handling in `server/auth/sessions.js`
- session-based auth context in the React client

### 2. Server-side permissions instead of frontend-only protection

The app no longer relies on React route hiding as the only access control.

Now implemented:
- teacher/leader/admin access is checked on the Express server
- admin-only endpoints are protected on the server
- leader approval routes are protected on the server
- teacher submissions derive the acting user from the authenticated session rather than trusting a client-supplied ID

Why this matters:
- This directly satisfies the assessment expectation for meaningful permissions and access control.

### 3. Efficient tools and techniques in production

The app now uses efficient techniques that support an Excellence judgement:
- reusable REST service layer in the client
- reusable auth middleware in the server
- server-side session management
- reusable role guards
- relational design with enums, indexes, foreign keys, and triggers
- transactions for approval and manual points workflows
- shared export templates for TV and Instagram outputs

These are not just extra features. They improve correctness, reusability, and maintainability.

### 4. Data presented effectively for the purpose and end users

The outcome now serves multiple user groups clearly:
- public viewers see published leaderboard data only
- teachers submit requests and review their own submissions
- whānau leaders approve or reject requests
- admins manage staff accounts, permissions, publishing, manual event points, and exports

The public/staff split is now clearer and more credible because staff actions are backed by real authentication.

### 5. Iterative improvement throughout design, development, and testing

The project now shows iteration in both Git history and implementation quality:
- original Supabase-backed version
- refactor into separate `supabase-app` and `postgres-app`
- earlier demo-style Postgres login
- later refinement into real auth, server permissions, and admin-managed accounts

This gives stronger evidence of iterative improvement than the earlier version, which looked more like a proof of concept.

### 6. Testing evidence is now stronger

Automated evidence completed in this refinement pass:
- server integration tests covering:
  - login success
  - admin-route denial for teachers
  - session-derived request ownership
  - leader approval updating both reviewer identity and house points
- client production build passes

This gives concrete testing evidence rather than only descriptive claims.

## Areas that are now strong for Excellence

### Refined database design
- multiple related tables
- logical structure
- data integrity constraints
- indexes
- update triggers

### Secure enough assessment-grade staff access control
- hashed passwords
- admin-managed account creation
- active/inactive accounts
- role-based authorisation
- public/student view separated from staff-only actions

### Efficient implementation choices
- shared auth middleware
- shared API service
- reusable components
- transaction-based updates

### End-user presentation
- distinct workflows for public viewers, teachers, leaders, and admins
- published leaderboard workflow
- export assets for communication channels

## Remaining low-risk notes

These are not major Excellence blockers, but they are still worth acknowledging in the final submission:
- it is still wise to capture screenshots of key flows for the final evidence pack
- a brief two-browser manual check record would strengthen submission evidence further
- the in-memory session store is appropriate for local assessment use, but not intended as a large-scale production deployment design

## Final conclusion

Based on the current `postgres-app` implementation, the earlier critical gaps have been resolved. The submitted version now has a much stronger case for Excellence because it combines:
- complex relational database techniques
- refined and logical data handling
- effective presentation for end users
- real authentication and permissions
- iterative improvement
- explicit testing evidence
