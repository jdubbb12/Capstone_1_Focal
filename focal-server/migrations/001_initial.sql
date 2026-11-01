-- New, normalized schema based on the diagrams + requirements R1-R11.
-- Forward-only migration: do not edit after applying; add 002_*.sql instead.
CREATE TABLE users (
  user_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  username varchar(50) NOT NULL UNIQUE CHECK (username = lower(username)),
  password_hash text NOT NULL,
  first_name varchar(80) NOT NULL,
  last_name varchar(80) NOT NULL,
  creative_role varchar(20) NOT NULL DEFAULT 'other'
    CHECK (creative_role IN ('2d_artist','3d_designer','architect','other')),
  bio varchar(1000) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expiry_idx ON sessions (expires_at);
CREATE TABLE interests (
  interest_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE
);
CREATE TABLE user_interests (
  user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  interest_id integer NOT NULL REFERENCES interests ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
);
CREATE INDEX user_interests_interest_idx ON user_interests (interest_id);
CREATE TABLE artworks (
  artwork_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artist_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  title varchar(150) NOT NULL CHECK (length(trim(title)) > 0),
  caption varchar(2000) NOT NULL DEFAULT '',
  medium varchar(100) NOT NULL,
  private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX artworks_artist_idx ON artworks (artist_id);
CREATE INDEX artworks_feed_idx ON artworks (medium, created_at DESC, artwork_id DESC) WHERE private = false;
CREATE TABLE artwork_interests (
  artwork_id integer NOT NULL REFERENCES artworks ON DELETE CASCADE,
  interest_id integer NOT NULL REFERENCES interests ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, interest_id)
);
CREATE INDEX artwork_interests_interest_idx ON artwork_interests (interest_id);
CREATE TABLE revisions (
  revision_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  artwork_id integer NOT NULL REFERENCES artworks ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  media_type varchar(10) NOT NULL CHECK (media_type IN ('image','model','video')),
  storage_key text NOT NULL CHECK (length(trim(storage_key)) > 0),
  original_filename varchar(255) NOT NULL,
  mime_type varchar(100) NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  notes varchar(2000) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (artwork_id, version)
);
CREATE TABLE comments (
  comment_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  revision_id integer NOT NULL REFERENCES revisions ON DELETE CASCADE,
  author_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  parent_id integer,
  body varchar(4000) NOT NULL CHECK (length(trim(body)) > 0),
  category varchar(20) NOT NULL DEFAULT 'other' CHECK (category IN ('color','anatomy','lighting','composition','other')),
  status varchar(12) NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','bumped','ignored')),
  anchor_kind varchar(10) CHECK (anchor_kind IN ('image','model','video')),
  x double precision,
  y double precision,
  z double precision,
  frame integer CHECK (frame >= 0),
  mesh_name varchar(255),
  camera jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (comment_id, revision_id),
  FOREIGN KEY (parent_id, revision_id) REFERENCES comments (comment_id, revision_id) ON DELETE CASCADE,
  CHECK (parent_id IS NULL OR parent_id <> comment_id),
  -- Replies have no anchor; root pins use normalized 2D or finite model-space 3D coordinates.
  CHECK (
    (parent_id IS NOT NULL AND anchor_kind IS NULL AND x IS NULL AND y IS NULL AND z IS NULL AND frame IS NULL AND mesh_name IS NULL AND camera IS NULL)
    OR (parent_id IS NULL AND (
      (anchor_kind = 'image' AND x IS NOT NULL AND y IS NOT NULL AND x BETWEEN 0 AND 1 AND y BETWEEN 0 AND 1 AND z IS NULL AND frame IS NULL)
      OR (anchor_kind = 'video' AND x IS NOT NULL AND y IS NOT NULL AND x BETWEEN 0 AND 1 AND y BETWEEN 0 AND 1 AND z IS NULL AND frame IS NOT NULL)
      OR (anchor_kind = 'model' AND x IS NOT NULL AND y IS NOT NULL AND z IS NOT NULL
        AND x > '-Infinity'::float8 AND x < 'Infinity'::float8
        AND y > '-Infinity'::float8 AND y < 'Infinity'::float8
        AND z > '-Infinity'::float8 AND z < 'Infinity'::float8 AND frame IS NULL)
    ) AND anchor_kind IS NOT NULL)
  )
);
CREATE INDEX comments_revision_idx ON comments (revision_id, created_at);
CREATE INDEX comments_author_idx ON comments (author_id, updated_at DESC);
CREATE INDEX comments_parent_idx ON comments (parent_id);
CREATE TABLE boards (
  board_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner integer NOT NULL REFERENCES users ON DELETE CASCADE,
  board_name varchar(100) NOT NULL CHECK (length(trim(board_name)) > 0),
  private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX boards_owner_idx ON boards (owner);
CREATE TABLE board_items (
  board_id integer NOT NULL REFERENCES boards ON DELETE CASCADE,
  artwork_id integer NOT NULL REFERENCES artworks ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (board_id, artwork_id)
);
CREATE INDEX board_items_artwork_idx ON board_items (artwork_id);
CREATE TABLE reports (
  report_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
  artwork_id integer REFERENCES artworks ON DELETE CASCADE,
  comment_id integer REFERENCES comments ON DELETE CASCADE,
  reason varchar(1000) NOT NULL CHECK (length(trim(reason)) > 0),
  status varchar(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((artwork_id IS NOT NULL) <> (comment_id IS NOT NULL))
);
CREATE INDEX reports_pending_idx ON reports (created_at) WHERE status = 'pending';
CREATE UNIQUE INDEX reports_artwork_unique ON reports (reporter_id, artwork_id) WHERE artwork_id IS NOT NULL;
CREATE UNIQUE INDEX reports_comment_unique ON reports (reporter_id, comment_id) WHERE comment_id IS NOT NULL;
INSERT INTO interests (name) VALUES
 ('Digital Art'), ('Photography'), ('Painting'), ('Sculpture'), ('Graphic Design'),
 ('Architecture'), ('3D Modeling'), ('Animation'), ('Video'), ('Crafts');
