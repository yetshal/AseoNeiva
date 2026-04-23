import { pool } from './config/db';

async function testCreateRoute() {
  try {
    console.log('Intentando crear ruta de prueba...');
    const result = await pool.query(
      `INSERT INTO routes (name, description, zone, type, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      ['Ruta de Prueba', 'Descripción de prueba', 'Norte', 'collection', '#1D9E75']
    );
    console.log('✅ Ruta creada con éxito:', result.rows[0]);
  } catch (err: any) {
    console.error('❌ Error al crear ruta:', err.message);
    if (err.detail) console.error('Detalle:', err.detail);
    if (err.hint) console.error('Pista:', err.hint);
  } finally {
    process.exit();
  }
}

testCreateRoute();
