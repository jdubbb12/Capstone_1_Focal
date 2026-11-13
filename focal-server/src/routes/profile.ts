
import { Router } from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { database } from './auth.js';

const router = Router();

// Retrieve the logged-in user's profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        error: 'Server authentication is not configured.'
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.userID !== 'number'
    ) {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }

    const userId = decoded.userID;

    const result = await database.query(
      `SELECT
        u.user_id,
        u.username,
        u.email,
        p.display_name,
        p.bio,
        p.creator_type,
        p.profile_picture
       FROM user_login u
       LEFT JOIN user_profile p
       ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid or expired token.'
      });
    }

    console.error('Profile retrieval error:', error);

    return res.status(500).json({
      error: 'Could not retrieve profile.'
    });
  }
});



router.put('/', async (req: Request, res: Response) => {
  // Get the user's authentication token
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: 'Server authentication is not configured.'
    });
  }

  let userId: number;

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.userID !== 'number'
    ) {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }

    userId = decoded.userID;
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }

  const {
    displayName,
    username,
    bio,
    creatorType
  } = req.body ?? {};

  // Validate the submitted information
  if (
    typeof displayName !== 'string' ||
    typeof username !== 'string' ||
    typeof bio !== 'string' ||
    typeof creatorType !== 'string' ||
    !username.trim() ||
    username.length > 50 ||
    displayName.length > 100 ||
    bio.length > 500 ||
    creatorType.length > 100
  ) {
    return res.status(400).json({
      error: 'Invalid profile information.'
    });
  }

  const client = await database.connect();

  try {
    await client.query('BEGIN');

    // Update username in user_login
    const userResult = await client.query(
      `UPDATE user_login
       SET username = $1
       WHERE user_id = $2
       RETURNING user_id, username, email`,
      [username.trim(), userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        error: 'User not found.'
      });
    }

    // Update profile information in user_profile
    const profileResult = await client.query(
      `INSERT INTO user_profile
        (user_id, display_name, bio, creator_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         display_name = EXCLUDED.display_name,
         bio = EXCLUDED.bio,
         creator_type = EXCLUDED.creator_type
       RETURNING *`,
      [userId, displayName, bio, creatorType]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: userResult.rows[0],
      profile: profileResult.rows[0]
    });

  } catch (error: any) {
    await client.query('ROLLBACK');

    // PostgreSQL unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'This username is already taken.'
      });
    }

    console.error('Profile update error:', error);

    return res.status(500).json({
      error: 'Could not update profile.'
    });
  } finally {
    client.release();
  }
});


export default router;
