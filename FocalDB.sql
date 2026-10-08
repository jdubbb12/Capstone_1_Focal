create table user_login (user_id integer primary key generated always as identity, email varchar(150) unique NOT NULL, last_login date);

create table user_pass_hash (user_id integer references user_login(user_id) NOT NULL, user_hash varchar(50) NOT NULL);

create table interests (interest_id integer primary key generated always as identity, interest_name varchar(100) unique NOT NULL);

create table user_interests (user_id integer references user_login(user_id) NOT NULL, interest_id integer references interests(interest_id) NOT NULL);

create table artwork (artwork_id integer primary key generated always as identity, artwork_title varchar(75), artwork_description varchar(500), artwork_link text NOT NULL, creation_date date NOT NULL);

create table artwork_interests (artwork_id integer references artwork(artwork_id) NOT NULL, interest_id integer references interests(interest_id) NOT NULL);

create table feedback (feedback_id integer primary key generated always as identity, artwork_id integer references artwork(artwork_id) NOT NULL, feedback_giver_id integer references user_login(user_id) NOT NULL, resolved bool NOT NULL, feedback_date date NOT NULL, feedback_content varchar(500) NOT NULL, feedback_frame integer, feedback_x integer, feedback_y integer, feedback_z integer)

create table comments (comment_id integer primary key generated always as identity, user_id integer references user_login(user_id) NOT NULL, comment_data varchar(250) NOT NULL);

create table artwork_comments (artwork_id integer references artwork(artwork_id) NOT NULL, user_id integer references user_login(user_id) NOT NULL, comment_id integer references comments(comment_id) NOT NULL);



-- I used AI to generate this values for TESTS.

-- ============================================
-- 1. USER LOGIN
-- ============================================

INSERT INTO user_login (email, last_login) VALUES
('admin', '2026-10-05'),
('alice.johnson@example.com', '2026-09-28'),
('bob.smith@example.com', '2026-09-30'),
('charlie.brown@example.com', '2026-10-01'),
('diana.williams@example.com', '2026-09-25'),
('ethan.davis@example.com', '2026-10-03');


-- ============================================
-- 2. USER PASSWORD HASHES
-- ============================================

INSERT INTO user_pass_hash (user_id, user_hash) VALUES
(1, 'a8f5f167f44f4964e6c998dee827110c'),
(2, 'b6d767d2f8ed5d21a44b0e5886680cb9'),
(3, 'c4ca4238a0b923820dcc509a6f75849b'),
(4, 'd8578edf8458ce06fbc5bb76a58c5ca4'),
(5, 'e4da3b7fbbce2345d7772b0674a318d5'),
(6, 'e4da3b7fbbce2345d7772b0674a318d4');


-- ============================================
-- 3. INTERESTS
-- ============================================

INSERT INTO interests (interest_name) VALUES
('Digital Art'),
('Photography'),
('Painting'),
('Sculpture'),
('Graphic Design');


-- ============================================
-- 4. USER INTERESTS
-- ============================================

INSERT INTO user_interests (user_id, interest_id) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 5),
(3, 1),
(3, 4),
(4, 3),
(4, 5),
(5, 2),
(5, 4);


-- ============================================
-- 5. ARTWORK
-- ============================================

INSERT INTO artwork (artwork_link, creation_date) VALUES
('https://example.com/artwork/sunset-city.jpg', '2026-01-15'),
('https://example.com/artwork/forest-dream.jpg', '2026-02-20'),
('https://example.com/artwork/ocean-light.jpg', '2026-04-05'),
('https://example.com/artwork/abstract-motion.jpg', '2026-06-12'),
('https://example.com/artwork/urban-reflection.jpg', '2026-08-23');


-- ============================================
-- 6. ARTWORK INTERESTS
-- ============================================

INSERT INTO artwork_interests (artwork_id, interest_id) VALUES
(1, 1),
(1, 5),
(2, 1),
(2, 4),
(3, 2),
(3, 3),
(4, 1),
(4, 5),
(5, 2),
(5, 5);


-- ============================================
-- 7. FEEDBACK
-- ============================================

INSERT INTO feedback
    (artwork_id, feedback_giver_id, resolved, feedback_date,
     feedback_content, feedback_frame, feedback_x, feedback_y, feedback_z)
VALUES
(1, 2, false, '2026-09-10',
 'The lighting in the upper-left portion could be improved.',
 12, 145, 82, 0),

(2, 3, true, '2026-09-12',
 'The colors work very well together. Consider increasing the contrast slightly.',
 25, 210, 135, 3),

(3, 1, false, '2026-09-18',
 'The central subject could use more definition.',
 8, 320, 190, 1),

(4, 4, true, '2026-09-22',
 'Interesting composition. The background elements complement the main subject.',
 31, 95, 240, 2),

(5, 5, false, '2026-09-29',
 'The perspective near the bottom edge appears slightly distorted.',
 17, 180, 275, 0);


-- ============================================
-- 8. COMMENTS
-- ============================================

INSERT INTO comments (user_id, comment_data) VALUES
(1, 'I really like the color palette used in this piece.'),
(2, 'The composition draws attention to the main subject nicely.'),
(3, 'The lighting creates a very interesting atmosphere.'),
(4, 'This would look great with a little more contrast.'),
(5, 'The details in the background are especially impressive.');


-- ============================================
-- 9. ARTWORK COMMENTS
-- ============================================

INSERT INTO artwork_comments (artwork_id, user_id, comment_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5);
