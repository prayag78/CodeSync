import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center text-sm text-gray-400">
          <span>© {currentYear} CodeSync. Built with ❤️ by </span>
          <Link
            href="https://github.com/prayag78"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            @prayag78
          </Link>
        </div>
      </div>
    </footer>
  );
}
