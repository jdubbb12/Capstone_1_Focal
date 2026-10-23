-- These queries were generated using ChatGPT to generate sample seed data

BEGIN;

-- 1. USERS (generated user_id values: 1, 2, 3)
INSERT INTO user_login (email, last_login, username)
VALUES
    ('alice@example.com', '2026-10-20', 'alice_art'),
    ('ben@example.com', '2026-10-21', 'ben_draws'),
    ('carla@example.com', '2026-10-19', 'carla_creates');

-- 2. USER PROFILES
INSERT INTO user_profile (user_id, profile_picture, is_visible)
VALUES
    (1, 'https://example.com/profiles/alice.jpg', TRUE),
    (2, 'https://example.com/profiles/ben.jpg', TRUE),
    (3, 'https://example.com/profiles/carla.jpg', TRUE);

-- 3. PASSWORD HASH PLACEHOLDERS
INSERT INTO user_pass_hash (user_id, user_hash)
VALUES
    (1, 'seed_placeholder_hash_001'),
    (2, 'seed_placeholder_hash_002'),
    (3, 'seed_placeholder_hash_003');

-- 4. INTERESTS (generated interest_id values: 1, 2, 3)
INSERT INTO interests (interest_name, description)
VALUES
    ('Digital Art', 'Artwork created using digital tools and software.'),
    ('Painting', 'Traditional painting using different media and techniques.'),
    ('Drawing', 'Illustrations and sketches created by hand.');

-- 5. USER INTERESTS
INSERT INTO user_interests (user_id, interest_id)
VALUES
    (1, 1),
    (1, 3),
    (2, 3),
    (2, 2),
    (3, 2);

-- 6. ARTWORK (generated artwork_id values: 1, 2, 3)
INSERT INTO artwork
    (user_id, artwork_title, artwork_description,
     artwork_link, creation_date, is_visible)
VALUES
    (1, 'Neon Dreams',
     'A futuristic city glowing with neon lights.',
     'https://example.com/artwork/1', '2026-01-10', TRUE),
    (2, 'Forest Sketch',
     'A detailed pencil sketch of a forest trail.',
     'https://example.com/artwork/2', '2026-01-15', TRUE),
    (3, 'Autumn Reflections',
     'A warm landscape painting inspired by autumn.',
     'https://example.com/artwork/3', '2026-02-02', TRUE);

-- 7. ARTWORK INTERESTS
INSERT INTO artwork_interests (artwork_id, interest_id)
VALUES
    (1, 1),
    (1, 3),
    (2, 3),
    (3, 2);

-- 8. FEEDBACK (feedback_id is generated automatically)
INSERT INTO feedback
    (artwork_id, feedback_giver_id, resolved, feedback_date,
     feedback_content, feedback_frame, feedback_x, feedback_y, feedback_z)
VALUES
    (1, 2, FALSE, '2026-05-05',
     'Consider increasing contrast around the main subject.',
     1, 120, 80, 0),
    (2, 1, TRUE, '2026-05-07',
     'The foreground details look excellent.',
     1, 80, 200, 0);

-- 9. ARTWORK COMMENTS
INSERT INTO artwork_comments (artwork_id, user_id, comment_data)
VALUES
    (1, 2, 'Love the neon colors in this piece!'),
    (2, 3, 'The tree textures are beautifully drawn.'),
    (3, 1, 'The autumn palette is wonderful.');

-- 10. ART BOARDS
INSERT INTO art_board (artwork_id, owner_id, art_board_name)
VALUES
    (1, 2, 'Cyberpunk Inspiration'),
    (3, 1, 'Favorite Landscapes'),
    (NULL, 3, 'Future Projects');

-- 11. DISCOVERY BOARD
INSERT INTO discovery_board (artwork_id, user_id)
VALUES
    (1, 2),
    (2, 3),
    (3, 1);

-- 12. ARTWORK REVISIONS
INSERT INTO artwork_revision
    (artwork_id, prev_revision_link, current_revision_link, version_number)
VALUES
    (1, NULL, 'https://example.com/artwork/1/v1', '1.0'),
    (1, 'https://example.com/artwork/1/v1',
        'https://example.com/artwork/1/v2', '2.0'),
    (2, NULL, 'https://example.com/artwork/2/v1', '1.0');

COMMIT;
