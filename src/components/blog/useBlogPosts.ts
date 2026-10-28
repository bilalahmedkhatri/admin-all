"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { blogCatalogSchema, type BlogApp } from "@/lib/gateway/blog";
import {
  blogRequest,
  postListSchema,
  BlogRequestError,
  type BlogPost,
} from "@/lib/gateway/blog-client";

export type BlogPostGroup = {
  app: BlogApp;
  items: BlogPost[];
  page: number;
  total: number;
  page_size: number;
  error: string;
  counts?: { mine: number; total: number };
};
export type BlogPostFilters = {
  website: string;
  status: string;
  search: string;
};

export default function useBlogPosts() {
  const t = useTranslations("blog");
  const [apps, setApps] = useState<BlogApp[]>([]);
  const [groups, setGroups] = useState<BlogPostGroup[]>([]);
  const [filters, setFilters] = useState<BlogPostFilters>({
    website: "",
    status: "",
    search: "",
  });
  const [pages, setPages] = useState<Record<string, number>>({});
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const catalog = await blogRequest("", "apps", blogCatalogSchema);
        if (!active) return;
        const available = catalog.apps.filter((app) => app.configured);
        setApps(available);
        const rows = await Promise.all(
          available.map(async (app): Promise<BlogPostGroup> => {
            const page = pages[app.key] ?? 1;
            try {
              const data = await blogRequest(
                app.key,
                "posts",
                postListSchema,
                undefined,
                {
                  page: String(page),
                  page_size: "20",
                  search: filters.search,
                  ...(filters.status ? { status: filters.status } : {}),
                },
              );
              return { app, ...data, error: "" };
            } catch (error) {
              if (error instanceof BlogRequestError && error.status === 401)
                throw error;
              return {
                app,
                items: [],
                page,
                total: 0,
                page_size: 20,
                error: error instanceof Error ? error.message : t("postsError"),
              };
            }
          }),
        );
        if (active) setGroups(rows);
      } catch (error) {
        if (active) {
          setGroups([]);
          setError(error instanceof Error ? error.message : t("postsError"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [filters, pages, revision, t]);
  return {
    apps,
    groups,
    filters,
    loading,
    error,
    filter(next: BlogPostFilters) {
      setLoading(true);
      setError("");
      setFilters(next);
      setPages({});
    },
    paginate(app: string, page: number) {
      setLoading(true);
      setError("");
      setPages((current) => ({ ...current, [app]: page }));
    },
    refresh() {
      setLoading(true);
      setError("");
      setRevision((value) => value + 1);
    },
  };
}
