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
    graph_id INTEGER REFERENCES graphs(id) ON DELETE CASCADE,
    x_comp VARCHAR(100),
    y_comp VARCHAR(100)
);

-- Datentyp für Karten-Typen
CREATE TYPE card_type AS ENUM ('weather', 'nina', 'wind', 'line', 'bar', 'column', 'pie', 'calender');

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

-- marker
CREATE TABLE marker (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tags
--CREATE TABLE tags (
--    id SERIAL PRIMARY KEY,
--    title  VARCHAR(255) NOT NULL UNIQUE
--);

INSERT INTO category (title, color) VALUES
('Verwaltung', '#FF5733'),
('Bildung', '#8E44AD'),   
('Gesundheit', '#C0392B'),
('Natur', '#28A745'),     
('Verkehr', '#1565C0'),   
('Energie', '#2E7D32'),   
('Tourismus', '#1ABC9C'), 
('Wirtschaft', '#E67E22'),
('Legenden', '#C08F10'),  
('Sonstiges', '#808080'); 

INSERT INTO marker (name, description, category_id, latitude, longitude, is_public, created_at, updated_at) VALUES
('Rathaus Wedel', 'Zentrale Verwaltung der Stadt Wedel, Bürgerservice, Bürgerbüro.', 1, 53.58072295672411, 9.70471474466052, TRUE, '1980-10-25 12:00:00', '2025-10-09 12:00:00'),
('Fachhochschule Wedel', 'Fachhochschule in Wedel, gegründet 1969, bietet praxisorientierte Studiengänge in Technik und Wirtschaft.', 2, 53.57827196448696, 9.72866685371671, TRUE, '1969-01-01 00:00:00', '1969-01-01 00:00:00'),
('Johann-Rist-Gymnasium', 'Gymnasium in Wedel, gegründet 1965, mit breitem Bildungsangebot und modernen Unterrichtsmethoden.', 2, 53.58613663647223, 9.699559536860317, TRUE, '1965-01-01 00:00:00', '1965-01-01 00:00:00'),
('Ärztehaus Wedel', 'Ärztehaus in Wedel mit verschiedenen Fachärzten, inklusive Apotheke im Erdgeschoss.', 3, 53.58148543992656, 9.705817103821355, TRUE, '1985-01-01 00:00:00', '1985-01-01 00:00:00'),
('Elbstrand Wedel', 'Natürlicher Sandstrand an der Elbe, beliebt zum Spazierengehen und Erholen.', 4, 53.5706061731693, 9.695048626158906, TRUE, '2000-06-15 00:00:00', '2000-06-15 00:00:00'),
('Bahnhof Wedel', 'Zentraler Bahnhof in Wedel, Dreh- und Angelpunkt des ÖPNV mit S-Bahn- und Busanbindung.', 5, 53.581815130693016, 9.704559222807047, TRUE, '2010-03-20 00:00:00', '2010-03-20 00:00:00'),
('Heizkraftwerk Wedel', 'Heizkraftwerk in Wedel, versorgt die Stadt mit Wärme und Energie.', 6, 53.56696749733195, 9.724327687015679, FALSE, '1993-01-01 00:00:00', '1993-01-01 00:00:00'),
('Willkomm-Höft', 'Schiffsbegrüßungsanlage an der Elbe bei Wedel, in Betrieb seit Juni 1952, mit täglichen Begrüßungen internationaler Schiffe und historischen Flaggenmast.', 7, 53.56826333564152, 9.702523913003912, TRUE, '1952-06-01 00:00:00', '1952-06-01 00:00:00'),
('Hackathon FH Wedel', 'Am 14.06.2025 trafen sich Studierende der FH Wedel zum Hackathon am Neubau. Man munkelt, dass in dieser Nacht 13 besonders kreative Köpfe die Stadt unsicher gemacht und digitale Spuren hinterlassen haben.', 9, 53.577320867959365, 9.728919159862205, FALSE, '2025-06-14 00:00:00', '2025-06-14 00:00:00'),
('Aytac Kebab', 'Beliebter Dönerladen in Wedel, bekannt für frische Zutaten und große Portionen.', 7, 53.57736561182431, 9.705047973197166, TRUE, '1999-03-27 00:00:00', '2025-11-09 00:00:00'),
('Gold von Xatar — mögliches Versteck', 'Direkt neben dem Aytac Dönerladen könnte sich das legendäre Gold von Xatar befinden. Man munkelt, dass es nach dem Raub hier versteckt wurde, aber selbst der Meister selbst kennt den exakten Ort nicht.', 9, 53.577258784746704, 9.705026219244207, FALSE, '2025-11-09 00:00:00', '2025-11-09 00:00:00'),
('Unbekannter Treffpunkt', 'Ein allgemeiner Ort in Wedel, der keiner spezifischen Kategorie zugeordnet ist und für zukünftige Tests oder Einträge genutzt werden kann.', 10, 53.57506498145424, 9.697419751830553, TRUE, '2025-11-09 00:00:00', '2025-11-09 00:00:00'),
('Hans-Böckler-Platz (HBP)', 'Bekannt als das „Ghetto von Wedel“, mit zentralem Spielplatz neben dem Ghetto-Netto. Ein legendärer Treffpunkt der Stadt, der allerlei Geschichten und lokale Mythen beherbergt.', 9, 53.56886654499687, 9.714682518103684, FALSE, '2003-09-02 00:00:00', '2003-09-02 00:00:00');

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