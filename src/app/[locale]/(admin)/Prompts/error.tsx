"use client";

import Button from "@/components/ui/button/Button";

export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
                Unable to load prompts
            </h1>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                An unexpected error occurred while loading this page.
            </p>
            <Button onClick={reset}>Retry</Button>
        </section>
    );
}
