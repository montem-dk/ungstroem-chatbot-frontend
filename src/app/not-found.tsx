export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-5xl font-bold mb-4">🤔 Hmm...</h1>
      <p className="text-lg text-gray-600 mb-8">
        We can’t find the page you’re looking for.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}
