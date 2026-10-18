-- These queries were generated using ChatGPT to generate sample seed data

BEGIN;

-- =====================================================
-- 1. USERS
-- =====================================================

INSERT INTO user_login (email, last_login, username) VALUES
('alex.morgan@example.com',   '2026-10-15', 'alexmorgan'),
('jamie.chen@example.com',    '2026-10-16', 'jamiecreates'),
('taylor.lee@example.com',    '2026-10-12', 'taylorsketch'),
('riley.patel@example.com',   '2026-10-17', 'rileydraws'),
('casey.brooks@example.com',  '2026-10-10', 'caseyart'),
('jordan.kim@example.com',    '2026-10-18', 'jordankim'),
('morgan.diaz@example.com',   '2026-10-14', 'morgandiaz'),
('sam.taylor@example.com',    '2026-10-17', 'samtcreates');


-- =====================================================
-- 2. USER PROFILES
-- Assumes user IDs 1 through 8
-- =====================================================

INSERT INTO user_profile (user_id, profile_picture, is_visible) VALUES
(1, 'https://example.com/profiles/alex.jpg', TRUE),
(2, 'https://example.com/profiles/jamie.jpg', TRUE),
(3, 'https://example.com/profiles/taylor.jpg', TRUE),
(4, 'https://example.com/profiles/riley.jpg', TRUE),
(5, 'https://example.com/profiles/casey.jpg', FALSE),
(6, 'https://example.com/profiles/jordan.jpg', TRUE),
(7, 'https://example.com/profiles/morgan.jpg', TRUE),
(8, 'https://example.com/profiles/sam.jpg', TRUE);


-- =====================================================
-- 3. PASSWORD HASHES
-- Demonstration placeholders only; not real credentials
-- =====================================================

INSERT INTO user_pass_hash (user_id, user_hash) VALUES
(1, 'demo_hash_alex_000000000000000000000000000000'),
(2, 'demo_hash_jamie_00000000000000000000000000000'),
(3, 'demo_hash_taylor_0000000000000000000000000000'),
(4, 'demo_hash_riley_00000000000000000000000000000'),
(5, 'demo_hash_casey_00000000000000000000000000000'),
(6, 'demo_hash_jordan_000000000000000000000000000'),
(7, 'demo_hash_morgan_000000000000000000000000000'),
(8, 'demo_hash_sam_000000000000000000000000000000');


-- =====================================================
-- 4. INTERESTS
-- Assumes interest IDs 1 through 10
-- =====================================================

INSERT INTO interests (interest_name, description) VALUES
('Digital Painting', 'Creating illustrations and paintings using digital tools.'),
('Photography', 'Capturing people, landscapes, objects, and everyday moments.'),
('3D Modeling', 'Designing three-dimensional objects, characters, and environments.'),
('Traditional Drawing', 'Drawing with pencils, pens, charcoal, and other physical media.'),
('Abstract Art', 'Exploring shapes, colors, textures, and nonliteral compositions.'),
('Concept Art', 'Developing visual concepts for games, films, and creative projects.'),
('Watercolor', 'Creating artwork using transparent watercolor paints.'),
('Animation', 'Creating moving images through sequential artwork and motion.'),
('Graphic Design', 'Combining typography, images, and layouts for visual communication.'),
('Fantasy Art', 'Illustrating imaginative worlds, magical creatures, and fictional settings.');


-- =====================================================
-- 5. USER INTERESTS
-- =====================================================

INSERT INTO user_interests (user_id, interest_id) VALUES
(1, 1), (1, 3),
(2, 2), (2, 7),
(3, 4), (3, 5),
(4, 1), (4, 6),
(5, 5), (5, 9),
(6, 3), (6, 8),
(7, 2), (7, 10),
(8, 4), (8, 6);


-- =====================================================
-- 6. ARTWORK
-- Assumes artwork IDs 1 through 12
-- =====================================================

INSERT INTO artwork
    (user_id, artwork_title, artwork_description,
     artwork_link, creation_date, is_visible)
VALUES
(1, 'Neon City',
 'A futuristic city illuminated by colorful neon lights.',
 'https://example.com/artwork/neon-city.jpg',
 '2026-08-10', TRUE),

(1, 'Dreamscape',
 'A surreal landscape combining floating islands and glowing clouds.',
 'https://example.com/artwork/dreamscape.jpg',
 '2026-08-18', TRUE),

(2, 'Morning Reflections',
 'A peaceful lake reflecting the colors of an early morning sky.',
 'https://example.com/artwork/morning-reflections.jpg',
 '2026-08-22', TRUE),

(2, 'Autumn Street',
 'A photograph of a tree-lined street covered in autumn leaves.',
 'https://example.com/artwork/autumn-street.jpg',
 '2026-09-02', TRUE),

(3, 'Geometric Emotion',
 'An abstract composition exploring emotion through geometric forms.',
 'https://example.com/artwork/geometric-emotion.jpg',
 '2026-09-05', TRUE),

(3, 'Charcoal Portrait',
 'A monochrome portrait study focused on light, shadow, and expression.',
 'https://example.com/artwork/charcoal-portrait.jpg',
 '2026-09-09', FALSE),

(4, 'Forest Guardian',
 'A fantasy character protecting an ancient enchanted forest.',
 'https://example.com/artwork/forest-guardian.jpg',
 '2026-09-12', TRUE),

(4, 'Floating Islands',
 'Concept art for a fantasy world with islands suspended above the clouds.',
 'https://example.com/artwork/floating-islands.jpg',
 '2026-09-15', TRUE),

(5, 'Color in Motion',
 'An experimental abstract piece using energetic strokes and vivid colors.',
 'https://example.com/artwork/color-in-motion.jpg',
 '2026-09-20', TRUE),

(6, 'Robot Companion',
 'A stylized 3D model of a friendly robot designed for an animated film.',
 'https://example.com/artwork/robot-companion.jpg',
 '2026-09-25', TRUE),

(7, 'Moonlit Castle',
 'A fantasy castle beneath a luminous moon and a star-filled sky.',
 'https://example.com/artwork/moonlit-castle.jpg',
 '2026-10-01', TRUE),

(8, 'Quiet Afternoon',
 'A pencil illustration of a quiet room filled with afternoon sunlight.',
 'https://example.com/artwork/quiet-afternoon.jpg',
 '2026-10-05', TRUE);


-- =====================================================
-- 7. ARTWORK INTERESTS
-- =====================================================

INSERT INTO artwork_interests (artwork_id, interest_id) VALUES
(1, 1), (1, 9),
(2, 1), (2, 10),
(3, 2), (3, 7),
(4, 2),
(5, 5), (5, 1),
(6, 4),
(7, 6), (7, 10),
(8, 6), (8, 3),
(9, 5),
(10, 3), (10, 8),
(11, 10), (11, 1),
(12, 4);


-- =====================================================
-- 8. FEEDBACK
-- Coordinates represent example annotation positions
-- =====================================================

INSERT INTO feedback
    (artwork_id, feedback_giver_id, resolved, feedback_date,
     feedback_content, feedback_frame, feedback_x,
     feedback_y, feedback_z)
VALUES
(1, 2, FALSE, '2026-10-01',
 'Could the lighting around the main building be softer?', 0, 120, 240, 0),

(1, 3, TRUE, '2026-10-02',
 'The color palette looks great. The reflections could use more detail.', 0, 350, 410, 0),

(2, 4, FALSE, '2026-10-03',
 'Consider adding a subtle atmospheric haze in the distance.', 0, 200, 150, 0),

(3, 1, TRUE, '2026-10-04',
 'Beautiful composition and a very convincing reflection.', 0, 180, 300, 0),

(4, 5, FALSE, '2026-10-05',
 'The foreground could use slightly more contrast.', 0, 260, 380, 0),

(5, 6, TRUE, '2026-10-06',
 'The shapes work well together. I really like the balance.', 0, 150, 200, 0),

(6, 1, FALSE, '2026-10-07',
 'Try blending the shadows around the cheek more gradually.', 0, 210, 190, 0),

(7, 8, FALSE, '2026-10-08',
 'The character design is strong. The background might benefit from more depth.', 0, 300, 220, 0),

(8, 2, TRUE, '2026-10-09',
 'Excellent world-building. The clouds give the scene a sense of scale.', 0, 400, 180, 0),

(9, 7, FALSE, '2026-10-10',
 'A few more variations in stroke thickness could add texture.', 0, 190, 260, 0),

(10, 3, TRUE, '2026-10-11',
 'The silhouette is readable and the materials look polished.', 12, 230, 170, 0),

(11, 4, FALSE, '2026-10-12',
 'The moonlight could create a stronger rim light on the castle.', 0, 320, 120, 0);


-- =====================================================
-- 9. ARTWORK COMMENTS
-- =====================================================

INSERT INTO artwork_comments
    (artwork_id, user_id, comment_data)
VALUES
(1, 4, 'The neon colors give this city a great atmosphere!'),
(2, 1, 'I love the dreamy shapes and the sense of scale.'),
(3, 5, 'This would make a beautiful print.'),
(4, 7, 'The warm colors capture autumn perfectly.'),
(5, 2, 'The composition feels energetic without being too busy.'),
(6, 8, 'The shading gives the portrait a lot of character.'),
(7, 2, 'I would love to see more characters from this world.'),
(8, 6, 'The floating islands are a fantastic concept.'),
(9, 3, 'The color transitions are really interesting.'),
(10, 1, 'The robot design feels friendly and memorable.'),
(11, 8, 'The castle silhouette looks amazing against the moon.'),
(12, 3, 'The lighting makes this feel warm and peaceful.');


-- =====================================================
-- 10. ART BOARDS
-- =====================================================

INSERT INTO art_board (artwork_id, owner_id, art_board_name) VALUES
(1, 2, 'Cyberpunk Inspiration'),
(2, 1, 'Dream Worlds'),
(3, 5, 'Peaceful Landscapes'),
(5, 3, 'Abstract Experiments'),
(7, 4, 'Fantasy Characters'),
(8, 6, 'Worldbuilding Ideas'),
(10, 6, '3D Character References'),
(11, 7, 'Fantasy Environments');


-- =====================================================
-- 11. DISCOVERY BOARD
-- =====================================================

INSERT INTO discovery_board (artwork_id, user_id) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 1),
(5, 6),
(6, 5),
(7, 8),
(8, 7),
(9, 1),
(10, 2),
(11, 3),
(12, 4);


-- =====================================================
-- 12. ARTWORK REVISIONS
-- =====================================================

INSERT INTO artwork_revision
    (artwork_id, prev_revision_link,
     current_revision_link, version_number)
VALUES
(1, 'https://example.com/revisions/neon-city-v1.jpg',
    'https://example.com/revisions/neon-city-v2.jpg', '2.0'),

(2, 'https://example.com/revisions/dreamscape-v1.jpg',
    'https://example.com/revisions/dreamscape-v2.jpg', '2.0'),

(3, NULL,
    'https://example.com/revisions/morning-reflections-v1.jpg', '1.0'),

(4, 'https://example.com/revisions/autumn-street-v1.jpg',
    'https://example.com/revisions/autumn-street-v2.jpg', '2.0'),

(5, NULL,
    'https://example.com/revisions/geometric-emotion-v1.jpg', '1.0'),

(6, 'https://example.com/revisions/charcoal-portrait-v1.jpg',
    'https://example.com/revisions/charcoal-portrait-v2.jpg', '2.0'),

(7, NULL,
    'https://example.com/revisions/forest-guardian-v1.jpg', '1.0'),

(8, 'https://example.com/revisions/floating-islands-v1.jpg',
    'https://example.com/revisions/floating-islands-v2.jpg', '2.0'),

(9, NULL,
    'https://example.com/revisions/color-in-motion-v1.jpg', '1.0'),

(10, 'https://example.com/revisions/robot-companion-v1.jpg',
     'https://example.com/revisions/robot-companion-v2.jpg', '2.0'),

(11, NULL,
     'https://example.com/revisions/moonlit-castle-v1.jpg', '1.0'),

(12, NULL,
     'https://example.com/revisions/quiet-afternoon-v1.jpg', '1.0');


COMMIT;
