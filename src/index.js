import { onRequestPost as track } from "../functions/api/track.js";
import { onRequestGet as stats } from "../functions/api/stats.js";

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/track") {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return track({ request, env, ctx });
    }
    if (pathname === "/api/stats") {
      if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
      return stats({ request, env, ctx });
    }

    return env.ASSETS.fetch(request);
  },
};
