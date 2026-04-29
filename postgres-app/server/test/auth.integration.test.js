const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://connor@localhost:5432/house_points_test';
const projectRoot = path.resolve(__dirname, '..', '..');
const schemaPath = path.join(projectRoot, 'db', 'schema.sql');
const seedPath = path.join(projectRoot, 'db', 'seed.sql');

async function resetDatabase() {
  const pool = new Pool({ connectionString: TEST_DATABASE_URL });
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const seedSql = await fs.readFile(seedPath, 'utf8');

  try {
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query(schemaSql);
    await pool.query(seedSql);
  } finally {
    await pool.end();
  }
}

async function startServer() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.SESSION_SECRET = 'test-session-secret';

  const { createApp } = require('../app');
  const app = createApp();
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

async function login(baseUrl, email, password) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => ({}));
  return { response, json };
}

test('staff login issues a session cookie and returns the current user', async () => {
  await resetDatabase();
  const server = await startServer();

  try {
    const loginResponse = await login(server.baseUrl, 'sarah.thompson@aotea.school.nz', 'AdminPass!23');
    assert.equal(loginResponse.status, 200);

    const cookie = loginResponse.headers.get('set-cookie');
    assert.match(cookie || '', /shpc_session=/);

    const { response, json } = await fetchJson(`${server.baseUrl}/api/auth/me`, {
      headers: { Cookie: cookie },
    });

    assert.equal(response.status, 200);
    assert.equal(json.profile.email, 'sarah.thompson@aotea.school.nz');
    assert.equal(json.profile.role, 'admin');
  } finally {
    await server.close();
  }
});

test('teachers are blocked from admin-only account routes', async () => {
  await resetDatabase();
  const server = await startServer();

  try {
    const loginResponse = await login(server.baseUrl, 'emily.chen@aotea.school.nz', 'TeacherPass!23');
    const cookie = loginResponse.headers.get('set-cookie');

    const { response } = await fetchJson(`${server.baseUrl}/api/admin/accounts`, {
      headers: { Cookie: cookie },
    });

    assert.equal(response.status, 403);
  } finally {
    await server.close();
  }
});

test('teacher submissions use the authenticated account instead of trusting teacher_id from the client', async () => {
  await resetDatabase();
  const server = await startServer();
  const pool = new Pool({ connectionString: TEST_DATABASE_URL });

  try {
    const loginResponse = await login(server.baseUrl, 'emily.chen@aotea.school.nz', 'TeacherPass!23');
    const cookie = loginResponse.headers.get('set-cookie');

    const { response, json } = await fetchJson(`${server.baseUrl}/api/point-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        house_id: 'kereru',
        points: 11,
        reason: 'Assessment test submission',
        teacher_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(json.teacher_id, 'c3d4e5f6-a7b8-9012-cdef-123456789012');

    const requestResult = await pool.query(
      `SELECT teacher_id
       FROM point_requests
       WHERE reason = 'Assessment test submission'
       ORDER BY submitted_at DESC
       LIMIT 1`
    );

    assert.equal(requestResult.rows[0].teacher_id, 'c3d4e5f6-a7b8-9012-cdef-123456789012');
  } finally {
    await pool.end();
    await server.close();
  }
});

test('leader approval records reviewer identity and increments house points', async () => {
  await resetDatabase();
  const server = await startServer();
  const pool = new Pool({ connectionString: TEST_DATABASE_URL });

  try {
    const teacherLogin = await login(server.baseUrl, 'emily.chen@aotea.school.nz', 'TeacherPass!23');
    const teacherCookie = teacherLogin.headers.get('set-cookie');

    const submission = await fetchJson(`${server.baseUrl}/api/point-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: teacherCookie,
      },
      body: JSON.stringify({
        house_id: 'kotuku',
        points: 7,
        reason: 'Approval flow verification',
      }),
    });

    assert.equal(submission.response.status, 201);

    const leaderLogin = await login(server.baseUrl, 'james.mitchell@aotea.school.nz', 'LeaderPass!23');
    const leaderCookie = leaderLogin.headers.get('set-cookie');

    const approval = await fetchJson(`${server.baseUrl}/api/point-requests/${submission.json.id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: leaderCookie,
      },
    });

    assert.equal(approval.response.status, 200);

    const requestResult = await pool.query(
      'SELECT status, reviewed_by FROM point_requests WHERE id = $1',
      [submission.json.id]
    );
    const houseResult = await pool.query(
      'SELECT points FROM houses WHERE id = $1',
      ['kotuku']
    );

    assert.equal(requestResult.rows[0].status, 'approved');
    assert.equal(requestResult.rows[0].reviewed_by, 'b2c3d4e5-f6a7-8901-bcde-f12345678901');
    assert.equal(houseResult.rows[0].points, 117);
  } finally {
    await pool.end();
    await server.close();
  }
});
