# Aotea College House Points

## Testing and Verification Record

This document records the current evidence for the submitted `postgres-app` outcome.

## Summary

The final refinement pass added:
- real staff authentication
- server-side role enforcement
- admin-managed staff accounts
- password reset capability
- protected request workflows
- automated integration tests for the most important security and database behaviours

## Automated verification completed

### 1. Backend integration tests

Command run:

```bash
cd server
TEST_DATABASE_URL='postgresql://connor@localhost:5432/house_points_test' npm test
```

Result:
- 4 tests passed
- 0 failed

Verified behaviours:
- staff login returns a valid session cookie and current user
- teachers are blocked from admin-only routes
- teacher submissions use the authenticated session user rather than trusting a spoofed client `teacher_id`
- whānau leader approval records the correct reviewer and increments house points correctly

Why this matters:
- These checks verify the most important Excellence-level changes in the submitted version.

### 2. Client production build

Command run:

```bash
cd client
npm run build
```

Result:
- build completed successfully

Why this matters:
- This confirms the client compiles cleanly after the auth and admin-management refactor.

### 3. Server syntax checks

Syntax checks were also run on the key server files involved in the auth refactor.

Result:
- no syntax errors detected

## Functional evidence by feature

### Public leaderboard

Evidence:
- public route remains available without staff login
- data is fetched dynamically from PostgreSQL
- published scores remain separate from internal live scores

Assessment value:
- data is presented effectively for the public audience

### Staff login

Evidence:
- email + password login implemented
- hashed passwords stored in database
- session cookie created on successful login
- inactive accounts cannot log in

Assessment value:
- meets authenticated logon requirement for authorised users

### Teacher workflow

Evidence:
- teachers can submit point requests through the frontend
- server now derives request ownership from the session user

Assessment value:
- prevents fake submissions on behalf of another staff member

### Whānau leader workflow

Evidence:
- leaders can approve or reject pending requests
- approval updates both request state and house points
- reviewer identity is recorded

Assessment value:
- demonstrates logical query/update behaviour and transaction-based integrity

### Admin workflow

Evidence:
- admins can create staff accounts
- admins can change role, active status, and password
- admins can publish scores
- admins can add manual event points
- admins can manage allowed email rules
- admins can reset project data

Assessment value:
- demonstrates role-based access and efficient database-backed administration

## Test accounts available in seeded data

These are useful for local demonstration and teacher marking if needed.

| Account | Role | Email | Password |
| --- | --- | --- | --- |
| Sarah Thompson | Admin | `sarah.thompson@aotea.school.nz` | `AdminPass!23` |
| James Mitchell | Whanau leader | `james.mitchell@aotea.school.nz` | `LeaderPass!23` |
| Emily Chen | Teacher | `emily.chen@aotea.school.nz` | `TeacherPass!23` |

Note:
- Michael Roberts is seeded as an inactive teacher account without a password so the account-activation workflow can also be demonstrated.

## Testing coverage against the assessment schedule

### Strongly evidenced
- authenticated logon for authorised users
- permissions/access restriction by role
- select/insert/update database behaviour
- dynamic frontend/database linking
- iterative improvement
- use of testing to validate changes

### Partially evidenced in automation and ready for manual capture
- final visual checks of the UI
- browser compatibility checks
- usability observations
- proofread/content checks

These are lower risk now because the critical functional and security behaviours have already been verified, but screenshots or brief teacher-facing notes would still strengthen the final submission folder.

## Suggested manual checks for final submission evidence

1. Public leaderboard loads correctly while logged out.
2. Teacher login works and teacher can submit a request.
3. Whānau leader login works and leader can approve a request.
4. Admin login works and admin can create a new staff account.
5. Admin can publish live points to the public leaderboard.
6. TV and Instagram export images generate correctly.
7. Quick check in at least two browsers if available on the school machine.

## Final assessment note

The most serious earlier testing risks were around authentication, permissions, and whether the Postgres version could prove it was more than a demo. Those risks are now substantially reduced because the submitted app has automated evidence for the key security and database workflows, plus a clean production build on the client.
