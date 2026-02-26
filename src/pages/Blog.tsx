import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts, BLOG_CATEGORIES } from "@/data/blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Блог — Финансовые советы и руководства</title>
        <meta
          name="description"
          content="Полезные статьи о кредитах, ипотеке, налогах, растаможке, ЖКХ, алиментах и личных финансах."
        />
        <link rel="canonical" href="https://neat-app-styles.lovable.app/blog" />
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
          <div className="container max-w-4xl text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Наш <span className="text-primary">блог</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Статьи о финансах, налогах, ЖКХ, растаможке авто, алиментах и многом другом
            </p>
          </div>
        </section>

        {/* Category filter */}
        <section className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="container max-w-4xl py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BLOG_CATEGORIES.map((cat) => {
                const count = cat.id === "all"
                  ? blogPosts.length
                  : blogPosts.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={[
                      "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                  >
                    {cat.label}
                    <span className={[
                      "text-xs rounded-full px-1.5 py-0.5 leading-none",
                      activeCategory === cat.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground",
                    ].join(" ")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl space-y-6">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">Статей в этой категории пока нет.</p>
            )}
            {filtered.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-64 sm:shrink-0 h-48 sm:h-auto overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Читать далее <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Blog;
