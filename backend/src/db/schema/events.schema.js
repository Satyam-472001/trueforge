import {
  pgTable,
  uuid,
  bigint,
  text,
  jsonb,
  timestamp
} from "drizzle-orm/pg-core";

export const events =
  pgTable(
    "events",
    {
      id:
        uuid("id")
          .defaultRandom()
          .primaryKey(),

      eventType:
        text("event_type")
          .notNull(),

      installationId:
        bigint(
          "installation_id",
          {
            mode: "number"
          }
        ),

      repositoryId:
        bigint(
          "repository_id",
          {
            mode: "number"
          }
        ),

      payload:
        jsonb("payload"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );