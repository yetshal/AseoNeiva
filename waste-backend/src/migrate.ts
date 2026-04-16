import { pool } from './config/db';

const migration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración de tablas...');
    
    // Tabla vehicles
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id             uuid DEFAULT uuid_generate_v4() NOT NULL,
        plate          VARCHAR(20) NOT NULL,
        model          VARCHAR(100),
        type           VARCHAR(30) DEFAULT 'truck',
        status         VARCHAR(20) DEFAULT 'active',
        driver_name    VARCHAR(100),
        driver_phone   VARCHAR(20),
        fuel_capacity  NUMERIC(8,2) DEFAULT 0,
        latitude       NUMERIC(10,7),
        longitude      NUMERIC(10,7),
        last_seen_at   TIMESTAMP WITH TIME ZONE,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT vehicles_pkey PRIMARY KEY (id),
        CONSTRAINT vehicles_plate_key UNIQUE (plate)
      );
    `);
    console.log('✅ Tabla vehicles creada');
    
    // Tabla routes
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id          uuid DEFAULT uuid_generate_v4() NOT NULL,
        name        VARCHAR(100) NOT NULL,
        description TEXT,
        zone        VARCHAR(100),
        type        VARCHAR(30) DEFAULT 'collection',
        status      VARCHAR(20) DEFAULT 'active',
        color       VARCHAR(7) DEFAULT '#1D9E75',
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT routes_pkey PRIMARY KEY (id)
      );
    `);
    console.log('✅ Tabla routes creada');
    
    // Tabla route_assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS route_assignments (
        id            uuid DEFAULT uuid_generate_v4() NOT NULL,
        route_id      uuid NOT NULL,
        vehicle_id    uuid NOT NULL,
        assigned_date DATE DEFAULT CURRENT_DATE,
        shift         VARCHAR(20) DEFAULT 'morning',
        status        VARCHAR(20) DEFAULT 'pending',
        notes         TEXT,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT route_assignments_pkey PRIMARY KEY (id),
        CONSTRAINT route_assignments_route_fkey FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
        CONSTRAINT route_assignments_vehicle_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabla route_assignments creada');
    
    // Tabla collection_logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS collection_logs (
        id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        assignment_id uuid,
        vehicle_id    uuid NOT NULL,
        route_id      uuid NOT NULL,
        collected_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fuel_used     NUMERIC(8,2) DEFAULT 0,
        distance_km   NUMERIC(8,3) DEFAULT 0,
        notes         TEXT,
        CONSTRAINT collection_logs_vehicle_fk FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        CONSTRAINT collection_logs_route_fk FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabla collection_logs creada');
    
    // Agregar datos de ejemplo si no hay vehículos
    const vehicleCount = await client.query('SELECT COUNT(*) FROM vehicles');
    if (parseInt(vehicleCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO vehicles (plate, model, type, status, driver_name, driver_phone, fuel_capacity, latitude, longitude)
        VALUES
          ('HUQ-432', 'Chevrolet FTR', 'truck', 'active', 'Carlos Medina', '3112340001', 200, 2.9272, -75.2819),
          ('HUQ-561', 'Kenworth T370', 'truck', 'active', 'Pedro Ospina', '3112340002', 250, 2.9341, -75.2765),
          ('HUQ-290', 'Hino 500', 'compactor', 'active', 'Jhon Vargas', '3112340003', 180, 2.9198, -75.2901),
          ('HUQ-748', 'Chevrolet FTR', 'sweeper', 'maintenance', 'Wilson Díaz', '3112340004', 150, NULL, NULL),
          ('HUQ-115', 'Ford Cargo 1723', 'truck', 'out_of_service', 'Ricardo Mora', '3112340005', 200, NULL, NULL)
      `);
      console.log('✅ Vehículos de ejemplo insertados');
    }
    
    // Agregar rutas de ejemplo si no hay
    const routeCount = await client.query('SELECT COUNT(*) FROM routes');
    if (parseInt(routeCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO routes (name, description, zone, type, status, color)
        VALUES
          ('Zona Norte – Ruta A', 'Barrios La Gaitana, Timanco', 'Norte', 'collection', 'active', '#1D9E75'),
          ('Zona Norte – Ruta B', 'Barrios Calixto, Las Palmas', 'Norte', 'collection', 'active', '#0F6E56'),
          ('Zona Sur – Ruta A', 'Barrios Plateado, Miraflores', 'Sur', 'collection', 'active', '#185FA5'),
          ('Zona Centro', 'Centro histórico Neiva', 'Centro', 'collection', 'active', '#854F0B'),
          ('Barrido Centro', 'Limpieza de vías centro', 'Centro', 'sweeping', 'active', '#7C3AED'),
          ('Zona Occidente', 'Barrios Cándido Leguízamo', 'Occidente', 'collection', 'active', '#D85A30')
      `);
      console.log('✅ Rutas de ejemplo insertadas');
    }
    
    console.log('');
    console.log('🎉 Migración completada!');
    
  } catch (err) {
    console.error('❌ Error en migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

migration();