"use client";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Loading } from "@/components/gateway/loading";
import { Modal } from "@/components/ui/modal";
import { blogCatalogSchema, type BlogApp } from "@/lib/gateway/blog";
import {
  blogRequest,
  postListSchema,
  type BlogPost,
} from "@/lib/gateway/blog-client";

type Group = {
  app: BlogApp;
  items: BlogPost[];
  page: number;
  total: number;
  error: string;
};
export default function BlogPostBrowser({
  onChoose,
  onClose,
}: {
  onChoose: (app: string, id: number) => Promise<void>;
  onClose: () => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const catalog = await blogRequest("", "apps", blogCatalogSchema);
        const rows = await Promise.all(
          catalog.apps
            .filter((app) => app.configured)
            .map(async (app): Promise<Group> => {
              try {
                const data = await blogRequest(
                  app.key,
                  "posts",
                  postListSchema,
                );
                return { app, ...data, error: "" };
              } catch {
                return {
                  app,
                  items: [],
                  page: 1,
                  total: 0,
                  error: "Posts could not be loaded.",
                };
              }
            }),
        );
        if (active) setGroups(rows);
      } catch (error) {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Posts could not be loaded.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  async function page(group: Group, next: number) {
    setBusy(true);
    setError("");
    try {
      const data = await blogRequest(
        group.app.key,
        "posts",
        postListSchema,
        undefined,
        { page: String(next) },
      );
      setGroups((rows) =>
        rows.map((row) =>
          row.app.key === group.app.key ? { ...row, ...data, error: "" } : row,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Posts could not be loaded.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      showCloseButton={false}
      className="mx-4 max-h-full max-w-2xl overflow-y-auto p-6"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="blog-browser-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2
            id="blog-browser-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Saved posts
          </h2>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Close
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-error-600">
            {error}
          </p>
        )}
        {loading ? (
          <Loading label="Loading saved posts..." />
        ) : (
          <div className="space-y-6">
            {!groups.length && <p>No blog apps are available.</p>}
            {groups.map((group) => (
              <section key={group.app.key}>
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
                  {group.app.label}
                </h3>
                {group.error ? (
                  <p role="alert" className="text-sm text-error-600">
                    {group.error}
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {group.items.map((post) => (
                        <li key={post.id}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                await onChoose(group.app.key, post.id);
                              } catch (error) {
                                setError(
                                  error instanceof Error
                                    ? error.message
                                    : "Post could not be opened.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-start text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {post.title} | {post.status}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {!group.items.length && (
                      <p className="text-sm text-gray-500">No saved posts.</p>
                    )}
                  </>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || group.page === 1}
                    onClick={() => void page(group, group.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">{group.page}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || group.page * 20 >= group.total}
                    onClick={() => void page(group, group.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
