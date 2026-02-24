import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts } from "@/data/blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Блог — Финансовые советы и руководства</title>
      <meta
        name="description"
        content="Полезные статьи о кредитах, ипотеке, налогах и личных финансах. Экспертные руководства и практические советы."
      />
      <link rel="canonical" href="https://neat-app-styles.lovable.app/blog" />
    </Helmet>

    <SiteHeader />

    <main id="main-content">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
        <div className="container max-w-4xl text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Финансовый <span className="text-primary">блог</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Экспертные статьи о кредитах, ипотеке, налогах и управлении личными финансами
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 sm:py-16">
        <div className="container max-w-4xl space-y-6">
          {blogPosts.map((post) => (
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

export default Blog;
