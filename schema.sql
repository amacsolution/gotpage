-- Tworzenie bazy danych
CREATE DATABASE IF NOT EXISTS ogloszenia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ;

-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  type ENUM('individual', 'business') NOT NULL DEFAULT 'individual',
  bio TEXT,
  phone VARCHAR(20),
  nip VARCHAR(10),
  avatar VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME
);

-- Tabela kategorii
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tabela ogłoszeń
CREATE TABLE IF NOT EXISTS ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255),
  price DECIMAL(10, 2),
  promoted BOOLEAN DEFAULT FALSE,
  promotion_end_date DATETIME,
  active BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela zdjęć ogłoszeń
CREATE TABLE IF NOT EXISTS ad_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);

-- Tabela opinii
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_id INT NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela polubień ogłoszeń
CREATE TABLE IF NOT EXISTS ad_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ad_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, ad_id)
);

-- Tabela komentarzy do ogłoszeń
CREATE TABLE IF NOT EXISTS ad_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ad_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);

-- Tabela zapisanych ogłoszeń
CREATE TABLE IF NOT EXISTS saved_ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ad_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, ad_id)
);

-- Tabela zgłoszeń ogłoszeń
CREATE TABLE IF NOT EXISTS ad_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ad_id INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);

-- Tabela zgłoszeń opinii
CREATE TABLE IF NOT EXISTS review_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  review_id INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Tabela wniosków o weryfikację firm
CREATE TABLE IF NOT EXISTS verification_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  documents_url TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela powiadomień
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wstawianie przykładowych kategorii
INSERT INTO categories (name) VALUES 
('Motoryzacja'),
('Nieruchomości'),
('Elektronika'),
('Moda'),
('Usługi'),
('Praca'),
('Dom i ogród'),
('Sport i hobby');

-- Wstawianie przykładowych podkategorii
INSERT INTO categories (name, parent_id) VALUES 
('Samochody osobowe', 1),
('Motocykle', 1),
('Części', 1),
('Mieszkania', 2),
('Domy', 2),
('Działki', 2),
('Telefony', 3),
('Komputery', 3),
('RTV', 3),
('Ubrania', 4),
('Buty', 4),
('Dodatki', 4),
('Remonty', 5),
('Transport', 5),
('Korepetycje', 5);

