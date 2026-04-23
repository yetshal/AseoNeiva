import { pool } from './config/db';
import bcrypt from 'bcrypt';

const seed = async () => {
  const client = await pool.connect();
  const password = await bcrypt.hash('test1234', 10);
  const today = new Date().toISOString().slice(0, 10);

  try {
    console.log('🗑️ Limpiando datos existentes...');
    await client.query('DELETE FROM route_assignments');
    await client.query('DELETE FROM routes');
    await client.query('DELETE FROM vehicles');
    await client.query('DELETE FROM users WHERE user_type != \'admin\'');
    
    console.log('👥 Insertando personal de campo...');
    await client.query(`
      INSERT INTO users (name, email, password_hash, phone, user_type, status) VALUES
      ('Carlos Rodríguez', 'carlos.conductor@aseo.com', $1, '3101112221', 'driver', 'active'),
      ('Juan Martínez', 'juan.conductor@aseo.com', $1, '3101112222', 'driver', 'active'),
      ('Ricardo Gómez', 'ricardo.recolector@aseo.com', $1, '3102223331', 'collector', 'active')
    `, [password]);

    console.log('🚛 Insertando flota de vehículos...');
    const vehicles = await client.query(`
      INSERT INTO vehicles (plate, model, type, status, driver_name, latitude, longitude) VALUES
      ('HXZ-101', 'International', 'truck', 'active', 'Carlos Rodríguez', 2.9273, -75.2819),
      ('HXZ-102', 'Kenworth', 'truck', 'active', 'Juan Martínez', 2.9341, -75.2765)
      RETURNING id
    `);

    console.log('🗺️ Insertando rutas...');
    const routes = await client.query(`
      INSERT INTO routes (name, zone, type, status, color) VALUES
      ('Ruta Comuna 1', 'Norte', 'collection', 'active', '#1D9E75'),
      ('Ruta Comuna 6', 'Sur', 'collection', 'active', '#185FA5')
      RETURNING id
    `);

    console.log('📅 Asignando rutas para hoy...');
    await client.query(`
      INSERT INTO route_assignments (route_id, vehicle_id, assigned_date, shift, status) VALUES
      ($1, $2, $3, 'morning', 'in_progress'),
      ($4, $5, $6, 'morning', 'in_progress')
    `, [
      routes.rows[0].id, vehicles.rows[0].id, today,
      routes.rows[1].id, vehicles.rows[1].id, today
    ]);

    console.log('🎉 Seed completo con asignaciones activas para hoy');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
