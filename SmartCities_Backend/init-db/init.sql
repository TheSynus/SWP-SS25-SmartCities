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


-- Datentyp für vordefinierte Kategorien Bezeichnungen
CREATE TYPE category_type AS ENUM ('Verwaltung', 'Freizeit', 'Stadtservice', 'Sonstiges');

-- category
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    label category_type NOT NULL,
    color VARCHAR(7) DEFAULT '#808080'
);

-- calendar_entries
CREATE TABLE calendar_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    description TEXT,
    location VARCHAR(255),
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    recurrence recurrence_type NOT NULL DEFAULT 'none'
);

-- Datentyp für Wiederholungs-Regel in Termin-Einträgen
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- Termine
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    recurrence recurrence_type NOT NULL DEFAULT 'none',
    description TEXT
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

-- Datentyp für Karten-Typen
CREATE TYPE card_type AS ENUM ('weather', 'nina', 'line', 'bar');

-- cards
CREATE TABLE card (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    type card_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);