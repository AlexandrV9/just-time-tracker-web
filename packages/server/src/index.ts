import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appConfig } from "./constants/index.js";
import { auth } from "./auth/index.js";

const app = new Hono();

// app.use(
//   "*",
//   cors({
//     origin: `http://localhost:${appConfig.clientPort}`,
//     credentials: true,
//   })
// );

app.route("/", auth);

serve(
  {
    fetch: app.fetch,
    port: Number(appConfig.serverPort),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
