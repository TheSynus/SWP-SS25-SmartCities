-- users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- calendar_entries
CREATE TABLE calendar_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    is_all_day BOOLEAN DEFAULT FALSE
);

-- images
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_data BYTEA NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    additional_info TEXT
);

-- events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    location VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    category VARCHAR(100),
    tags TEXT[],
    additional_info TEXT
);