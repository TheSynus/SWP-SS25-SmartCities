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
    title VARCHAR(200) NOT NULL,
    color VARCHAR(7) DEFAULT '#808080'
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

-- graphs
CREATE TABLE graphs(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(100)
);

-- graphs_data
CREATE TABLE graphs_data(
    id SERIAL PRIMARY KEY,
    graph_id INTEGER REFERENCES graphs(id) ON DELETE SET NULL,
    x_comp VARCHAR(100),
    y_comp VARCHAR(100)
);

-- Datentyp für Karten-Typen
CREATE TYPE card_type AS ENUM ('weather', 'nina', 'line', 'bar', 'column', 'pie', 'calender');

-- cards
CREATE TABLE card (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    type card_type NOT NULL,
    graph_id INTEGER REFERENCES graphs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO category (title, color) VALUES
('Verwaltung', '#FF5733'),
('Freizeit', '#33C1FF'),
('Stadtservice', '#28A745'),
('Sonstiges', '#FFC300');

INSERT INTO appointments (title, start_time, end_time, location, category_id, recurrence, description) VALUES
('Stadtfest', '2025-06-24 10:00:00', '2025-06-24 22:00:00', 'Rathausplatz', 2, 'none', 'Stadtfest, für die ganze Familie.'),
('Wochenmarkt', '2025-06-25 07:00:00', '2025-06-25 13:30:00', 'Marktplatz', 3, 'weekly', 'Lokale Anbieter, bieten ihre Waren an.'),
('Kirchen Geburtstag', '2025-06-27 10:00:00', '2025-06-28 18:00:00', 'Kirche', 4, 'yearly', 'Alte Kirche wird noch älter.');

INSERT INTO graphs (title, type) VALUES
('Verkehrsaufkommen der letzten 4 Wochen', 'line');

INSERT INTO graphs_data (graph_id, x_comp, y_comp) VALUES
(1, '1', '11259'),
(1, '2', '15269'),
(1, '3', '42015'),
(1, '4', '32145');

INSERT INTO card (title, position, type, graph_id) VALUES
('Wetter', 1, 'weather', NULL),
('Verkehr-Graph', 2, 'line', 1),
('Kalender', 3, 'calender', NULL);