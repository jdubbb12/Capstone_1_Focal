import type { Pool, PoolClient } from 'pg';
// All callers receive explicitly allowlisted fields; never SELECT users.*.
export const SELF_COLUMNS = 'user_id, email, username, first_name, last_name, creative_role, bio, created_at, updated_at';
export async function getSelf(db: Pool | PoolClient, userId: number) {
  const result = await db.query(`SELECT ${SELF_COLUMNS},
    COALESCE((SELECT json_agg(i ORDER BY i.name) FROM
      (SELECT interests.interest_id, interests.name FROM interests
       JOIN user_interests USING (interest_id) WHERE user_interests.user_id = users.user_id) i), '[]'::json) AS interests
    FROM users WHERE user_id = $1`, [userId]);
  return result.rows[0];
}
