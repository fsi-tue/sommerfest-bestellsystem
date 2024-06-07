import { defineConfig } from "drizzle-kit";
import { database } from './config/config'

export default defineConfig({
    schema: "./db.deprecated/model.ts",
    dialect: "postgresql",
    out: "./migrations",
    dbCredentials: {
        user: database.user,
        password: database.password,
        host: database.host,
        port: database.port,
        database: database.database,
    }
});
