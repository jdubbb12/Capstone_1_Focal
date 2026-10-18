begin;
-- columns user_id, email, last_login, username
create table user_login (user_id integer primary key generated always as identity, email varchar(150) unique NOT NULL, last_login date, username varchar(50) unique);

-- columns user_id, profile_picture, is_visible
create table user_profile (user_id integer NOT NULL, profile_picture text, is_visible bool, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade);

-- columns user_id, user_hash
create table user_pass_hash (user_id integer NOT NULL, user_hash varchar(50) NOT NULL, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade);

-- columns interest_id, interest_name, description
create table interests (interest_id integer primary key generated always as identity, interest_name varchar(100) unique NOT NULL, description varchar(250) NOT NULL);

-- columns user_id, interest_id
create table user_interests (user_id integer NOT NULL, interest_id integer NOT NULL, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade, constraint fk_interest_id foreign key (interest_id) references interests(interest_id) on delete cascade);

-- columns artwork_id, user_id, title, creation_date, artwork_link, is_visible
create table artwork (artwork_id integer primary key generated always as identity, user_id integer NOT NULL, artwork_title varchar(75), artwork_description varchar(500), artwork_link text NOT NULL, creation_date date NOT NULL, is_visible bool, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade);

-- columns artwork_id, interest_id
create table artwork_interests (artwork_id integer NOT NULL, interest_id integer NOT NULL, constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade, constraint fk_interest_id foreign key (interest_id) references interests(interest_id) on delete cascade);

-- columns feedback_id, artwork_id, feedback_giver_id, resolved, feedback_date, feedback_content, feedback_frame, feedback_x, feedback_y, feedback_z
create table feedback (feedback_id integer primary key generated always as identity, artwork_id integer NOT NULL, feedback_giver_id integer NOT NULL, resolved bool NOT NULL, feedback_date date NOT NULL, feedback_content varchar(500) NOT NULL, feedback_frame integer, feedback_x integer, feedback_y integer, feedback_z integer, constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade, constraint fk_user_id foreign key (feedback_giver_id) references user_login(user_id) on delete cascade);

-- columns  artwork_id, comment_id, user_id, comment_data
create table artwork_comments (comment_id integer primary key generated always as identity, artwork_id integer NOT NULL, user_id integer NOT NULL, comment_data varchar(250) NOT NULL, constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade);

-- columns art_board_id, artwork_id, owner_id, art_board_name
create table art_board (art_board_id integer primary key generated always as identity, artwork_id integer, owner_id integer, art_board_name varchar(100), constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade, constraint fk_user_id foreign key (owner_id) references user_login(user_id) on delete cascade);

-- columns disc_board_id, artwork_id, user_id
create table discovery_board (disc_board_id integer primary key generated always as identity, artwork_id integer, user_id integer not null, constraint fk_user_id foreign key (user_id) references user_login(user_id) on delete cascade, constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade);

-- columns revision_id, artwork_id, prev_revision_link, current_revision_link, version_number
create table artwork_revision (revision_id integer primary key generated always as identity, artwork_id integer NOT NULL, prev_revision_link text, current_revision_link text, version_number varchar(15), constraint fk_artwork_id foreign key (artwork_id) references artwork(artwork_id) on delete cascade);
commit;
