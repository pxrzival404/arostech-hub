"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  MailOpen,
  Reply,
  Archive,
  Search,
  Send,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Phone,
  AtSign,
  Clock,
  User,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSpoke } from "@/components/SpokeProvider";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
  replyBody: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusFilter = "ALL" | "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";

// Status badge helper
function StatusBadge({ status }: { status: ContactMessage["status"] }) {
  const config: Record<
    ContactMessage["status"],
    { label: string; className: string }
  > = {
    UNREAD: {
      label: "Baru",
      className:
        "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
    },
    READ: {
      label: "Dibaca",
      className:
        "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
    },
    REPLIED: {
      label: "Dibalas",
      className:
        "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
    },
    ARCHIVED: {
      label: "Diarsipkan",
      className:
        "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
    },
  };
  const c = config[status];
  return (
    <Badge variant="secondary" className={cn("text-xs font-medium", c.className)}>
      {status === "UNREAD" && <Mail className="mr-1 h-3 w-3" />}
      {status === "READ" && <MailOpen className="mr-1 h-3 w-3" />}
      {status === "REPLIED" && <Reply className="mr-1 h-3 w-3" />}
      {status === "ARCHIVED" && <Archive className="mr-1 h-3 w-3" />}
      {c.label}
    </Badge>
  );
}

// Time formatting helper
function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminInboxClient() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status");
  const { subdomain, isPreviewDomain } = useSpoke();

  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };

  // State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    urlStatus === "UNREAD" || urlStatus === "READ" || urlStatus === "REPLIED" || urlStatus === "ARCHIVED"
      ? urlStatus
      : "ALL"
  );
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (search) params.set("search", search);

        const res = await fetch(buildApiUrl(`/api/admin/inbox?${params.toString()}`));
        if (!res.ok) throw new Error("Gagal memuat pesan");
        const data = await res.json();
        setMessages(data.messages);
        setPagination(data.pagination);
      } catch {
        toast.error("Gagal memuat pesan");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, subdomain, isPreviewDomain]
  );

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // Fetch single message detail
  const fetchMessageDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(buildApiUrl(`/api/admin/inbox/${id}`));
      if (!res.ok) throw new Error("Gagal memuat detail pesan");
      const data = await res.json();
      setSelectedMessage(data.message);
      // Update the message in the list if status changed
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: data.message.status } : m))
      );
    } catch {
      toast.error("Gagal memuat detail pesan");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Select message
  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    setReplyText("");
    fetchMessageDetail(id);
    setMobileShowDetail(true);
  };

  // Handle search
  const handleSearch = () => {
    setSearch(searchInput);
  };

  // Handle reply
  const handleReply = async () => {
    if (!selectedId || !replyText.trim()) {
      toast.error("Balasan tidak boleh kosong");
      return;
    }
    setSendingReply(true);
    try {
      const res = await fetch(buildApiUrl(`/api/admin/inbox/${selectedId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", replyBody: replyText.trim() }),
      });
      if (!res.ok) throw new Error("Gagal mengirim balasan");
      const data = await res.json();
      toast.success("Balasan berhasil dikirim!");
      setSelectedMessage(data.message);
      setReplyText("");
      // Update message in list
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? { ...m, status: "REPLIED", replyBody: replyText.trim() }
            : m
        )
      );
    } catch {
      toast.error("Gagal mengirim balasan");
    } finally {
      setSendingReply(false);
    }
  };

  // Handle archive
  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/admin/inbox/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (!res.ok) throw new Error("Gagal mengarsipkan pesan");
      toast.success("Pesan berhasil diarsipkan");
      if (selectedId === id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, status: "ARCHIVED" } : null
        );
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "ARCHIVED" } : m))
      );
    } catch {
      toast.error("Gagal mengarsipkan pesan");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMessages(newPage);
    }
  };

  // Tab counts (we don't have exact counts, use visual indication)
  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "Semua" },
    { value: "UNREAD", label: "Belum Dibaca" },
    { value: "REPLIED", label: "Sudah Dibalas" },
    { value: "ARCHIVED", label: "Diarsipkan" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Kotak Masuk
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kelola pesan masuk dari form kontak website
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchMessages(pagination.page)}
          className="self-start"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <SubdomainFilter className="mb-4" />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari nama, email, subjek..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inbox Layout: List + Detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left Panel: Message List */}
        <Card
          className={cn(
            "lg:col-span-2",
            mobileShowDetail ? "hidden lg:block" : ""
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4 text-emerald-600" />
              Pesan Masuk
              {pagination.total > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {pagination.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="ml-2 text-sm text-zinc-500">
                  Memuat pesan...
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Inbox className="mb-3 h-10 w-10" />
                <p className="text-sm">Tidak ada pesan</p>
              </div>
            ) : (
              <>
                <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                  {messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                        selectedId === msg.id &&
                          "bg-emerald-50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/30",
                        msg.status === "UNREAD" && "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/20"
                      )}
                    >
                      {/* Unread indicator */}
                      <div className="mt-1.5 flex-shrink-0">
                        {msg.status === "UNREAD" ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        ) : msg.status === "REPLIED" ? (
                          <Reply className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                        )}
                      </div>

                      {/* Message preview */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm",
                              msg.status === "UNREAD"
                                ? "font-semibold text-zinc-900 dark:text-zinc-100"
                                : "font-medium text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            {msg.name}
                          </span>
                          <span className="flex-shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {msg.subject || "(Tanpa subjek)"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                          {msg.message.substring(0, 80)}
                          {msg.message.length > 80 ? "..." : ""}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={msg.status} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                      Sebelumnya
                    </Button>
                    <span className="text-xs text-zinc-500">
                      Hal {pagination.page} dari {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Message Detail */}
        <Card
          className={cn(
            "lg:col-span-3",
            !mobileShowDetail ? "hidden lg:block" : ""
          )}
        >
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <MessageSquare className="mb-3 h-12 w-12" />
              <p className="text-sm">Pilih pesan untuk melihat detail</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-sm text-zinc-500">
                Memuat detail...
              </span>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col">
              {/* Detail Header - mobile back button */}
              <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileShowDetail(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedMessage.subject || "(Tanpa subjek)"}
                    </h2>
                    <StatusBadge status={selectedMessage.status} />
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatFullDate(selectedMessage.createdAt)}
                  </p>
                </div>
                {selectedMessage.status !== "ARCHIVED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(selectedMessage.id)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <Archive className="mr-1.5 h-3.5 w-3.5" />
                    Arsipkan
                  </Button>
                )}
              </div>

              {/* Sender info */}
              <div className="space-y-2 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedMessage.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <AtSign className="h-3 w-3" />
                        {selectedMessage.email}
                      </span>
                      {selectedMessage.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedMessage.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="max-h-[calc(100vh-560px)] overflow-y-auto px-6 py-4">
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                  <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Reply history */}
                {selectedMessage.status === "REPLIED" && selectedMessage.replyBody && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <Reply className="h-4 w-4" />
                      Balasan Admin
                    </div>
                    <Separator className="my-2" />
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                        {selectedMessage.replyBody}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {selectedMessage.repliedAt &&
                          formatFullDate(selectedMessage.repliedAt)}
                        {selectedMessage.repliedBy && (
                          <>
                            <span>•</span>
                            <User className="h-3 w-3" />
                            {selectedMessage.repliedBy}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply form */}
              <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                {selectedMessage.status === "REPLIED" ? (
                  <div className="text-center text-xs text-zinc-400">
                    Pesan ini sudah dibalas. Anda bisa mengirim balasan tambahan di bawah.
                  </div>
                ) : null}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Tulis balasan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Kirim Balasan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
