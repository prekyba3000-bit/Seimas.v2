import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const mps = pgTable("mps", {
  id: serial("id").primaryKey(),
  seimasId: varchar("seimas_id", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  party: varchar("party", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // onUpdateNow() logic handled via application code or triggers in PG usually
});
