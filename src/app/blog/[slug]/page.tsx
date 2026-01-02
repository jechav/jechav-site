import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getPostBySlug } from "@/lib/posts";
import { mdxComponents } from "@/mdx-components";
import Link from "next/link";
import { Metadata } from "next/types";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);
    return {
      title: post.frontmatter.title,
      description: post.frontmatter.description ?? "",
    };
  } catch {
    return { title: "Post not found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: "github-dark",
              keepBackground: true,
              defaultLang: "txt",
            },
          ],
        ],
      },
    },
  });

  return (
    <main style={{ maxWidth: 820, margin: "48px auto", padding: "0 16px" }}>
      <article>
        <header style={{ marginBottom: 22 }}>
          <Link href="/blog" style={{ opacity: 0.7, textDecoration: "none" }}>
            ← Back to blog
          </Link>

          <h1 style={{ fontSize: 40, margin: "14px 0 8px" }}>
            {post.frontmatter.title}
          </h1>

          <div style={{ opacity: 0.7 }}>
            <time>{new Date(post.frontmatter.date).toLocaleDateString()}</time>
          </div>

          {post.frontmatter.description ? (
            <p style={{ marginTop: 14, opacity: 0.85 }}>
              {post.frontmatter.description}
            </p>
          ) : null}
        </header>

        <div className="prose">{content}</div>
      </article>
    </main>
  );
}
