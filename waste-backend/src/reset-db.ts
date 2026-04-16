import { pool } from './config/db';
import bcrypt from 'bcrypt';

const setupFresh = async () => {
  const client = await pool.connect();
  
  try {
    const hashedPassword = await bcrypt.hash('test1234', 10);
    
    console.log('👨‍💼 Creando administradores del dashboard...');
    
    await client.query('DELETE FROM dashboard_admins');
    
    await client.query(`
      INSERT INTO dashboard_admins (name, email, password_hash, role, is_active) VALUES
      ('Admin Principal', 'admin@aseo.com', $1, 'superadmin', true),
      ('Operador 1', 'operador1@aseo.com', $1, 'operator', true),
      ('Operador 2', 'operador2@aseo.com', $1, 'operator', true)
    `, [hashedPassword]);
    
    console.log('✅ 3 administradores creados');
    
    const userCount = await client.query('SELECT user_type, COUNT(*) as cnt FROM users GROUP BY user_type');
    console.log('');
    console.log('📊 Resumen final:');
    userCount.rows.forEach(row => {
      console.log(`  ${row.user_type}: ${row.cnt}`);
    });
    
    console.log('');
    console.log('🎉 Base de datos reseteada correctamente!');
    console.log('');
    console.log('Credenciales:');
    console.log('  Dashboard: admin@aseo.com / test1234');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

setupFresh();