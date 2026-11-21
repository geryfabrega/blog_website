import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  // Handle .well-known requests (Chrome DevTools, etc.) to prevent errors
  route(".well-known/*", "routes/.well-known.$.tsx"),
] satisfies RouteConfig;
