"use client";

import { useState, useEffect, useCallback } from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  Building2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import Image from "next/image";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface ArticleDetailClientProps {
  article: Article;
  recentArticles: Article[];
  relatedArticles: Article[];
  companyDescription: string;
}

export function ArticleDetailClient({
  article,
  recentArticles,
  relatedArticles,
  companyDescription,
}: ArticleDetailClientProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const res = await fetch(`/api/comments?articleId=${article.slug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [article.slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim()) {
      setSubmitError("Semua field wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.slug,
          name: commentName,
          email: commentEmail,
          content: commentContent,
          website: "", // M8: Honeypot field — bot akan mengisi ini
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // M9: Jangan langsung tambah ke list — komentar perlu moderasi dulu
        setCommentName("");
        setCommentEmail("");
        setCommentContent("");
        setSubmitSuccess(true);
        // Tampilkan pesan moderasi
        if (data.message) {
          // Komentar menunggu moderasi
        }
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const data = await res.json();
        setSubmitError(data.error || "Gagal mengirim komentar.");
      }
    } catch (error) {
      console.error("Comment submit error:", error);
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format comment date
  const formatCommentDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Artikel
          </Link>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Cover Image (dari Sanity) atau fallback letter */}
                <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center border mb-8 overflow-hidden relative">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-bold text-emerald-200 dark:text-emerald-700 select-none">
                      {article.title.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {article.readingTime} menit baca
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4" />
                    {article.author}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight">
                  {article.title}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Article Content */}
                <div className="mt-8 markdown-content">
                  <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>

                {/* Comments Section */}
                <div className="mt-16 border-t pt-10">
                  <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Komentar
                    {!commentsLoading && comments.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      >
                        {comments.length}
                      </Badge>
                    )}
                  </h3>

                  {/* Comment List */}
                  {commentsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                      <Loader2 className="size-4 animate-spin" />
                      Memuat komentar...
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4 mt-6 mb-10">
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-muted/30 rounded-lg p-4 border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                              <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {comment.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCommentDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                            {comment.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4 mb-8">
                      Belum ada komentar. Jadilah yang pertama berkomentar!
                    </p>
                  )}

                  {/* Comment Form */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Tinggalkan Komentar
                    </h4>

                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4 text-sm text-emerald-700 dark:text-emerald-300"
                      >
                        Komentar berhasil dikirim! Komentar Anda akan tampil setelah dimoderasi oleh admin.
                      </motion.div>
                    )}

                    {submitError && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 text-sm text-destructive">
                        {submitError}
                      </div>
                    )}

                    <form onSubmit={handleSubmitComment} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Nama <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="Nama Anda"
                            className="bg-background"
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@contoh.com"
                            className="bg-background"
                            value={commentEmail}
                            onChange={(e) => setCommentEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">
                          Komentar <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Tulis komentar Anda..."
                          rows={4}
                          className="bg-background"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          required
                          maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {commentContent.length}/1000
                        </p>
                      </div>
                      {/* M8: Honeypot field — tersembunyi dari manusia, bot akan mengisi */}
                      <div className="absolute -left-[9999px]" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input
                          type="text"
                          id="website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            Kirim Komentar
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </motion.article>

              {/* Related Articles */}
              <RelatedArticles articles={relatedArticles} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Artikel Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentArticles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/articles/${a.slug}`}
                      className="block group"
                    >
                      <h4 className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {a.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(a.publishedAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Banner */}
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Hubungi Kami
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Butuh konsultasi tentang produk PJU? Tim kami siap membantu.
                  </p>
                  <WhatsAppButton
                    label="Chat WhatsApp"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  />
                </CardContent>
              </Card>

              {/* About Us Brief */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tentang Arostech</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {companyDescription}...
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-3 transition-colors"
                  >
                    Selengkapnya →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
