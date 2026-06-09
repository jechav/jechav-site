import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog",
  description: "Writing about software, systems, and ideas.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Notes on software engineering, building things, and thinking clearly.
        </p>
      </header>

      {/* Post list */}
      <section className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold leading-tight group-hover:underline">
                {post.frontmatter.title}
              </h2>
            </Link>

            {post.frontmatter.description && (
              <p className="mt-2 text-muted-foreground">
                {post.frontmatter.description}
              </p>
            )}

            <div className="mt-3 text-sm text-muted-foreground">
              <time dateTime={post.frontmatter.date}>
                {formatDate(post.frontmatter.date)}
              </time>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
