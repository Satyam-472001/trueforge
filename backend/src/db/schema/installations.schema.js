import {
  pgTable,
  bigint,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const installations =
  pgTable(
    "installations",
    {
      id: bigint(
        "id",
        {
          mode: "number"
        }
      ).primaryKey(),

      accountLogin:
        text("account_login")
          .notNull(),

      accountType:
        text("account_type"),

      senderLogin:
        text("sender_login"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );