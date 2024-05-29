// src/migrate.ts

import { migrate } from "drizzle-orm/pg-core/migrator";
import { config } from "dotenv";
import { db } from './db';

config({ path: ".env" });


const main = async () => {
    try {
        await migrate(db, { migrationsFolder: "drizzle" });
        console.log("Migration completed");
    } catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
};

main();