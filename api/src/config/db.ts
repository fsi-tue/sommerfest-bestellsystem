import pg from 'pg'
import config from './config'
const { Pool } = pg

const pool = new Pool({
    host: config.database.host,
    user: config.database.user,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

function query(text: any, params: any) {
    return pool.query(text, params) || {};
}

export default { query, pool };