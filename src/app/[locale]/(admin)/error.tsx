"use client";
import {Button} from "@/components/gateway/ui/button";
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">Unable to load this page</h1><p className="mb-5 text-sm text-gray-500 dark:text-gray-400">The service may be unavailable or your account may not have access.</p><Button onClick={reset}>Retry</Button></section>}
