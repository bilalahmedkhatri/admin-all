"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { emptyAttribution, imageAttributionSchema } from "./imageAttribution";
import { Loading } from "@/components/gateway/loading";
import {
  assetListSchema,
  blogRequest,
  type BlogAsset,
} from "@/lib/gateway/blog-client";

export default function BlogMediaLibrary({
  appKey,
  onInsert,
  selectLabel,
  requestAlt = true,
  initialAsset,
}: {
  appKey: string;
  selectLabel?: string;
  requestAlt?: boolean;
  initialAsset?: BlogAsset;
  onInsert: (asset: BlogAsset) => void;
}) {
  const [assets, setAssets] = useState<BlogAsset[]>([]),
    [selected, setSelected] = useState<BlogAsset | null>(initialAsset ?? null);
  const [altText, setAltText] = useState(initialAsset?.alt_text ?? "");
  const [attribution, setAttribution] = useState(initialAsset?.attribution ?? emptyAttribution);
  const [attributionError, setAttributionError] = useState("");
  const [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    blogRequest(appKey, "assets", assetListSchema, undefined, {
      page: String(page),
      page_size: "12",
      media_type: "image",
    })
      .then((data) => {
        if (active) {
          setAssets(data.assets);
          setTotal(data.total);
        }
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Your images could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appKey, page, retry]);
  function load(next: number) {
    setLoading(true);
    setError("");
    setSelected(null);
    setAltText("");
    setAttribution(emptyAttribution);
    setAttributionError("");
    setPage(next);
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {
          "Images you uploaded to this app. Older files without verified uploader attribution are not listed."
        }
      </p>
      {loading ? (
        <Loading label={"Loading your images…"} />
      ) : error ? (
        <div>
          <p role="alert" className="text-error-600 dark:text-error-400">
            {error}
          </p>
          <Button
            variant="outline"
            className="mt-3 cursor-pointer"
            onClick={() => {
              setLoading(true);
              setError("");
              setRetry((v) => v + 1);
            }}
          >
            {"Try again"}
          </Button>
        </div>
      ) : (
        <>
          {!assets.length ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {"No uploaded images found for your account in this app."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  aria-pressed={selected?.id === asset.id}
                  aria-label={`Select ${asset.original_filename}`}
                  onClick={() => {
                    setSelected(asset);
                    setAltText(asset.id === initialAsset?.id ? initialAsset.alt_text ?? "" : "");
                    setAttribution(asset.id === initialAsset?.id ? initialAsset.attribution ?? emptyAttribution : emptyAttribution);
                    setAttributionError("");
                  }}
                  className={`cursor-pointer overflow-hidden rounded-xl border-2 p-2 text-start focus-visible:outline-2 focus-visible:outline-brand-500 ${selected?.id === asset.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 hover:border-brand-300 dark:border-gray-700"}`}
                >
                  <Image
                    unoptimized
                    src={asset.public_url}
                    alt={asset.original_filename}
                    width={240}
                    height={160}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <span className="mt-2 block truncate text-xs text-gray-700 dark:text-gray-200">
                    {asset.original_filename}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selected && requestAlt && (
            <div>
              <Label htmlFor="blog-image-alt">Image alt text</Label>
              <Input
                id="blog-image-alt"
                value={altText}
                maxLength={1000}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Describe what the image shows"
                aria-describedby="blog-image-alt-hint"
              />
              <p id="blog-image-alt-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Describe the image for screen readers. Leave blank for a decorative image.
              </p>
              <fieldset className="mt-4 space-y-3">
                <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">License & attribution (optional)</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enter the credit and license from the original image source. These appear below the image.</p>
                {([
                  ["credit", "Creator / source name", "Photographer or source name"],
                  ["sourceUrl", "Original image link", "https://..."],
                  ["license", "License name", "License listed by the image source"],
                  ["licenseUrl", "License link", "https://..."],
                ] as const).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <Label htmlFor={`blog-image-${key}`}>{label}</Label>
                    <Input
                      id={`blog-image-${key}`}
                      type={key.endsWith("Url") ? "url" : "text"}
                      maxLength={key.endsWith("Url") ? 2048 : 200}
                      value={attribution[key]}
                      placeholder={placeholder}
                      onChange={(event) => {
                        setAttribution((current) => ({ ...current, [key]: event.target.value }));
                        setAttributionError("");
                      }}
                    />
                  </div>
                ))}
                {attributionError && <p role="alert" className="text-sm text-error-600 dark:text-error-400">{attributionError}</p>}
              </fieldset>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                className="cursor-pointer disabled:cursor-not-allowed"
                onClick={() => load(page - 1)}
              >
                {"Previous"}
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {`Page ${page}`}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page * 12 >= total}
                className="cursor-pointer disabled:cursor-not-allowed"
                onClick={() => load(page + 1)}
              >
                {"Next"}
              </Button>
            </div>
            <Button
              disabled={!selected}
              className="cursor-pointer disabled:cursor-not-allowed"
              onClick={() => {
                if (!selected) return;
                if (!requestAlt) return onInsert(selected);
                const parsed = imageAttributionSchema.safeParse(attribution);
                if (!parsed.success) {
                  setAttributionError(parsed.error.issues[0].message);
                  return;
                }
                onInsert({ ...selected, alt_text: altText.trim(), attribution: parsed.data });
              }}
            >
              {selectLabel || "Insert selected image"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
