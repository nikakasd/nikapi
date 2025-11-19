import { drizzle } from "drizzle-orm/node-postgres";
import env from "../env.js";

export default drizzle(env.databaseUrl)