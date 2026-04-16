import { pool } from './config/db';

const addReports = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📝 Agregando reportes de ciudadanos...');
    
    // Get citizen user IDs
    const citizens = await client.query(
      "SELECT id, name FROM users WHERE user_type = 'citizen'"
    );
    
    // Create sample reports for each citizen
    const reportTypes = [
      { type: 'Basura acumulada', desc: 'Hay basura acumulada en la esquina de la calle' },
      { type: 'Camión no llegó', desc: 'El camión de basura no pasó en el día indicado' },
      { type: 'Punto ilegal', desc: 'Hay un punto de botadero clandestino' },
      { type: 'Daño en contenedor', desc: 'El contenedores está dañado' }
    ];
    
    for (const citizen of citizens.rows) {
      // Add 2-3 reports per citizen
      const numReports = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numReports; i++) {
        const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        await client.query(`
          INSERT INTO reports (user_id, type, description, status)
          VALUES ($1, $2, $3, 'pending')
        `, [citizen.id, reportType.type, reportType.desc]);
      }
      
      console.log(`  ${citizen.name}: ${numReports} reportes`);
    }
    
    console.log('✅ Reportes creados');
    
    // Show summary
    const count = await client.query("SELECT COUNT(*) as cnt FROM reports");
    console.log(`  Total: ${count.rows[0].cnt} reportes`);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

addReports();