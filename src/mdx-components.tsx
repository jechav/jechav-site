import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  a: (props) => <a {...props} style={{ textDecoration: "underline" }} />,
  h2: (props) => <h2 {...props} style={{ marginTop: 28 }} />,
  pre: (props) => (
    <pre
      {...props}
      style={{
        overflowX: "auto",
        padding: 16,
        borderRadius: 12,
      }}
    />
  ),
  code: (props) => <code {...props} />,
};
