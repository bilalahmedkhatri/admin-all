export const PROMPT_CATEGORIES = [
  "Audio Generation",
  "Video Generation",
  "Blog Generation",
  "Image Generation",
  "Cover Letter",
  "Social Media Copy",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export interface GeneratedPrompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  author: string;
  createdAt: string;
}

export const INITIAL_PROMPTS: GeneratedPrompt[] = [
  {
    id: "p-1",
    title: "Cinematic Documentary Voiceover",
    category: "Audio Generation",
    author: "Bilal",
    content: `# Cinematic Voice Persona

**Tone:** Calm, authoritative, and resonant baritone.  
**Pacing:** Slow, measured tempo with 1.5s pauses for tension.  

## Delivery Guidelines
- Emphasize emotional weight on {topic}
- Avoid high vocal fry or rushed cadence
- Maintain warm, close-mic proximity effect`,
    createdAt: "2026-10-27",
  },
  {
    id: "p-2",
    title: "Viral TikTok & Reels 3-Second Hook",
    category: "Video Generation",
    author: "Hamza Tariq",
    content: `# Short-Form Video Hook Script

**Goal:** Stop the scroll in the first 2.5 seconds.  
**Style:** Fast-paced, punchy, curiosity gap opener.  

### Visual Sequence
1. Extreme close-up with sudden zoom-out
2. Dynamic text overlay: **"Stop making this {topic} mistake!"**
3. Fast B-roll cut highlighting the solution`,
    createdAt: "2026-10-26",
  },
  {
    id: "p-3",
    title: "Long-Form Technical SEO Blog Post",
    category: "Blog Generation",
    author: "Sarah Jenkins",
    content: `# SEO Long-Form Article Generator

Generate a comprehensive 2,500-word tutorial on {topic}.

## Requirements
- Target Audience: {target_audience}
- Tone: {tone}
- Structure:
  - H1: Compelling, keyword-rich headline
  - H2: Core architectural concepts
  - H3: Step-by-step implementation with code examples
  - FAQ section targeting People Also Ask queries`,
    createdAt: "2026-10-26",
  },
  {
    id: "p-4",
    title: "Executive Senior Software Engineer Cover Letter",
    category: "Cover Letter",
    author: "Alex Rivera",
    content: `# Professional Cover Letter Template

**Applicant:** {candidate_name}  
**Position:** Senior AI Systems Architect  

Dear Hiring Team,

I am writing to express my strong enthusiasm for the role. With over 8 years architecting distributed systems and scaling multi-model inference pipelines, I have consistently driven measurable velocity and reliability gains.

### Key Highlights
- Spearheaded 40% reduction in end-to-end TTS latency
- Mentored a cross-functional team of 12 engineers
- Authored production-ready SDKs used by 200k+ developers`,
    createdAt: "2026-10-25",
  },
  {
    id: "p-5",
    title: "Ultra-Realistic 8K Studio Product Render",
    category: "Image Generation",
    author: "Elena Rostova",
    content: `# Photorealistic Product Asset Prompt

**Subject:** Luxury minimalist ceramic microphone with matte titanium accents.  
**Lighting:** Soft volumetric studio rim lighting, 5600K balanced daylight, subtle caustics.  
**Shot Type:** Macro 85mm f/1.8 shallow depth of field.  
**Background:** Clean architectural limestone pedestal, subtle warm gradient.`,
    createdAt: "2026-10-25",
  },
  {
    id: "p-6",
    title: "LinkedIn Thought Leadership Carousel Copy",
    category: "Social Media Copy",
    author: "Bilal",
    content: `# LinkedIn Carousel Copy: 5 Lessons in AI Video

**Slide 1:** Most creators are doing AI video wrong. Here is why.  
**Slide 2:** 1. Audio fidelity beats visual gimmicks every time.  
**Slide 3:** 2. Hook retention drops 60% if the intro exceeds 4 seconds.  
**Slide 4:** 3. Consistent voice branding builds creator loyalty.  
**Slide 5:** Repost if you found this valuable! 🚀`,
    createdAt: "2026-10-24",
  },
  {
    id: "p-7",
    title: "Corporate E-Learning Compliance Voiceover",
    category: "Audio Generation",
    author: "David Chen",
    content: `# E-Learning Narration Script

**Cadence:** Clear, engaging mid-atlantic neutral cadence.  
**Objective:** Maintain employee focus throughout module on {topic}.  

- Tone: Professional, welcoming, zero vocal fry
- Pronounce acronyms phonetically as specified`,
    createdAt: "2026-10-24",
  },
  {
    id: "p-8",
    title: "YouTube Explainer Video B-Roll Script",
    category: "Video Generation",
    author: "Hamza Tariq",
    content: `# 10-Minute YouTube Script Blueprint

## Intro (0:00 - 1:15)
- Open with high-stakes scenario: **"What if AI could clone your voice instantly?"**
- Cue dramatic synth swell and screen split preview.

## Chapter 1: The Core Tech (1:15 - 4:00)
- Visual cue: Screen recording of waveform synthesis.
- Narration notes: Enthusiastic, explanatory, accessible.`,
    createdAt: "2026-10-23",
  },
  {
    id: "p-9",
    title: "Comparison Guide: Top Free AI Audio Tools",
    category: "Blog Generation",
    author: "Sarah Jenkins",
    content: `# In-Depth Tool Review & Benchmark

| Feature | GenZee Voice | Standard TTS | Legacy Systems |
|---|---|---|---|
| Latency | < 180ms | ~ 450ms | > 1.2s |
| Emotion Prosody | Ultra-Realistic | Moderate | Robotic |
| Commercial Rights | Full Included | Restricted | Paid Add-on |`,
    createdAt: "2026-10-23",
  },
  {
    id: "p-10",
    title: "Creative Director Role Cover Letter",
    category: "Cover Letter",
    author: "Azeem Khan",
    content: `# Creative Leadership Cover Letter

**Target Role:** Head of Creative Content & Production  

I bridge high-craft storytelling with modern generative pipelines. Over the past 6 years, my campaigns have generated over 85M organic impressions across YouTube, TikTok, and Meta platforms.`,
    createdAt: "2026-10-22",
  },
  {
    id: "p-11",
    title: "Cyberpunk Metropolis Neon Wallpaper",
    category: "Image Generation",
    author: "Elena Rostova",
    content: `# Futuristic Concept Art Prompt

Sprawling futuristic cityscape at midnight under heavy rain. Towering holographic billboards reflecting in wet asphalt streets. Flying vehicles traversing neon air lanes. Cinematic color grading: cyan and warm coral accents.`,
    createdAt: "2026-10-22",
  },
  {
    id: "p-12",
    title: "X (Twitter) Viral Launch Thread",
    category: "Social Media Copy",
    author: "Bilal",
    content: `# 7-Tweet Viral Launch Breakdown

1/7 Today we are launching something big: AI-driven voice cloning that runs right in your browser. Here is the story 🧵👇

2/7 Most creators spend 3+ hours per video just re-recording voice lines...`,
    createdAt: "2026-10-21",
  },
  {
    id: "p-13",
    title: "Sleep Meditation & Breathing Journey",
    category: "Audio Generation",
    author: "Maria Santos",
    content: `# Guided Meditation Script

**Atmosphere:** Deep calm, warm whispered cadence.  

Take a slow, deep breath in through your nose... and gently let it go. Notice the peaceful stillness around you as we begin our journey tonight.`,
    createdAt: "2026-10-21",
  },
  {
    id: "p-14",
    title: "Cinematic Sci-Fi Teaser Trailer",
    category: "Video Generation",
    author: "Hamza Tariq",
    content: `# 30-Second Teaser Script

- [ ] Black screen. Deep ambient rumble (sub-bass).
- [ ] Title card fades in: **"In 2045, memory became currency."**
- [ ] Rapid 0.5s match cuts of glowing data cables and ruined skylines.
- [ ] Voiceover delivers final tagline: *"What would you trade to forget?"*`,
    createdAt: "2026-10-20",
  },
  {
    id: "p-15",
    title: "Product Launch Press Release & Blog Post",
    category: "Blog Generation",
    author: "Sarah Jenkins",
    content: `# Official Launch Announcement

**Headline:** Introducing Next-Gen Voice Synthesis for Content Studios  

Today marks a major milestone. We are unveiling our real-time multi-speaker neural engine, designed from the ground up for high-tempo creator workflows.`,
    createdAt: "2026-10-20",
  },
  {
    id: "p-16",
    title: "Marketing Manager Cover Letter",
    category: "Cover Letter",
    author: "Alex Rivera",
    content: `# Growth Marketing Specialist Cover Letter

Dear Hiring Committee,

I specialize in building viral organic distribution loops and paid acquisition engines for digital creator tools. In my previous position, I scaled paid ROAS from 1.4x to 3.8x while reducing CPA by 35%.`,
    createdAt: "2026-10-19",
  },
  {
    id: "p-17",
    title: "Editorial Fashion Magazine Portrait",
    category: "Image Generation",
    author: "Elena Rostova",
    content: `# High-Fashion Editorial Prompt

Editorial studio portrait of an avant-garde model wearing sculptural origami garments. Dramatic chiaroscuro lighting, sharp jawline reflections, grain-enhanced 35mm film aesthetic, Vogue cover composition.`,
    createdAt: "2026-10-19",
  },
  {
    id: "p-18",
    title: "Instagram Reel Caption with Hashtags",
    category: "Social Media Copy",
    author: "Bilal",
    content: `# Reel Caption & Engagement Prompt

The secret to studio-grade audio isn't a $1,000 microphone... it's how you train your model. 🎙️✨

Drop a comment below with your favorite workflow and we'll DM you the prompt guide!

#ContentCreator #VoiceAI #AudioProduction #CreatorEconomy #VideoEditing`,
    createdAt: "2026-10-18",
  },
  {
    id: "p-19",
    title: "True Crime Mystery Storyteller",
    category: "Audio Generation",
    author: "David Chen",
    content: `# True Crime Episode Opener

**Atmosphere:** Hushed, intense, suspenseful pacing.  

It was a cold Tuesday evening in October when the emergency line rang. What the dispatcher heard next would baffle investigators for over two decades.`,
    createdAt: "2026-10-18",
  },
  {
    id: "p-20",
    title: "SaaS Product Demo Walkthrough Video",
    category: "Video Generation",
    author: "Hamza Tariq",
    content: `# 60-Second Feature Spotlight Video

- **0:00 - 0:10:** Highlight pain point (tedious manual copy editing).
- **0:10 - 0:35:** Live demo of 1-click prompt generator in action.
- **0:35 - 0:50:** Show dynamic waveform result.
- **0:50 - 1:00:** Strong CTA: Try free today at GenZee.`,
    createdAt: "2026-10-17",
  },
  {
    id: "p-21",
    title: "Beginner Guide to Voice Synthesis",
    category: "Blog Generation",
    author: "Sarah Jenkins",
    content: `# Complete Guide to Neural TTS for Beginners

Neural speech synthesis has evolved from robotic cadence into expressive human performances. In this practical guide, we will unpack pitch modulation, SSML markup, and real-time streaming pipelines.`,
    createdAt: "2026-10-17",
  },
  {
    id: "p-22",
    title: "Product Designer Portfolio Cover Letter",
    category: "Cover Letter",
    author: "Alex Rivera",
    content: `# Senior Product Designer Cover Letter

I craft design systems that delight users and scale product teams. Over the past 5 years, I've led UX redesigns for creator-centric SaaS applications, lifting activation rates by 28%.`,
    createdAt: "2026-10-16",
  },
  {
    id: "p-23",
    title: "Mythological Dragon Fantasy Environment",
    category: "Image Generation",
    author: "Elena Rostova",
    content: `# Epic Fantasy Landscape Prompt

An ancient emerald dragon resting atop snow-draped volcanic peaks. Molten lava rivers cascading down jagged basalt cliffs into an icy fjord below. Dramatic twilight sky with twin moons. Digital painting style, high fantasy detail.`,
    createdAt: "2026-10-16",
  },
  {
    id: "p-24",
    title: "Weekly Studio Newsletter Opener",
    category: "Social Media Copy",
    author: "Bilal",
    content: `# Creator Studio Weekly Newsletter #42

Hey creators,

This week we shipped 3 major upgrades to help you produce high-performing videos in half the time. Let's dive into the newest voice models and how you can use them today.`,
    createdAt: "2026-10-15",
  },
  {
    id: "p-25",
    title: "Late-Night Chill FM Host Dialogue",
    category: "Audio Generation",
    author: "Maria Santos",
    content: `# Late Night Radio Host Script

**Tone:** Warm, smooth, relaxed FM host tone with rich vocal resonance.  

You're tuned into the midnight session. Sit back, unwind, and let the smooth frequencies guide you through the late hours. Up next, some ambient synth sounds...`,
    createdAt: "2026-10-15",
  },
];

const STORAGE_KEY = "genzee_generated_prompts_v2";

export function getStoredPrompts(): GeneratedPrompt[] {
  if (typeof window === "undefined") {
    return INITIAL_PROMPTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROMPTS));
      return INITIAL_PROMPTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PROMPTS;
  } catch {
    return INITIAL_PROMPTS;
  }
}

export function saveStoredPrompt(prompt: GeneratedPrompt): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredPrompts();
    const filtered = existing.filter((p) => p.id !== prompt.id);
    const updated = [prompt, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to persist prompt:", error);
  }
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return "<p class='text-gray-400 dark:text-gray-500 italic'>Nothing to preview yet. Start typing markdown in the editor or click any toolbar buttons above.</p>";
  }

  // 1. Escape HTML
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Code blocks (```lang ... ```)
  html = html.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-gray-100 dark:bg-black/70"><code>${code.trim()}</code></pre>`;
  });

  // 3. Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-brand-600 dark:bg-gray-800 dark:text-brand-400">$1</code>',
  );

  // 4. Headings
  html = html.replace(
    /^#### (.*$)/gim,
    '<h4 class="mt-4 mb-2 text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">$1</h4>',
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="mt-5 mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">$1</h3>',
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="mt-6 mb-3 text-lg font-bold text-gray-900 dark:text-white">$1</h2>',
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="mt-6 mb-4 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 pb-2 dark:border-gray-800">$1</h1>',
  );

  // 5. Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-6 border-t border-gray-200 dark:border-gray-800" />');

  // 6. Blockquotes
  html = html.replace(
    /^\> (.*$)/gim,
    '<blockquote class="my-3 border-s-4 border-brand-500 ps-4 italic text-gray-600 dark:text-gray-400">$1</blockquote>',
  );

  // 7. Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-gray-400 dark:text-gray-500">$1</del>');

  // 8. Bold & Italic
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>',
  );
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // 9. Links: [title](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-500 underline hover:text-brand-600 transition-colors">$1</a>',
  );

  // 10. Checklist tasks: - [ ] or - [x]
  html = html.replace(
    /^\s*[\-\*]\s+\[ \]\s+(.*$)/gim,
    '<li class="flex items-center gap-2 list-none text-gray-700 dark:text-gray-300 my-1"><input type="checkbox" disabled class="rounded text-brand-500" /> <span>$1</span></li>',
  );
  html = html.replace(
    /^\s*[\-\*]\s+\[x\]\s+(.*$)/gim,
    '<li class="flex items-center gap-2 list-none text-gray-700 dark:text-gray-300 my-1"><input type="checkbox" checked disabled class="rounded text-brand-500" /> <span class="line-through text-gray-400">$1</span></li>',
  );

  // 11. Bullet & Numbered lists
  html = html.replace(
    /^\s*[\-\*]\s+(.*$)/gim,
    '<li class="ms-5 list-disc text-gray-700 dark:text-gray-300 my-1">$1</li>',
  );
  html = html.replace(
    /^\s*(\d+)\.\s+(.*$)/gim,
    '<li class="ms-5 list-decimal text-gray-700 dark:text-gray-300 my-1">$2</li>',
  );

  // 12. Prompt Variables / Placeholders e.g. {topic}, {tone}
  html = html.replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">{$1}</span>',
  );

  // 13. Markdown Tables: simple table parsing
  html = html.replace(
    /((?:\|[^\n]+\|\r?\n)+)/g,
    (match) => {
      const lines = match.trim().split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) return match;
      const headerLine = lines[0];
      const dataLines = lines.slice(2); // Skip separator line

      const parseRow = (line: string) =>
        line
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const headers = parseRow(headerLine);
      const ths = headers.map((h) => `<th class="border border-gray-200 dark:border-gray-800 px-3 py-2 text-start font-medium bg-gray-100 dark:bg-gray-800">${h}</th>`).join("");

      const rows = dataLines
        .map((line) => {
          const cells = parseRow(line);
          const tds = cells.map((c) => `<td class="border border-gray-200 dark:border-gray-800 px-3 py-2">${c}</td>`).join("");
          return `<tr>${tds}</tr>`;
        })
        .join("");

      return `<div class="my-4 overflow-x-auto"><table class="min-w-full text-xs border-collapse border border-gray-200 dark:border-gray-800"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
  );

  // 14. Paragraphs & Line breaks
  html = html.replace(
    /\n\n+/g,
    '</p><p class="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">',
  );
  html = html.replace(/\n/g, "<br />");

  return `<div class="space-y-3 leading-relaxed text-gray-700 dark:text-gray-300">${html}</div>`;
}
