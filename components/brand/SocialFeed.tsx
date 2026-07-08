import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import type { SocialPost } from "@/data/types";
import { Section } from "./Section";
import { PLATFORM_LABEL, PLATFORM_COLOR } from "./platformMeta";

function PostCard({ post }: { post: SocialPost }) {
  return (
    <article className="glass-strong flex flex-col gap-4 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white"
          style={{ backgroundColor: PLATFORM_COLOR[post.platform] }}
        >
          {PLATFORM_LABEL[post.platform]}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-mist-500">{post.format}</span>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs italic text-mist-500">
        {post.visualPrompt}
      </div>

      <p className="text-sm text-mist-200">{post.caption}</p>

      <div className="mt-auto flex items-center gap-4 text-xs text-mist-500">
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" aria-hidden /> {post.likes.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {post.comments.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Repeat2 className="h-3.5 w-3.5" aria-hidden /> {post.shares.toLocaleString()}
        </span>
        <span className="ms-auto">{post.postedAt}</span>
      </div>
    </article>
  );
}

export function SocialFeed({ posts, reels }: { posts: SocialPost[]; reels: SocialPost[] }) {
  const all = [...posts, ...reels].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));

  return (
    <Section
      eyebrow="Social Media Feed"
      title="Sample posts, reels & captions"
      description="A representative slice of the content Xability plans, writes, and publishes for this brand."
      illustrative
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  );
}
