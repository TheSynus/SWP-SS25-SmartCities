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

-- category
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    label VARCHAR(200) NOT NULL
);

-- calendar_entries
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE calendar_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    description TEXT,
    location VARCHAR(255),
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    recurrence recurrence_type NOT NULL DEFAULT 'none'
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
    additional_info TEXT
);

-- graphs
CREATE TABLE graphs(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(100)
);

-- graphs_data
CREATE TABLE graphs_data(
    id SERIAL PRIMARY KEY,
    graph_id INTEGER REFERENCES graphs(id) ON DELETE SET NULL
    x_comp VARCHAR(100),
    y_comp VARCHAR(100)
);