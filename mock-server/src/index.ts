import { serve } from "@hono/node-server";
import { Hono } from "hono";
import dayjs from "dayjs";

const app = new Hono();

app.get("/", (c) => {
  return c.text(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Hello Hono!`);
});

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
