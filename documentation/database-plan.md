# Aotea College House Points

## Database Planning Document

This document is written as planning evidence for the `postgres-app` version of the Aotea College House Points system. It describes the database structure, relationships, data types, and core queries that would be planned before the database is built.

## Purpose of the database

The database needs to support these tasks:
- store the four school houses and their point totals
- store staff accounts with different permission levels
- store point requests submitted by teachers
- store approval decisions made by whānau leaders
- store admin-controlled access rules for staff account creation
- provide published leaderboard data for the public view

The database must allow the same data to be reused in different ways for public viewers, teachers, whānau leaders, and administrators.

## Planned tables

### `profiles`

Purpose:
- store staff identities and login details
- store each user's role in the system

Planned fields:
- `id` - `UUID` - primary key
- `full_name` - `TEXT` - required
- `email` - `TEXT` - unique
- `role` - `user_role` enum - required
- `password_hash` - `TEXT` - used for secure staff login
- `is_active` - `BOOLEAN` - defaults to false until an account is active
- `last_login_at` - `TIMESTAMPTZ` - stores the last successful login time
- `created_at` - `TIMESTAMPTZ` - defaults to current timestamp
- `updated_at` - `TIMESTAMPTZ` - defaults to current timestamp

Why these data types were chosen:
- `UUID` avoids guessable numeric IDs and works well for user records
- `TEXT` suits names, emails, and password hashes because lengths may vary
- enum values reduce invalid role entries
- `BOOLEAN` is efficient for active/inactive status
- `TIMESTAMPTZ` keeps date and time with timezone for accurate auditing

### `houses`

Purpose:
- store the four school houses and their point totals
- separate internal live totals from publicly published totals

Planned fields:
- `id` - `TEXT` - primary key
- `name` - `TEXT` - required
- `points` - `INTEGER` - current internal total
- `published_points` - `INTEGER` - public total
- `published_at` - `TIMESTAMPTZ` - when the public score was last updated
- `created_at` - `TIMESTAMPTZ`
- `updated_at` - `TIMESTAMPTZ`

Why these data types were chosen:
- `TEXT` is suitable for short house codes such as `kahu` or `mana`
- `INTEGER` is the correct type for point totals because decimals are not needed
- `TIMESTAMPTZ` records when publishing happens

### `point_requests`

Purpose:
- store teacher-submitted requests for house points
- store the approval workflow and review history

Planned fields:
- `id` - `UUID` - primary key
- `house_id` - `TEXT` - foreign key to `houses.id`
- `teacher_id` - `UUID` - foreign key to `profiles.id`
- `points` - `INTEGER` - requested points
- `reason` - `TEXT` - explanation for the request
- `status` - `point_request_status` enum - defaults to `pending`
- `submitted_at` - `TIMESTAMPTZ`
- `reviewed_by` - `UUID` - foreign key to `profiles.id`
- `reviewed_at` - `TIMESTAMPTZ`

Why these data types were chosen:
- `UUID` works well for unique request records
- foreign keys keep the request linked to the correct house and staff records
- `INTEGER` is suitable for the number of points requested
- enum values reduce invalid workflow states
- `TIMESTAMPTZ` supports an auditable workflow

### `allowed_emails`

Purpose:
- store the approved email addresses or domains that admins may use when creating staff accounts

Planned fields:
- `email` - `TEXT` - primary key
- `role` - `TEXT` - default role to assign
- `note` - `TEXT` - optional explanation
- `created_at` - `TIMESTAMPTZ`

Why these data types were chosen:
- `TEXT` allows either a full email address or a domain such as `@aotea.school.nz`
- `TIMESTAMPTZ` records when the rule was created

## Planned relationships

### One-to-many relationships

- One house can have many point requests.
  - `houses.id` -> `point_requests.house_id`

- One teacher profile can submit many point requests.
  - `profiles.id` -> `point_requests.teacher_id`

- One whānau leader or admin profile can review many point requests.
  - `profiles.id` -> `point_requests.reviewed_by`

### Support table relationship

- `allowed_emails` is not directly joined to `point_requests`.
- It supports account creation by checking whether an email or domain is approved before a staff account is inserted into `profiles`.

### Relationship map

- `profiles` -> `point_requests` through `teacher_id`
- `profiles` -> `point_requests` through `reviewed_by`
- `houses` -> `point_requests` through `house_id`
- `allowed_emails` -> `profiles` through account-creation validation logic

This means `point_requests` is the main linking table in the design. It connects the staff side of the system to the house totals and the approval workflow.

## Planned integrity rules

- `profiles.id` should be the primary key.
- `profiles.email` should be unique so duplicate accounts cannot be created.
- `profiles.role` should use an enum so only valid roles are stored.
- `houses.id` should be the primary key.
- `point_requests.house_id` must reference a valid house.
- `point_requests.teacher_id` must reference a valid profile.
- `point_requests.reviewed_by` must reference a valid profile when a request is reviewed.
- `point_requests.status` should use an enum with only `pending`, `approved`, and `rejected`.
- timestamp fields should default to the current time where appropriate.
- indexes should be added to fields commonly searched in queries such as:
  - `profiles.email`
  - `point_requests.house_id`
  - `point_requests.teacher_id`
  - `point_requests.status`

## Planned queries

### 1. Public leaderboard query

Purpose:
- display published house scores in ranked order

Planned query:

```sql
SELECT id, name, published_points, published_at
FROM houses
ORDER BY published_points DESC, name ASC;
```

### 2. Teacher submits a point request

Purpose:
- insert a new pending request linked to the selected house and logged-in teacher

Planned query:

```sql
INSERT INTO point_requests (house_id, teacher_id, points, reason, status)
VALUES ($1, $2, $3, $4, 'pending');
```

### 3. Teacher views their own request history

Purpose:
- show the teacher's previous requests with house names and current statuses

Planned query:

```sql
SELECT
  pr.id,
  h.name AS house_name,
  pr.points,
  pr.reason,
  pr.status,
  pr.submitted_at,
  pr.reviewed_at
FROM point_requests pr
JOIN houses h ON h.id = pr.house_id
WHERE pr.teacher_id = $1
ORDER BY pr.submitted_at DESC;
```

### 4. Whānau leader views pending requests

Purpose:
- show all requests waiting for review, including the teacher who submitted them

Planned query:

```sql
SELECT
  pr.id,
  h.name AS house_name,
  p.full_name AS teacher_name,
  pr.points,
  pr.reason,
  pr.submitted_at
FROM point_requests pr
JOIN houses h ON h.id = pr.house_id
LEFT JOIN profiles p ON p.id = pr.teacher_id
WHERE pr.status = 'pending'
ORDER BY pr.submitted_at ASC;
```

### 5. Approve a point request

Purpose:
- update the request status and increase the selected house's live score
- both actions should happen together inside a transaction

Planned logic:

```sql
BEGIN;

UPDATE point_requests
SET status = 'approved',
    reviewed_by = $1,
    reviewed_at = NOW()
WHERE id = $2;

UPDATE houses
SET points = points + $3
WHERE id = $4;

COMMIT;
```

### 6. Reject a point request

Purpose:
- record that the request was reviewed but do not change house points

Planned query:

```sql
UPDATE point_requests
SET status = 'rejected',
    reviewed_by = $1,
    reviewed_at = NOW()
WHERE id = $2;
```

### 7. Admin creates a staff account

Purpose:
- insert a new staff member with a role and password hash

Planned query:

```sql
INSERT INTO profiles (full_name, email, role, password_hash, is_active)
VALUES ($1, $2, $3, $4, TRUE);
```

### 8. Admin checks whether an email is allowed

Purpose:
- confirm the address or domain is approved before creating an account

Planned query:

```sql
SELECT email, role, note
FROM allowed_emails
WHERE email = $1 OR email = $2;
```

### 9. Publish live scores to the public leaderboard

Purpose:
- copy current internal totals into the published fields

Planned query:

```sql
UPDATE houses
SET published_points = points,
    published_at = NOW();
```

## Planned user roles

- `teacher`
  - can create point requests
  - can view their own requests

- `whanau_leader`
  - can view pending requests
  - can approve or reject requests

- `admin`
  - can manage staff accounts
  - can manage allowed emails
  - can edit house scores
  - can publish scores

- `student`
  - can exist in the data model if needed later
  - does not need staff dashboard access

## Planned design decisions

### Why a separate `point_requests` table is needed

It would be simpler to let teachers edit house points directly, but that would remove approval control and audit history. A separate request table allows:
- workflow states
- accountability
- timestamps
- approval history
- joined reporting later

### Why `published_points` is separate from `points`

This allows the public leaderboard to stay stable until an admin decides to publish changes. That is better for a school context because the internal working total and the public display do not always need to match immediately.

### Why enums are useful

Enums prevent invalid values such as a misspelled role or status being inserted. This improves consistency and reduces errors in forms and queries.

## Planned evidence of complexity

This database plan supports Excellence-level complexity because it includes:
- more than two related tables
- primary keys and foreign keys
- different data types chosen for purpose
- role-based access requirements
- dynamic data retrieval for the frontend
- workflow-based insert, select, and update queries
- transaction planning for approvals
- constraints and indexes for integrity and efficiency

## Conclusion

The planned database is relational, purposeful, and structured around the real workflow of the house points system. The relationships centre on `point_requests`, which links staff actions to house totals. The planned queries show how the database would support both public display and staff-only workflows before any coding begins.
