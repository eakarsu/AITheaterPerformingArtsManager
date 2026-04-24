const pool = require('./db');

async function seed() {
  try {
    console.log('Seeding database...');

    // Users
    await pool.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('admin@theater.com', 'password123', 'Sarah Mitchell', 'admin'),
      ('director@theater.com', 'password123', 'James Thornton', 'director'),
      ('stage.manager@theater.com', 'password123', 'Rebecca Liu', 'stage_manager'),
      ('box.office@theater.com', 'password123', 'Marcus Williams', 'box_office')
    `);
    console.log('Users seeded.');

    // Shows
    await pool.query(`
      INSERT INTO shows (title, playwright, genre, season, year, director, status, budget, opening_date, closing_date, description, venue) VALUES
      ('A Streetcar Named Desire', 'Tennessee Williams', 'Drama', 'Fall', 2026, 'James Thornton', 'in_production', 85000.00, '2026-10-02', '2026-10-25', 'A haunting Southern Gothic masterpiece exploring desire, delusion, and the clash between old and new South.', 'Main Stage Theater'),
      ('The Importance of Being Earnest', 'Oscar Wilde', 'Comedy', 'Winter', 2026, 'Elena Vasquez', 'planned', 62000.00, '2026-12-05', '2026-12-22', 'Wilde''s sparkling comedy of manners about mistaken identities and the trivial matters of high society.', 'Main Stage Theater'),
      ('West Side Story', 'Arthur Laurents', 'Musical', 'Spring', 2027, 'David Kim', 'planned', 150000.00, '2027-03-14', '2027-04-13', 'The timeless musical retelling of Romeo and Juliet set among rival New York City gangs.', 'Grand Auditorium'),
      ('Hamlet', 'William Shakespeare', 'Drama', 'Summer', 2026, 'James Thornton', 'completed', 95000.00, '2026-06-01', '2026-06-28', 'Shakespeare''s greatest tragedy of a prince torn between duty and doubt.', 'Outdoor Amphitheater'),
      ('Chicago', 'Fred Ebb & Bob Fosse', 'Musical', 'Fall', 2026, 'Maria Santos', 'in_production', 130000.00, '2026-11-08', '2026-12-01', 'The razzle-dazzle musical satire of corruption, celebrity, and the justice system.', 'Grand Auditorium'),
      ('The Glass Menagerie', 'Tennessee Williams', 'Drama', 'Winter', 2027, 'Elena Vasquez', 'planned', 55000.00, '2027-01-17', '2027-02-08', 'A memory play about a fading Southern belle, her restless son, and painfully shy daughter.', 'Black Box Theater'),
      ('Noises Off', 'Michael Frayn', 'Comedy', 'Spring', 2026, 'Tom Bradley', 'completed', 48000.00, '2026-04-10', '2026-05-03', 'A hilarious play-within-a-play about a dysfunctional theater troupe.', 'Main Stage Theater'),
      ('Sweeney Todd', 'Stephen Sondheim', 'Musical', 'Fall', 2027, 'David Kim', 'planned', 140000.00, '2027-10-10', '2027-11-02', 'Sondheim''s dark masterpiece about the demon barber of Fleet Street.', 'Grand Auditorium'),
      ('Death of a Salesman', 'Arthur Miller', 'Drama', 'Spring', 2027, 'James Thornton', 'planned', 72000.00, '2027-04-18', '2027-05-11', 'Miller''s Pulitzer Prize-winning exploration of the American Dream and its discontents.', 'Main Stage Theater'),
      ('A Midsummer Night''s Dream', 'William Shakespeare', 'Comedy', 'Summer', 2027, 'Elena Vasquez', 'planned', 80000.00, '2027-07-04', '2027-07-27', 'Shakespeare''s enchanting comedy of love, magic, and mischief in an Athenian forest.', 'Outdoor Amphitheater'),
      ('Rent', 'Jonathan Larson', 'Musical', 'Winter', 2026, 'Maria Santos', 'in_production', 110000.00, '2026-11-28', '2026-12-20', 'A rock musical about struggling artists in New York''s East Village.', 'Grand Auditorium'),
      ('The Crucible', 'Arthur Miller', 'Drama', 'Fall', 2027, 'Tom Bradley', 'planned', 65000.00, '2027-09-12', '2027-10-05', 'Miller''s searing dramatization of the Salem witch trials as an allegory for McCarthyism.', 'Main Stage Theater'),
      ('Little Shop of Horrors', 'Howard Ashman', 'Musical', 'Summer', 2026, 'David Kim', 'completed', 75000.00, '2026-07-10', '2026-08-02', 'A comedy horror rock musical about a meek floral assistant and his man-eating plant.', 'Black Box Theater'),
      ('Our Town', 'Thornton Wilder', 'Drama', 'Spring', 2026, 'James Thornton', 'completed', 42000.00, '2026-03-06', '2026-03-29', 'Wilder''s Pulitzer-winning meditation on life, love, and death in small-town America.', 'Main Stage Theater'),
      ('Cabaret', 'Joe Masteroff', 'Musical', 'Winter', 2027, 'Maria Santos', 'planned', 125000.00, '2027-02-13', '2027-03-08', 'Set in 1931 Berlin as the Nazis rise to power, told through the lens of a seedy nightclub.', 'Grand Auditorium'),
      ('Waiting for Godot', 'Samuel Beckett', 'Drama', 'Fall', 2026, 'Elena Vasquez', 'planned', 38000.00, '2026-10-16', '2026-11-01', 'Beckett''s absurdist masterpiece about two men waiting endlessly for someone who never arrives.', 'Black Box Theater')
    `);
    console.log('Shows seeded.');

    // Auditions
    await pool.query(`
      INSERT INTO auditions (show_id, role_name, audition_date, location, status, requirements, notes) VALUES
      (1, 'Blanche DuBois', '2026-08-15', 'Rehearsal Room A', 'closed', 'Female, 30-45. Strong emotional range. Southern accent required.', 'Prepare two contrasting monologues.'),
      (1, 'Stanley Kowalski', '2026-08-15', 'Rehearsal Room A', 'closed', 'Male, 28-40. Physically imposing. Raw intensity needed.', 'Prepare scene from Act 1.'),
      (2, 'Jack Worthing', '2026-09-20', 'Main Stage Theater', 'open', 'Male, 25-40. Excellent comic timing. British RP accent.', 'Cold reads from Act 1 provided at audition.'),
      (2, 'Gwendolen Fairfax', '2026-09-20', 'Main Stage Theater', 'open', 'Female, 22-35. Sharp wit and poise.', 'Prepare a comedic monologue.'),
      (3, 'Tony', '2026-12-10', 'Grand Auditorium', 'open', 'Male, 18-28. Strong tenor voice. Dance experience required.', 'Prepare "Something''s Coming" and 16 bars of a ballad.'),
      (3, 'Maria', '2026-12-10', 'Grand Auditorium', 'open', 'Female, 17-25. Soprano. Latina actresses encouraged.', 'Prepare "I Feel Pretty" and a dramatic monologue.'),
      (3, 'Anita', '2026-12-10', 'Grand Auditorium', 'open', 'Female, 20-30. Strong mezzo. Exceptional dancer.', 'Prepare "A Boy Like That" and dance combination.'),
      (5, 'Roxie Hart', '2026-09-01', 'Rehearsal Room B', 'closed', 'Female, 25-40. Triple threat. Strong stage presence.', 'Prepare "Roxie" and dance audition.'),
      (5, 'Velma Kelly', '2026-09-01', 'Rehearsal Room B', 'closed', 'Female, 25-40. Alto/mezzo. Sultry and commanding.', 'Prepare "All That Jazz" and 32 bars of a jazz standard.'),
      (6, 'Amanda Wingfield', '2026-11-05', 'Black Box Theater', 'open', 'Female, 45-60. Southern charm masking desperation.', 'Prepare memory monologue from Act 1.'),
      (6, 'Tom Wingfield', '2026-11-05', 'Black Box Theater', 'open', 'Male, 22-35. Poetic sensibility. Restless energy.', 'Prepare opening narration.'),
      (8, 'Sweeney Todd', '2027-07-15', 'Grand Auditorium', 'open', 'Male, 35-55. Powerful baritone. Dark intensity.', 'Prepare "Epiphany" and a contrasting art song.'),
      (9, 'Willy Loman', '2027-02-01', 'Main Stage Theater', 'open', 'Male, 55-70. Deeply empathetic. Physical stamina required.', 'Prepare "attention must be paid" scene.'),
      (10, 'Puck', '2027-04-20', 'Outdoor Amphitheater', 'open', 'Any gender, 18-35. Athletic, mischievous, quick.', 'Prepare a Shakespearean comedic monologue.'),
      (12, 'John Proctor', '2027-06-15', 'Main Stage Theater', 'open', 'Male, 30-50. Moral conviction. Strong presence.', 'Prepare courtroom scene monologue.'),
      (15, 'Sally Bowles', '2026-11-20', 'Grand Auditorium', 'open', 'Female, 22-35. Alto. Charismatic and vulnerable.', 'Prepare "Maybe This Time" and a dance audition.')
    `);
    console.log('Auditions seeded.');

    // Cast & Crew
    await pool.query(`
      INSERT INTO cast_crew (show_id, person_name, role, department, position, email, phone, union_status, pay_rate, start_date) VALUES
      (1, 'Catherine Hartwell', 'Blanche DuBois', 'cast', 'Lead', 'c.hartwell@email.com', '555-0101', 'union', 1200.00, '2026-08-25'),
      (1, 'Michael Torres', 'Stanley Kowalski', 'cast', 'Lead', 'm.torres@email.com', '555-0102', 'union', 1200.00, '2026-08-25'),
      (1, 'Rebecca Liu', NULL, 'crew', 'Stage Manager', 'r.liu@email.com', '555-0103', 'union', 1000.00, '2026-08-20'),
      (1, 'Daniel Park', NULL, 'crew', 'Lighting Designer', 'd.park@email.com', '555-0104', 'union', 900.00, '2026-09-01'),
      (5, 'Jessica Moore', 'Roxie Hart', 'cast', 'Lead', 'j.moore@email.com', '555-0105', 'union', 1500.00, '2026-09-15'),
      (5, 'Vanessa Cruz', 'Velma Kelly', 'cast', 'Lead', 'v.cruz@email.com', '555-0106', 'union', 1500.00, '2026-09-15'),
      (5, 'Anthony Rizzo', 'Billy Flynn', 'cast', 'Lead', 'a.rizzo@email.com', '555-0107', 'union', 1400.00, '2026-09-15'),
      (5, 'Kevin O''Brien', NULL, 'crew', 'Sound Designer', 'k.obrien@email.com', '555-0108', 'union', 900.00, '2026-09-10'),
      (5, 'Sarah Nguyen', NULL, 'orchestra', 'Music Director', 's.nguyen@email.com', '555-0109', 'union', 1100.00, '2026-09-10'),
      (11, 'Jordan Blake', 'Roger Davis', 'cast', 'Lead', 'j.blake@email.com', '555-0110', 'non_union', 800.00, '2026-10-15'),
      (11, 'Aisha Johnson', 'Mimi Marquez', 'cast', 'Lead', 'a.johnson@email.com', '555-0111', 'union', 1000.00, '2026-10-15'),
      (11, 'Chris Yamamoto', NULL, 'crew', 'Set Designer', 'c.yamamoto@email.com', '555-0112', 'non_union', 750.00, '2026-10-01'),
      (1, 'Lisa Fontaine', 'Stella Kowalski', 'cast', 'Supporting', 'l.fontaine@email.com', '555-0113', 'union', 900.00, '2026-08-25'),
      (1, 'Robert Chen', NULL, 'crew', 'Props Master', 'r.chen@email.com', '555-0114', 'non_union', 650.00, '2026-09-01'),
      (5, 'Maria Delgado', NULL, 'crew', 'Choreographer', 'm.delgado@email.com', '555-0115', 'union', 1300.00, '2026-09-05'),
      (3, 'Timothy Walsh', NULL, 'orchestra', 'Conductor', 't.walsh@email.com', '555-0116', 'union', 1200.00, '2027-01-15')
    `);
    console.log('Cast & Crew seeded.');

    // Rehearsals
    await pool.query(`
      INSERT INTO rehearsals (show_id, title, rehearsal_date, start_time, end_time, location, type, notes, status) VALUES
      (1, 'Streetcar - Table Read', '2026-09-01', '18:00', '21:00', 'Rehearsal Room A', 'blocking', 'Full cast required. Bring scripts.', 'completed'),
      (1, 'Streetcar - Act 1 Blocking', '2026-09-03', '18:00', '22:00', 'Rehearsal Room A', 'blocking', 'Focus on Blanche arrival scene.', 'completed'),
      (1, 'Streetcar - Act 2 Blocking', '2026-09-05', '18:00', '22:00', 'Rehearsal Room A', 'blocking', 'Poker night scene.', 'completed'),
      (1, 'Streetcar - Full Run Through', '2026-09-20', '13:00', '17:00', 'Main Stage Theater', 'run_through', 'First full run. No stopping.', 'scheduled'),
      (1, 'Streetcar - Tech Rehearsal', '2026-09-27', '10:00', '22:00', 'Main Stage Theater', 'tech', 'Full tech with lighting and sound cues.', 'scheduled'),
      (1, 'Streetcar - Dress Rehearsal 1', '2026-09-29', '19:00', '22:00', 'Main Stage Theater', 'dress', 'Full costumes. Invited audience.', 'scheduled'),
      (5, 'Chicago - Dance Call', '2026-09-20', '10:00', '14:00', 'Dance Studio', 'dance', 'All That Jazz choreography.', 'completed'),
      (5, 'Chicago - Music Rehearsal', '2026-09-22', '18:00', '21:00', 'Music Room', 'music', 'Cell Block Tango vocal parts.', 'completed'),
      (5, 'Chicago - Blocking Act 1', '2026-09-25', '18:00', '22:00', 'Grand Auditorium', 'blocking', 'Full Act 1 staging.', 'scheduled'),
      (5, 'Chicago - Run Through', '2026-10-15', '13:00', '17:00', 'Grand Auditorium', 'run_through', 'Full run with orchestra.', 'scheduled'),
      (5, 'Chicago - Tech Rehearsal', '2026-11-01', '10:00', '22:00', 'Grand Auditorium', 'tech', 'Cue-to-cue. All departments.', 'scheduled'),
      (5, 'Chicago - Dress Rehearsal', '2026-11-05', '19:00', '22:00', 'Grand Auditorium', 'dress', 'Full dress with orchestra.', 'scheduled'),
      (11, 'Rent - Table Read', '2026-10-20', '18:00', '21:00', 'Rehearsal Room B', 'blocking', 'Meet and greet followed by read-through.', 'scheduled'),
      (11, 'Rent - Music Rehearsal 1', '2026-10-22', '18:00', '21:00', 'Music Room', 'music', 'Seasons of Love and La Vie Boheme.', 'scheduled'),
      (11, 'Rent - Dance Rehearsal', '2026-10-25', '10:00', '14:00', 'Dance Studio', 'dance', 'Tango Maureen choreography.', 'scheduled'),
      (3, 'West Side Story - Dance Audition Prep', '2027-01-20', '10:00', '16:00', 'Dance Studio', 'dance', 'Jerome Robbins choreography workshop.', 'scheduled')
    `);
    console.log('Rehearsals seeded.');

    // Tech Production
    await pool.query(`
      INSERT INTO tech_production (show_id, department, cue_number, description, timing, notes, status) VALUES
      (1, 'lighting', 'LX-001', 'House to half - pre-show', 'T-5 min', 'Warm wash at 50%', 'approved'),
      (1, 'lighting', 'LX-002', 'Blackout to scene 1 - Blanche arrival', '0:00:00', 'Blue wash exterior, warm interior amber', 'tested'),
      (1, 'lighting', 'LX-015', 'Poker night - overhead practicals', '0:45:00', 'Green felt table highlight, smoke haze', 'programmed'),
      (1, 'sound', 'SX-001', 'Pre-show jazz underscoring', 'T-10 min', 'New Orleans jazz playlist. Fade on LX-002.', 'approved'),
      (1, 'sound', 'SX-005', 'Streetcar sound effect', '0:02:30', 'Distant streetcar bell and rumble. Stage left speaker.', 'tested'),
      (1, 'set', 'SET-001', 'Kowalski apartment - full stage', 'Pre-show', 'Two-room shotgun apartment. Scrim for exterior.', 'approved'),
      (5, 'lighting', 'LX-001', 'Overture - house to black', '0:00:00', 'Fast blackout. Follow spot ready center.', 'programmed'),
      (5, 'lighting', 'LX-010', 'Cell Block Tango - six pools', '0:22:00', 'Six isolated specials in red. Slow crossfade.', 'programmed'),
      (5, 'sound', 'SX-001', 'Orchestra pit levels', 'Pre-show', 'Brass at -3dB. Balance check with MD.', 'tested'),
      (5, 'sound', 'SX-008', 'Gunshot effect', '0:05:00', 'Stage right speaker. Reverb tail 2 seconds.', 'programmed'),
      (5, 'set', 'SET-001', 'Jail cell unit set', 'Pre-show', 'Rolling jail bars. Quick change to courtroom.', 'planned'),
      (5, 'projections', 'PJ-001', 'Newspaper headlines montage', '0:03:00', 'Rear projection. Headlines scroll upward.', 'planned'),
      (11, 'lighting', 'LX-001', 'Seasons of Love - full stage wash', '0:00:00', 'Warm amber full stage. Slow build.', 'planned'),
      (11, 'sound', 'SX-001', 'Roger''s guitar amp setup', 'Pre-show', 'Stage right amp. Monitor mix for vocals.', 'planned'),
      (11, 'set', 'SET-001', 'Loft apartment scaffolding', 'Pre-show', 'Two-level scaffold unit. Safety rails required.', 'planned'),
      (1, 'projections', 'PJ-001', 'Opening title card', '0:00:00', 'Streetcar route map projection on scrim.', 'tested')
    `);
    console.log('Tech Production seeded.');

    // Costumes
    await pool.query(`
      INSERT INTO costumes (show_id, item_name, character, size, color, condition, quantity, storage_location, fitting_date, notes) VALUES
      (1, 'White silk dress', 'Blanche DuBois', 'Size 6', 'White/ivory', 'new', 1, 'Costume Shop Rack A', '2026-09-10', 'Custom built. Fragile fabric.'),
      (1, 'Stained t-shirt', 'Stanley Kowalski', 'Large', 'White', 'good', 3, 'Costume Shop Rack A', '2026-09-10', 'Pre-distressed. Need multiples for sweat.'),
      (1, 'Floral house dress', 'Stella Kowalski', 'Size 8', 'Pink floral', 'new', 1, 'Costume Shop Rack A', '2026-09-10', '1940s style. Period accurate.'),
      (5, 'Black sequin leotard', 'Roxie Hart', 'Size 4', 'Black', 'new', 2, 'Costume Shop Rack C', '2026-10-01', 'Stretch fabric for dance numbers.'),
      (5, 'Red fringe dress', 'Velma Kelly', 'Size 6', 'Red', 'new', 1, 'Costume Shop Rack C', '2026-10-01', 'All That Jazz costume. Heavy fringe.'),
      (5, 'Pinstripe suit', 'Billy Flynn', 'Size 42R', 'Navy pinstripe', 'new', 1, 'Costume Shop Rack C', '2026-10-01', '1920s cut. Wide lapels.'),
      (5, 'Chorus stockings', 'Ensemble', 'Various', 'Black fishnet', 'new', 20, 'Costume Shop Drawer 5', '2026-10-05', 'Bulk order. Multiple sizes.'),
      (11, 'Leather jacket', 'Roger Davis', 'Medium', 'Black', 'good', 1, 'Costume Shop Rack D', '2026-10-25', 'Vintage look. Distressed.'),
      (11, 'Striped scarf', 'Mark Cohen', 'One size', 'Blue/gray stripe', 'new', 1, 'Costume Shop Rack D', '2026-10-25', 'Iconic character piece.'),
      (1, 'Paper lantern shade', 'Blanche DuBois', 'N/A', 'Pink', 'new', 3, 'Prop Storage B', '2026-09-08', 'Prop/costume crossover. Fragile.'),
      (4, 'Black doublet', 'Hamlet', 'Size 40R', 'Black', 'good', 1, 'Costume Storage Bin 12', '2026-05-10', 'Returned from cleaning.'),
      (4, 'Royal purple cloak', 'Claudius', 'One size', 'Purple', 'fair', 1, 'Costume Storage Bin 12', '2026-05-10', 'Hem needs repair.'),
      (13, 'Green plant costume', 'Audrey II (Stage 3)', 'Oversized', 'Green', 'good', 1, 'Prop Storage Large', '2026-06-20', 'Puppet/costume hybrid. Needs two operators.'),
      (5, 'White courtroom dress', 'Roxie Hart', 'Size 4', 'White', 'new', 1, 'Costume Shop Rack C', '2026-10-01', 'Innocent look for trial scene.'),
      (3, 'Purple gang jacket', 'Jets Ensemble', 'Various', 'Purple', 'new', 12, 'Costume Shop Rack E', '2027-02-01', 'Custom embroidered. Rush order needed.'),
      (1, 'Bowling shirt', 'Mitch', 'XL', 'Blue', 'good', 1, 'Costume Shop Rack A', '2026-09-12', '1940s casual. Slightly rumpled.')
    `);
    console.log('Costumes seeded.');

    // Props
    await pool.query(`
      INSERT INTO props (show_id, item_name, scene, description, source, status, cost, notes) VALUES
      (1, 'Trunk and suitcases', 'Act 1 Scene 1', 'Blanche''s arrival luggage. Vintage 1940s style.', 'rented', 'on_stage', 150.00, 'Rented from Period Props Inc. Return by Nov 1.'),
      (1, 'Poker chips and cards', 'Act 1 Scene 3', 'Full poker set with period-appropriate cards.', 'owned', 'on_stage', 35.00, 'In house stock.'),
      (1, 'Paper lantern', 'Act 1 Scene 2', 'Chinese paper lantern Blanche places over bare bulb.', 'built', 'on_stage', 15.00, 'Built by props department. Very fragile.'),
      (1, 'Whiskey bottle and glasses', 'Multiple', 'Period bourbon bottle. 4 mismatched glasses.', 'owned', 'on_stage', 20.00, 'Use tea for whiskey color.'),
      (5, 'Courtroom gavel', 'Act 2', 'Wooden gavel for trial scene.', 'owned', 'acquired', 25.00, 'From stock.'),
      (5, 'Diary/journal', 'Act 1', 'Roxie''s diary. Aged paper effect.', 'built', 'on_stage', 10.00, 'Hand-distressed by props team.'),
      (5, 'Newspaper props', 'Multiple', 'Custom printed 1920s Chicago Tribune replicas.', 'built', 'on_stage', 45.00, 'Print 30 copies for run.'),
      (11, 'Electric guitar (practical)', 'Multiple', 'Fender Stratocaster for Roger. Must be playable.', 'rented', 'acquired', 200.00, 'Rented from Music Center. Insurance required.'),
      (11, 'Film camera', 'Multiple', 'Vintage 16mm film camera for Mark.', 'borrowed', 'acquired', 0.00, 'Borrowed from Film Studies department.'),
      (11, 'Candles (LED)', 'Act 2', 'LED candles for power outage scenes.', 'owned', 'needed', 30.00, 'Order flickering LED type.'),
      (4, 'Skull (Yorick)', 'Act 5 Scene 1', 'Realistic resin skull for graveyard scene.', 'owned', 'returned', 45.00, 'Cleaned and stored.'),
      (4, 'Rapiers (2)', 'Act 5 Scene 2', 'Stage combat rapiers. Blunted tips.', 'owned', 'returned', 300.00, 'Inspected and stored. Good condition.'),
      (13, 'Oversized dentist chair', 'Multiple', 'Prop dentist chair for Orin''s office.', 'built', 'returned', 200.00, 'Stored in scene shop.'),
      (1, 'Meat package (wrapped)', 'Act 1 Scene 1', 'Stanley''s package of meat from the butcher.', 'built', 'on_stage', 5.00, 'New one each performance. Wrapped foam.'),
      (5, 'Guns (2)', 'Act 1', 'Stage pistol for Roxie and Velma murders. Flash only.', 'owned', 'on_stage', 0.00, 'Weapons check before every performance. Locked storage.'),
      (3, 'Switchblade knives (retractable)', 'Multiple', 'Retractable stage knives for rumble scene.', 'rented', 'needed', 180.00, 'Safety training required for all cast.')
    `);
    console.log('Props seeded.');

    // Tickets
    await pool.query(`
      INSERT INTO tickets (show_id, ticket_type, customer_name, email, performance_date, seat_section, seat_number, price, payment_status, purchase_date) VALUES
      (1, 'single', 'Margaret Thompson', 'mthompson@email.com', '2026-10-02', 'Orchestra', 'A-14', 65.00, 'paid', '2026-08-15'),
      (1, 'single', 'David Rothstein', 'drothstein@email.com', '2026-10-02', 'Orchestra', 'B-7', 65.00, 'paid', '2026-08-20'),
      (1, 'subscription', 'Eleanor Vance', 'evance@email.com', '2026-10-03', 'Mezzanine', 'M-12', 50.00, 'paid', '2026-06-01'),
      (1, 'group', 'Lincoln High School', 'drama@lincolnhs.edu', '2026-10-10', 'Balcony', 'C-1', 35.00, 'paid', '2026-09-01'),
      (1, 'comp', 'Theater Monthly Magazine', 'reviews@theatermonthly.com', '2026-10-02', 'Orchestra', 'D-1', 0.00, 'paid', '2026-09-25'),
      (5, 'single', 'Patricia Nakamura', 'pnakamura@email.com', '2026-11-08', 'Orchestra', 'A-8', 85.00, 'paid', '2026-09-10'),
      (5, 'single', 'James McAllister', 'jmcallister@email.com', '2026-11-08', 'Orchestra', 'A-9', 85.00, 'paid', '2026-09-10'),
      (5, 'subscription', 'Robert and Linda Chen', 'chenrl@email.com', '2026-11-15', 'Mezzanine', 'M-5', 70.00, 'paid', '2026-06-01'),
      (5, 'group', 'Downtown Rotary Club', 'events@rotarydowntown.org', '2026-11-22', 'Balcony', 'B-1', 55.00, 'pending', '2026-10-01'),
      (11, 'single', 'Sophie Martinez', 'smartinez@email.com', '2026-11-28', 'General', 'GA', 45.00, 'paid', '2026-10-15'),
      (11, 'single', 'Ahmed Hassan', 'ahassan@email.com', '2026-12-05', 'General', 'GA', 45.00, 'paid', '2026-10-20'),
      (1, 'single', 'Karen O''Malley', 'komalley@email.com', '2026-10-17', 'Orchestra', 'C-22', 65.00, 'refunded', '2026-08-25'),
      (5, 'single', 'William Foster', 'wfoster@email.com', '2026-11-29', 'Orchestra', 'B-15', 85.00, 'pending', '2026-10-28'),
      (1, 'subscription', 'Helen Mirowski', 'hmirowski@email.com', '2026-10-24', 'Orchestra', 'A-20', 50.00, 'paid', '2026-06-01'),
      (5, 'comp', 'City Arts Council', 'director@cityarts.gov', '2026-11-08', 'Orchestra', 'A-1', 0.00, 'paid', '2026-10-15'),
      (11, 'group', 'State University Theater Dept', 'theater@stateuni.edu', '2026-12-12', 'General', 'GA', 35.00, 'pending', '2026-11-01')
    `);
    console.log('Tickets seeded.');

    // Donors
    await pool.query(`
      INSERT INTO donors (name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes) VALUES
      ('Margaret and Harold Worthington', 'individual', 'worthington@email.com', '555-1001', '450 Park Avenue, Suite 12', 25000.00, '2026-01-15', 'Annual Fund 2026', 'platinum', true, 'Naming rights for lobby. Long-time patrons.'),
      ('First National Bank', 'corporate', 'community@firstnational.com', '555-1002', '100 Main Street', 15000.00, '2026-02-01', 'Season Sponsor 2026', 'gold', true, 'Logo on all programs. Season sponsor.'),
      ('The Morrison Foundation', 'foundation', 'grants@morrisonfound.org', '555-1003', '200 Foundation Way', 50000.00, '2026-03-01', 'Capital Campaign', 'platinum', true, 'Multi-year grant. Education focus.'),
      ('Dr. Susan Chen', 'individual', 'susanchen@email.com', '555-1004', '88 Elm Street', 5000.00, '2026-04-15', 'Annual Fund 2026', 'gold', true, 'Requests two comp tickets per show.'),
      ('Johnson & Reeves Law Firm', 'corporate', 'marketing@jrlaw.com', '555-1005', '500 Legal Plaza', 10000.00, '2026-01-30', 'Season Sponsor 2026', 'gold', true, 'Program ad - full page.'),
      ('Thomas Blackwell', 'individual', 'tblackwell@email.com', '555-1006', '12 Maple Drive', 1000.00, '2026-05-10', 'Annual Fund 2026', 'silver', true, 'Board member.'),
      ('City Arts Foundation', 'foundation', 'director@cityartsfound.org', '555-1007', '75 Arts Center Blvd', 35000.00, '2026-06-01', 'Education Outreach', 'platinum', true, 'Restricted to youth education programs.'),
      ('Maria and Luis Fernandez', 'individual', 'fernandez.family@email.com', '555-1008', '234 Oak Lane', 2500.00, '2026-03-20', 'Annual Fund 2026', 'silver', true, 'Dedicated to diversity initiatives.'),
      ('Apex Technology Solutions', 'corporate', 'csr@apextech.com', '555-1009', '1000 Tech Park Drive', 7500.00, '2026-04-01', 'Season Sponsor 2026', 'gold', false, 'In-kind AV equipment donation too.'),
      ('Eleanor Vance', 'individual', 'evance@email.com', '555-1010', '67 Cedar Court', 500.00, '2026-07-01', 'Summer Series', 'bronze', true, 'Monthly recurring donor.'),
      ('Regional Arts Council', 'foundation', 'grants@regionalartscouncil.org', '555-1011', '300 Government Center', 20000.00, '2026-02-15', 'Operating Support', 'platinum', true, 'Annual operating grant. Report due Dec 31.'),
      ('Pizza Palace Downtown', 'corporate', 'owner@pizzapalace.com', '555-1012', '55 Broadway', 500.00, '2026-08-01', 'Program Ads', 'bronze', false, 'Quarter page ad. Catering discount offered.'),
      ('The Harrington Estate', 'individual', 'executor@harringtontrust.com', '555-1013', '1 Estate Drive', 100000.00, '2026-01-05', 'Capital Campaign', 'platinum', true, 'Bequest. Name on new rehearsal hall.'),
      ('Sandra and Michael Kim', 'individual', 'thekim@email.com', '555-1014', '890 Pine Street', 3000.00, '2026-09-01', 'Annual Fund 2026', 'silver', false, 'New donors. Came through gala.'),
      ('Valley Credit Union', 'corporate', 'community@valleycu.com', '555-1015', '400 Valley Road', 5000.00, '2026-05-15', 'Youth Program Sponsor', 'gold', true, 'Sponsor summer youth camp.'),
      ('Dorothy Kensington', 'individual', 'dkensington@email.com', '555-1016', '22 Rose Garden Lane', 1500.00, '2026-06-20', 'Annual Fund 2026', 'silver', true, 'Volunteer and donor. Prefers balcony seats.')
    `);
    console.log('Donors seeded.');

    // Volunteers
    await pool.query(`
      INSERT INTO volunteers (name, email, phone, role, department, availability, skills, start_date, hours_logged, status, notes) VALUES
      ('Nancy Patterson', 'npatterson@email.com', '555-2001', 'Usher Captain', 'Front of House', 'Weekends, Friday evenings', 'Customer service, team leadership', '2024-09-01', 245.50, 'active', 'Reliable. 3rd season volunteering.'),
      ('Greg Holloway', 'gholloway@email.com', '555-2002', 'Set Construction', 'Scene Shop', 'Saturdays 9am-5pm', 'Carpentry, painting, power tools', '2025-01-15', 180.00, 'active', 'Retired contractor. Excellent skills.'),
      ('Priya Sharma', 'psharma@email.com', '555-2003', 'Box Office Assistant', 'Box Office', 'Tues/Thurs evenings', 'Data entry, customer service, bilingual Hindi/English', '2025-06-01', 95.00, 'active', 'College student. Very organized.'),
      ('Bill McKenzie', 'bmckenzie@email.com', '555-2004', 'Usher', 'Front of House', 'Friday/Saturday evenings', 'Friendly demeanor', '2026-01-10', 42.00, 'active', 'Retired teacher. New volunteer.'),
      ('Jennifer Okafor', 'jokafor@email.com', '555-2005', 'Costume Assistant', 'Costumes', 'Weekdays 10am-2pm', 'Sewing, alterations, pattern making', '2024-03-01', 320.00, 'active', 'Professional seamstress. Invaluable.'),
      ('Tyler Ramos', 'tramos@email.com', '555-2006', 'Social Media', 'Marketing', 'Remote, flexible', 'Photography, Instagram, TikTok, graphic design', '2025-09-01', 110.00, 'active', 'Creates great content. Film student.'),
      ('Dorothy Kensington', 'dkensington@email.com', '555-2007', 'Gala Committee', 'Development', 'Monthly meetings, event days', 'Event planning, community connections', '2023-06-01', 150.00, 'active', 'Also a donor. Excellent networker.'),
      ('Kevin Wu', 'kwu@email.com', '555-2008', 'Technical Assistant', 'Technical', 'Weekends', 'Basic lighting, sound board operation', '2025-08-01', 85.00, 'active', 'Engineering student. Quick learner.'),
      ('Martha Collins', 'mcollins@email.com', '555-2009', 'Usher', 'Front of House', 'Sunday matinees', 'Warm personality', '2025-03-01', 55.00, 'active', 'Only available Sundays.'),
      ('Alan Fitzgerald', 'afitzgerald@email.com', '555-2010', 'Props Assistant', 'Props', 'Flexible weekdays', 'Woodworking, painting, sculpting', '2024-11-01', 200.00, 'active', 'Artist. Great at aging and distressing.'),
      ('Rosa Jimenez', 'rjimenez@email.com', '555-2011', 'Translator', 'Education', 'As needed', 'Bilingual Spanish/English, teaching', '2025-10-01', 30.00, 'active', 'Helps with bilingual program materials.'),
      ('Derek Stone', 'dstone@email.com', '555-2012', 'Parking Attendant', 'Front of House', 'Performance nights', 'Traffic management', '2026-02-01', 20.00, 'active', 'New. Handles parking lot.'),
      ('Samantha Lee', 'slee@email.com', '555-2013', 'Office Assistant', 'Administration', 'Mon/Wed/Fri mornings', 'Filing, phone, data entry', '2025-01-01', 275.00, 'active', 'Very dependable. Knows the office well.'),
      ('Mike DeLuca', 'mdeluca@email.com', '555-2014', 'Concessions', 'Front of House', 'Performance nights', 'Cash handling, food service', '2025-09-15', 60.00, 'inactive', 'On hiatus until January.'),
      ('Hannah Yoon', 'hyoon@email.com', '555-2015', 'Education Assistant', 'Education', 'Summer weekdays', 'Teaching, child care, dance', '2025-06-15', 120.00, 'active', 'Dance teacher. Helps with summer camps.'),
      ('Frank Moretti', 'fmoretti@email.com', '555-2016', 'Maintenance', 'Facilities', 'Saturdays', 'Plumbing, electrical, general repair', '2024-07-01', 190.00, 'active', 'Retired plumber. Fixes everything.')
    `);
    console.log('Volunteers seeded.');

    // Venue Rentals
    await pool.query(`
      INSERT INTO venue_rentals (venue_name, renter_name, renter_email, event_type, rental_date, start_time, end_time, rental_fee, deposit_paid, status, special_requirements) VALUES
      ('Grand Auditorium', 'Springfield Symphony Orchestra', 'events@springsymphony.org', 'Concert', '2026-10-05', '14:00', '22:00', 3500.00, true, 'confirmed', 'Full orchestra pit. Piano tuning required day of event.'),
      ('Main Stage Theater', 'City Ballet Company', 'admin@cityballet.org', 'Dance Performance', '2026-11-02', '10:00', '22:00', 2800.00, true, 'confirmed', 'Marley dance floor required. No rosin on stage.'),
      ('Black Box Theater', 'Spoken Word Collective', 'bookings@spokenword.com', 'Poetry Slam', '2026-10-12', '18:00', '23:00', 800.00, true, 'confirmed', 'Minimal lighting. Two microphones. Cash bar setup.'),
      ('Grand Auditorium', 'Lincoln High School', 'principal@lincolnhs.edu', 'Graduation Ceremony', '2026-06-15', '09:00', '15:00', 2500.00, true, 'completed', '800 seats. Podium with microphone. Projection screen.'),
      ('Main Stage Theater', 'Regional One-Act Festival', 'director@oneactfest.org', 'Theater Festival', '2027-01-18', '08:00', '23:00', 3000.00, false, 'inquiry', 'Full day. 6 groups need backstage access. Tech rider pending.'),
      ('Black Box Theater', 'Amanda Reed Photography', 'amanda@reedphoto.com', 'Photo Shoot', '2026-10-20', '09:00', '13:00', 400.00, false, 'inquiry', 'Fashion editorial. Need fog machine and colored gels.'),
      ('Outdoor Amphitheater', 'Jazz Under the Stars LLC', 'info@jazzunderstars.com', 'Concert Series', '2027-07-12', '17:00', '22:00', 2000.00, false, 'inquiry', 'Weather contingency plan needed. Portable sound system.'),
      ('Grand Auditorium', 'TechConf Regional', 'events@techconf.io', 'Corporate Conference', '2027-02-08', '07:00', '18:00', 4500.00, true, 'confirmed', 'Projection, WiFi, 6 breakout spaces, catering area.'),
      ('Main Stage Theater', 'Community Gospel Choir', 'pastor@faithchurch.org', 'Gospel Concert', '2026-12-14', '15:00', '21:00', 1800.00, true, 'confirmed', 'Choir risers for 40. Piano and organ.'),
      ('Black Box Theater', 'Young Playwrights Workshop', 'education@theateralliance.org', 'Staged Readings', '2026-11-09', '13:00', '18:00', 500.00, true, 'confirmed', 'Minimal set. Music stands for scripts. 5 readings.'),
      ('Outdoor Amphitheater', 'City Parks Department', 'events@cityparks.gov', 'Movies in the Park', '2027-08-02', '19:00', '23:00', 1200.00, false, 'inquiry', 'Inflatable screen rental. Extension cord access.'),
      ('Grand Auditorium', 'Elena Vasquez Dance Academy', 'elena@vasquezdance.com', 'Student Recital', '2027-05-24', '13:00', '20:00', 2200.00, false, 'inquiry', 'Two performances. Marley floor. Dressing rooms for 60 students.'),
      ('Main Stage Theater', 'Corporate Training Inc.', 'bookings@corptraining.com', 'Corporate Event', '2027-03-05', '08:00', '17:00', 2500.00, true, 'confirmed', 'Theater-style seating. Presentation setup. Lunch break catering.'),
      ('Black Box Theater', 'Local Improv Troupe', 'laughs@improvnight.com', 'Comedy Night', '2026-10-24', '19:00', '23:00', 600.00, true, 'confirmed', 'Cabaret seating. Bar service. Two wireless mics.'),
      ('Grand Auditorium', 'State Debate Championship', 'coordinator@statedebate.org', 'Competition', '2027-04-12', '08:00', '20:00', 3000.00, false, 'inquiry', 'Main stage + 4 breakout rooms. Timing equipment.'),
      ('Outdoor Amphitheater', 'Shakespeare in the Park Co.', 'director@shakeinpark.org', 'Theater Performance', '2027-06-28', '18:00', '22:00', 1500.00, false, 'inquiry', 'Portable lighting rig. Dressing tent area. Rain date July 5.')
    `);
    console.log('Venue Rentals seeded.');

    // Education
    await pool.query(`
      INSERT INTO education (program_name, type, instructor, age_group, max_enrollment, current_enrollment, start_date, end_date, schedule, fee, location, description) VALUES
      ('Summer Youth Theater Camp', 'camp', 'Maria Santos', '8-14', 30, 28, '2026-06-22', '2026-07-03', 'Mon-Fri 9am-3pm', 450.00, 'Main Stage Theater', 'Two-week intensive culminating in a showcase performance of scenes from Disney musicals.'),
      ('Teen Musical Theater Intensive', 'camp', 'David Kim', '14-18', 25, 22, '2026-07-06', '2026-07-24', 'Mon-Fri 10am-4pm', 650.00, 'Grand Auditorium', 'Three-week intensive covering voice, dance, and acting for musical theater. Final showcase.'),
      ('Introduction to Acting', 'class', 'James Thornton', '18+', 20, 18, '2026-09-10', '2026-11-19', 'Thursdays 7-9pm', 275.00, 'Rehearsal Room A', '10-week course covering Stanislavski basics, scene study, and monologue preparation.'),
      ('Stage Combat Workshop', 'workshop', 'Michael Torres', '16+', 15, 12, '2026-10-03', '2026-10-03', 'Saturday 10am-4pm', 85.00, 'Dance Studio', 'One-day workshop covering unarmed combat, falls, and basic sword technique for the stage.'),
      ('Playwriting Lab', 'class', 'Elena Vasquez', '18+', 12, 10, '2026-09-15', '2026-12-08', 'Tuesdays 7-9:30pm', 325.00, 'Black Box Theater', '12-week course. Write a one-act play. Final readings performed by acting students.'),
      ('Broadway Babies', 'class', 'Hannah Yoon', '4-7', 15, 15, '2026-09-12', '2026-11-14', 'Saturdays 10-11am', 180.00, 'Dance Studio', 'Introduction to musical theater for little ones. Movement, singing, and creative play.'),
      ('Audition Techniques Masterclass', 'masterclass', 'Catherine Hartwell', '18+', 20, 16, '2026-11-14', '2026-11-14', 'Saturday 1-5pm', 95.00, 'Main Stage Theater', 'Professional actress shares audition strategies, cold reading techniques, and callback preparation.'),
      ('Set Design Basics', 'workshop', 'Chris Yamamoto', '16+', 12, 8, '2026-10-17', '2026-10-18', 'Sat-Sun 10am-3pm', 120.00, 'Scene Shop', 'Weekend workshop covering drafting, model building, and design principles for theater sets.'),
      ('Voice for the Stage', 'class', 'Sarah Nguyen', '16+', 15, 13, '2026-09-14', '2026-11-16', 'Mondays 6-8pm', 250.00, 'Music Room', '10-week vocal technique class. Breath support, projection, diction, and repertoire selection.'),
      ('Lighting Design Crash Course', 'workshop', 'Daniel Park', '18+', 10, 7, '2026-11-07', '2026-11-08', 'Sat-Sun 9am-5pm', 150.00, 'Main Stage Theater', 'Hands-on weekend workshop. Learn ETC board programming, color theory, and plot design.'),
      ('Shakespeare for Young Actors', 'camp', 'Tom Bradley', '10-16', 20, 14, '2026-07-27', '2026-08-07', 'Mon-Fri 10am-3pm', 400.00, 'Outdoor Amphitheater', 'Two-week camp exploring Shakespeare through games, scenes, and a final performance.'),
      ('Costume Construction 101', 'workshop', 'Jennifer Okafor', '18+', 8, 6, '2026-10-24', '2026-10-25', 'Sat-Sun 10am-4pm', 110.00, 'Costume Shop', 'Weekend workshop. Basic sewing, pattern reading, fabric selection, and period costume overview.'),
      ('Improv Comedy for Everyone', 'class', 'Tom Bradley', '16+', 18, 17, '2026-09-16', '2026-11-18', 'Wednesdays 7-9pm', 225.00, 'Black Box Theater', '10-week improv course. Yes-and, scene building, character work, and short form games.'),
      ('Stage Management Bootcamp', 'workshop', 'Rebecca Liu', '18+', 10, 9, '2026-11-21', '2026-11-22', 'Sat-Sun 9am-5pm', 140.00, 'Rehearsal Room A', 'Intensive two-day workshop covering prompt books, calling cues, and production management.'),
      ('Winter Break Drama Camp', 'camp', 'Maria Santos', '8-14', 25, 0, '2026-12-28', '2027-01-02', 'Mon-Fri 9am-3pm', 350.00, 'Black Box Theater', 'Holiday camp with theater games, scene work, and a New Year showcase.'),
      ('Musical Theater Dance', 'class', 'Maria Delgado', '14+', 20, 18, '2026-09-11', '2026-11-13', 'Fridays 5-7pm', 250.00, 'Dance Studio', '10-week course in jazz, theater dance, and choreography from classic and contemporary musicals.')
    `);
    console.log('Education seeded.');

    // Concessions
    await pool.query(`
      INSERT INTO concessions (item_name, category, price, cost, quantity_in_stock, supplier, reorder_level, show_id, performance_date, units_sold, revenue) VALUES
      ('House Red Wine (glass)', 'beverage', 9.00, 3.50, 120, 'Valley Vineyard Distributors', 30, 1, '2026-10-02', 45, 405.00),
      ('House White Wine (glass)', 'beverage', 9.00, 3.50, 100, 'Valley Vineyard Distributors', 30, 1, '2026-10-02', 38, 342.00),
      ('Craft Beer (bottle)', 'beverage', 8.00, 3.00, 80, 'Local Brew Supply Co.', 24, 1, '2026-10-02', 30, 240.00),
      ('Sparkling Water', 'beverage', 4.00, 1.00, 200, 'Metro Beverage Wholesale', 50, 1, '2026-10-02', 55, 220.00),
      ('Gourmet Brownie', 'snack', 5.00, 1.75, 60, 'Sweet Spot Bakery', 15, 1, '2026-10-02', 40, 200.00),
      ('Assorted Cookie Pack', 'snack', 4.00, 1.25, 75, 'Sweet Spot Bakery', 20, 1, '2026-10-02', 35, 140.00),
      ('Mixed Nuts Cup', 'snack', 3.50, 1.00, 50, 'Metro Beverage Wholesale', 15, 5, '2026-11-08', 0, 0.00),
      ('Show Program', 'program', 7.00, 2.50, 300, 'QuickPrint Graphics', 50, 1, '2026-10-02', 120, 840.00),
      ('Show Poster (signed)', 'merchandise', 25.00, 8.00, 50, 'QuickPrint Graphics', 10, 1, '2026-10-02', 15, 375.00),
      ('Theater Logo T-Shirt', 'merchandise', 30.00, 12.00, 80, 'Custom Threads Apparel', 15, NULL, NULL, 22, 660.00),
      ('Theater Tote Bag', 'merchandise', 18.00, 6.00, 60, 'Custom Threads Apparel', 15, NULL, NULL, 18, 324.00),
      ('Bottled Water', 'beverage', 3.00, 0.75, 150, 'Metro Beverage Wholesale', 40, 5, '2026-11-08', 0, 0.00),
      ('Dark Chocolate Bar', 'snack', 4.50, 1.50, 45, 'Artisan Chocolate Co.', 12, 5, '2026-11-08', 0, 0.00),
      ('Coffee (hot)', 'beverage', 4.00, 0.80, 100, 'Metro Beverage Wholesale', 25, 1, '2026-10-02', 50, 200.00),
      ('Season Brochure', 'program', 0.00, 1.50, 500, 'QuickPrint Graphics', 100, NULL, NULL, 200, 0.00),
      ('Cast Recording CD', 'merchandise', 15.00, 5.00, 30, 'In-house Recording', 10, 4, NULL, 25, 375.00)
    `);
    console.log('Concessions seeded.');

    // Financial Reports
    await pool.query(`
      INSERT INTO financial_reports (show_id, report_type, period, category, description, amount, date, status, notes) VALUES
      (1, 'production_budget', 'Fall 2026', 'Production', 'A Streetcar Named Desire - Total production budget', 85000.00, '2026-08-01', 'approved', 'Board approved August 1.'),
      (1, 'expense', 'October 2026', 'Scenery', 'Set construction materials and labor', 18500.00, '2026-10-01', 'final', 'Kowalski apartment set. Includes scrim.'),
      (1, 'expense', 'October 2026', 'Costumes', 'Costume construction and rental', 6200.00, '2026-10-01', 'final', '12 costumes. 3 custom built.'),
      (1, 'revenue', 'October 2026', 'Ticket Sales', 'Opening weekend box office revenue', 12750.00, '2026-10-05', 'draft', 'Estimate based on current sales.'),
      (5, 'production_budget', 'Fall 2026', 'Production', 'Chicago - Total production budget', 130000.00, '2026-08-15', 'approved', 'Includes orchestra costs.'),
      (5, 'expense', 'September 2026', 'Royalties', 'Licensing and royalty fees for Chicago', 8500.00, '2026-09-01', 'final', 'MTI licensing agreement.'),
      (11, 'production_budget', 'Winter 2026', 'Production', 'Rent - Total production budget', 110000.00, '2026-09-01', 'approved', 'Includes band costs.'),
      (4, 'revenue', 'Summer 2026', 'Ticket Sales', 'Hamlet - Total ticket revenue', 45200.00, '2026-07-01', 'final', '85% capacity average. Strong run.'),
      (4, 'expense', 'Summer 2026', 'Total Production', 'Hamlet - Total production expenses', 82300.00, '2026-07-01', 'final', 'Under budget by $12,700.'),
      (NULL, 'season_summary', 'FY 2025-2026', 'Summary', 'Full season financial summary', 0.00, '2026-08-31', 'draft', 'Pending final show accounting.'),
      (NULL, 'payroll', 'October 2026', 'Staff Salaries', 'Monthly staff payroll - all departments', 45000.00, '2026-10-15', 'approved', 'Includes 8 full-time staff.'),
      (NULL, 'payroll', 'October 2026', 'Artist Contracts', 'Guest artist and contract performer pay', 22000.00, '2026-10-15', 'approved', 'Streetcar and Chicago casts.'),
      (13, 'revenue', 'Summer 2026', 'Ticket Sales', 'Little Shop of Horrors - Total ticket revenue', 38500.00, '2026-08-15', 'final', '92% capacity. Extended by 1 week.'),
      (14, 'revenue', 'Spring 2026', 'Ticket Sales', 'Our Town - Total ticket revenue', 28700.00, '2026-04-15', 'final', '78% capacity. Slower matinees.'),
      (NULL, 'expense', 'October 2026', 'Facility', 'Building maintenance and utilities', 8500.00, '2026-10-01', 'final', 'Includes HVAC repair $2,300.'),
      (NULL, 'revenue', 'Fall 2026', 'Donations', 'Annual fund donations received Q3', 67500.00, '2026-09-30', 'approved', 'Strong gala response. Above target.')
    `);
    console.log('Financial Reports seeded.');

    console.log('All tables seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
