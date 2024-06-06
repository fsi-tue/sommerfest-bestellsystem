import pg from 'pg'
const { Pool } = pg
import { database } from '../config/config'
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from '../db/schema';

const pool = new Pool({
    host: database.host,
    port: database.port,
    database: database.database,
    user: database.user,
    password: database.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
