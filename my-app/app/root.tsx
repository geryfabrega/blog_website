import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#F5F5F3] text-[#141413] antialiased selection:bg-[#141413] selection:text-[#F5F5F3]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const isBlog = location.pathname.startsWith("/blog");

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3] text-[#141413]">
      <header className="border-b border-[#DCDCD7]">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-xl font-medium tracking-tight text-[#141413] hover:opacity-70 transition-opacity"
          >
            Gery Fabrega
          </Link>
          <nav className="flex items-center gap-7 text-sm">
            <Link
              to="/"
              className={`transition-colors ${
                !isBlog
                  ? "text-[#141413] font-medium"
                  : "text-[#6B6B66] hover:text-[#141413]"
              }`}
            >
              About
            </Link>
            <Link
              to="/blog"
              className={`transition-colors ${
                isBlog
                  ? "text-[#141413] font-medium"
                  : "text-[#6B6B66] hover:text-[#141413]"
              }`}
            >
              Writing
            </Link>
            <a
              href="https://github.com/geryfabrega"
              target="_blank"
              rel="noreferrer"
              className="text-[#6B6B66] hover:text-[#141413] transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-[#DCDCD7] mt-20">
        <div className="mx-auto max-w-3xl px-6 py-8 flex items-center justify-between text-xs text-[#73736E]">
          <span>Gery Fabrega</span>
          <div className="flex items-center gap-5">
            <Link to="/blog" className="hover:text-[#141413] transition-colors">
              Writing
            </Link>
            <a
              href="https://github.com/geryfabrega"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#141413] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Ignore .well-known 404 errors (Chrome DevTools, etc.)
  if (
    isRouteErrorResponse(error) &&
    error.status === 404 &&
    typeof window !== "undefined" &&
    window.location.pathname.includes(".well-known")
  ) {
    return null;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-serif text-4xl font-medium text-[#181715] mb-3">
        {message}
      </h1>
      <p className="text-[#57534E] mb-6">{details}</p>
      <Link
        to="/"
        className="text-sm text-[#181715] underline underline-offset-4 decoration-[#C8C2B6] hover:decoration-[#181715]"
      >
        ← Return home
      </Link>
      {stack && (
        <pre className="mt-8 w-full p-4 overflow-x-auto bg-[#F2EFE9] border border-[#E5E1D8] rounded text-xs font-mono text-[#181715]">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
