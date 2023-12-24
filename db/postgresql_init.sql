CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR,
    display_name VARCHAR,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    iterations INTEGER,
    salt VARCHAR,
    profile_picture VARCHAR,
    bio VARCHAR
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_poster_id INTEGER REFERENCES users (id),
    date_of_post TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content VARCHAR,
    likes_count INTEGER DEFAULT 0,
    reply_to INTEGER REFERENCES posts (id)
);

CREATE TABLE IF NOT EXISTS post_likes (
    user_id INTEGER REFERENCES users (id),
    post_id INTEGER REFERENCES posts (id),
    PRIMARY KEY (user_id, post_id)
);