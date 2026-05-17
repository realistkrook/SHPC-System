# Korimako Display Name Design

## Goal
Use `Korimako` as the single user-facing spelling across the repository, including the TV export and Instagram export.

## Current State
The Postgres React client already displays `Korimako`, but the Supabase React client normalizes the `korimako` house id to `Kōrimako`. The export templates render `house.name`, so the Supabase normalization layer leaks the old spelling into exports and other screens.

## Chosen Approach
Make `Korimako` the canonical display value at shared normalization points and in seeded/default content, while keeping existing compatibility handling for legacy incoming `Kōrimako` values where those mappings are already useful.

## Scope
- Update user-facing canonical display values from `Kōrimako` to `Korimako`.
- Update seeded/default data and docs that still present `Kōrimako`.
- Preserve tolerant lookup behavior for legacy input spellings where the code already accepts them.
- Do not add export-specific overrides; exports should inherit the normalized house name naturally.

## Verification
- Add a regression check around canonical house-name normalization if there is a practical test seam in the current repo.
- Build the affected React apps.
- Search the repository to ensure no user-facing canonical output still emits `Kōrimako` unexpectedly.
