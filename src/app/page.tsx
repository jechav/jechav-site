import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 3); // Get 3 most recent posts

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-mono text-gray-900 dark:text-gray-100 mb-2">
            Jose Echavez
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-mono mb-8">
            Software Engineer
          </p>

          <div className="space-y-4 font-mono text-sm">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-gray-500 dark:text-gray-500 mb-3">Contact</h2>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500">Email:</span>{" "}
                <a
                  href="mailto:jose.em2415@gmail.com"
                  className="underline hover:text-gray-900 dark:hover:text-gray-100"
                >
                  jose.em2415@gmail.com
                </a>
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-gray-500 dark:text-gray-500 mb-3">Links</h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  <span className="text-gray-500">GitHub:</span>{" "}
                  <a
                    href="https://github.com/jechav"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    github.com/jechav
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">LinkedIn:</span>{" "}
                  <a
                    href="https://www.linkedin.com/in/jose-echavez-m/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    linkedin.com/in/jose-echavez-m
                  </a>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-gray-500 dark:text-gray-500 mb-3">
                Recent Posts
              </h2>
              {posts.length > 0 ? (
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li
                      key={post.slug}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="underline hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {post.frontmatter.title}
                      </Link>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(post.frontmatter.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No posts yet.</p>
              )}
              <div className="mt-3">
                <Link
                  href="/blog"
                  className="text-gray-700 dark:text-gray-300 text-sm underline hover:text-gray-900 dark:hover:text-gray-100"
                >
                  View all posts →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
