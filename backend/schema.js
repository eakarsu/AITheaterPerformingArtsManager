const pool = require('./db');

const schema = `
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS concessions CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS venue_rentals CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS props CASCADE;
DROP TABLE IF EXISTS costumes CASCADE;
DROP TABLE IF EXISTS tech_production CASCADE;
DROP TABLE IF EXISTS rehearsals CASCADE;
DROP TABLE IF EXISTS cast_crew CASCADE;
DROP TABLE IF EXISTS auditions CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shows (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  playwright VARCHAR(255),
  genre VARCHAR(100),
  season VARCHAR(50),
  year INTEGER,
  director VARCHAR(255),
  status VARCHAR(100) DEFAULT 'Planning',
  budget DECIMAL(12,2),
  opening_date DATE,
  closing_date DATE,
  description TEXT,
  venue VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auditions (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  audition_date DATE,
  location VARCHAR(255),
  status VARCHAR(100) DEFAULT 'Scheduled',
  requirements TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cast_crew (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  person_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  union_status VARCHAR(50),
  pay_rate DECIMAL(10,2),
  start_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rehearsals (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  rehearsal_date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  type VARCHAR(100),
  notes TEXT,
  status VARCHAR(100) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tech_production (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  department VARCHAR(100),
  cue_number VARCHAR(50),
  description TEXT,
  timing VARCHAR(100),
  notes TEXT,
  status VARCHAR(100) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE costumes (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  character VARCHAR(255),
  size VARCHAR(50),
  color VARCHAR(100),
  condition VARCHAR(100) DEFAULT 'New',
  quantity INTEGER DEFAULT 1,
  storage_location VARCHAR(255),
  fitting_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE props (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  scene VARCHAR(100),
  description TEXT,
  source VARCHAR(100),
  status VARCHAR(100) DEFAULT 'Needed',
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  ticket_type VARCHAR(100),
  customer_name VARCHAR(255),
  email VARCHAR(255),
  performance_date DATE,
  seat_section VARCHAR(50),
  seat_number VARCHAR(20),
  price DECIMAL(10,2),
  payment_status VARCHAR(100) DEFAULT 'Pending',
  purchase_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE donors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  donation_amount DECIMAL(12,2),
  donation_date DATE,
  campaign VARCHAR(255),
  recognition_level VARCHAR(100),
  tax_receipt_sent VARCHAR(10) DEFAULT 'No',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE volunteers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(255),
  department VARCHAR(100),
  availability TEXT,
  skills TEXT,
  start_date DATE,
  hours_logged DECIMAL(8,2) DEFAULT 0,
  status VARCHAR(100) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venue_rentals (
  id SERIAL PRIMARY KEY,
  venue_name VARCHAR(255) NOT NULL,
  renter_name VARCHAR(255),
  renter_email VARCHAR(255),
  event_type VARCHAR(255),
  rental_date DATE,
  start_time TIME,
  end_time TIME,
  rental_fee DECIMAL(10,2),
  deposit_paid VARCHAR(20) DEFAULT 'No',
  status VARCHAR(100) DEFAULT 'Inquiry',
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  program_name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  instructor VARCHAR(255),
  age_group VARCHAR(100),
  max_enrollment INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  schedule TEXT,
  fee DECIMAL(10,2),
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE concessions (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  quantity_in_stock INTEGER DEFAULT 0,
  supplier VARCHAR(255),
  reorder_level INTEGER DEFAULT 10,
  show_id INTEGER REFERENCES shows(id) ON DELETE SET NULL,
  performance_date DATE,
  units_sold INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financial_reports (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE SET NULL,
  report_type VARCHAR(100),
  period VARCHAR(100),
  category VARCHAR(255),
  description TEXT,
  amount DECIMAL(12,2),
  date DATE,
  status VARCHAR(100) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function runSchema() {
  try {
    console.log('Creating database tables...');
    await pool.query(schema);
    console.log('All 15 tables created successfully.');
  } catch (err) {
    console.error('Error creating schema:', err.message);
  } finally {
    await pool.end();
  }
}

runSchema();
