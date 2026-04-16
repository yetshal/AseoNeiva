import { pool } from './config/db';

const fixConstraint = async () => {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
    await client.query("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected'))");
    console.log('✅ CHECK constraint actualizado');
  } catch (e: any) {
    console.log('Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
};

fixConstraint();