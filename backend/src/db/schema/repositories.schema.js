import {
  pgTable,
  bigint,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const repositories =
  pgTable(
    "repositories",
    {
      id: bigint(
        "id",
        {
          mode: "number"
        }
      ).primaryKey(),

      installationId:
        bigint(
          "installation_id",
          {
            mode: "number"
          }
        ).notNull(),

      fullName:
        text("full_name")
          .notNull(),

      owner:
        text("owner"),

      name:
        text("name"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );