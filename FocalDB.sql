create table user_login (user_id integer primary key generated always as identity, email varchar(150) unique NOT NULL, last_login date, username varchar(50) unique);

create table user_pass_hash (user_id integer references user_login(user_id) NOT NULL, user_hash varchar(50) NOT NULL);

create table interests (interest_id integer primary key generated always as identity, interest_name varchar(100) unique NOT NULL);

create table user_interests (user_id integer references user_login(user_id) NOT NULL, interest_id integer references interests(interest_id) NOT NULL);

create table artwork (artwork_id integer primary key generated always as identity, artwork_title varchar(75), artwork_description varchar(500), artwork_link text NOT NULL, creation_date date NOT NULL, is_private bool);

create table artwork_interests (artwork_id integer references artwork(artwork_id) NOT NULL, user_id int references user_login(user_id) NOT NULL, interest_id integer references interests(interest_id) NOT NULL);

create table feedback (feedback_id integer primary key generated always as identity, artwork_id integer references artwork(artwork_id) NOT NULL, feedback_giver_id integer references user_login(user_id) NOT NULL, resolved bool NOT NULL, feedback_date date NOT NULL, feedback_content varchar(500) NOT NULL, feedback_frame integer, feedback_x integer, feedback_y integer, feedback_z integer)

create table comments (comment_id integer primary key generated always as identity, user_id integer references user_login(user_id) NOT NULL, comment_data varchar(250) NOT NULL);

create table artwork_comments (artwork_id integer references artwork(artwork_id) NOT NULL, user_id integer references user_login(user_id) NOT NULL, comment_id integer references comments(comment_id) NOT NULL);

create table art_board (art_board_id integer primary key generated always as identity, artwork_id integer references artwork(artwork_id), owner_id integer references user_login(user_id), art_board_name varchar(100));

create table discovery_board (disc_board_id integer primary key generated always as identity, artwork_id integer references artwork(artwork_id), user_id integer references user_login(user_id) not null);

create table artwork_revision (revision_id integer primary key generated always as identity, artwork_id integer references artwork(artwork_id), prev_revision_link text, current_revision_link text, version_number varchar(15));
