import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPostBySlug, blogPosts } from "@/data/blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Minimal markdown-to-JSX renderer for blog content */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Tables
    if (line.includes("|") && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const headers = line.split("|").filter(Boolean).map((h) => h.trim());
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map((c) => c.trim()));
        i++;
      }
      elements.push(
        <div key={i} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headers.map((h, j) => (
                  <th key={j} className="text-left py-2 px-3 font-semibold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold mt-8 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-10 mb-4">{line.slice(3)}</h2>);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-primary/40 pl-4 py-2 my-4 text-muted-foreground italic bg-primary/5 rounded-r-md"
        >
          <InlineMarkdown text={line.slice(2)} />
        </blockquote>
      );
    }
    // List items
    else if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1.5 my-3 text-muted-foreground">
          {items.map((item, j) => (
            <li key={j}><InlineMarkdown text={item} /></li>
          ))}
        </ul>
      );
      continue;
    }
    // Numbered list
    else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1.5 my-3 text-muted-foreground">
          {items.map((item, j) => (
            <li key={j}><InlineMarkdown text={item} /></li>
          ))}
        </ol>
      );
      continue;
    }
    // Empty line
    else if (line.trim() === "") {
      // skip
    }
    // Paragraph
    else {
      elements.push(
        <p key={i} className="text-muted-foreground leading-relaxed my-3">
          <InlineMarkdown text={line} />
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

/** Renders bold, links inside text */
function InlineMarkdown({ text }: { text: string }) {
  // Process **bold** and [links](/url)
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) return <strong key={i} className="font-semibold text-foreground">{boldMatch[1]}</strong>;
        const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
        if (linkMatch) return <Link key={i} to={linkMatch[2]} className="text-primary underline underline-offset-2 hover:text-primary/80">{linkMatch[1]}</Link>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.image,
    author: { "@type": "Organization", name: "CalcHub" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} — Блог</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://neat-app-styles.lovable.app/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero image */}
        <div className="w-full h-64 sm:h-80 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <article className="container max-w-3xl py-10 sm:py-14">
          {/* Back */}
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Все статьи
            </Button>
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose-custom">
            <MarkdownContent content={post.content} />
          </div>

          <Separator className="my-12" />

          {/* Related posts */}
          {related.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-bold">Читайте также</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((rp) => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                      <div className="h-36 overflow-hidden">
                        <img
                          src={rp.image}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {rp.category}
                        </Badge>
                        <CardTitle className="text-sm group-hover:text-primary transition-colors">
                          {rp.title}
                        </CardTitle>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPostPage;
