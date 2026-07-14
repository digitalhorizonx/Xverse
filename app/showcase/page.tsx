import type { Metadata } from "next";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { Breadcrumbs } from "@/components/showcase/Breadcrumbs";
import { ShowcaseExplorer, type ShowcaseCard } from "@/components/showcase/ShowcaseExplorer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDict } from "@/lib/i18n/server";
import { getPublicProducts, getPublicShowcaseByProductId } from "@/lib/content/publicContent";

export function generateMetadata(): Metadata {
  const { dict } = getDict();
  return {
    title: dict.meta.showcaseIndexTitle,
    description: dict.meta.showcaseIndexDescription,
  };
}

export default function ShowcaseIndexPage() {
  const { dict, locale } = getDict();

  const cards: ShowcaseCard[] = getPublicProducts(locale).map((product) => {
    const showcase = getPublicShowcaseByProductId(product.id, locale) ?? undefined;
    const industries = [...new Set(showcase?.sampleBusinesses.map((b) => b.industry) ?? [])];
    return {
      id: product.id,
      slug: product.showcaseSlug,
      name: product.name,
      tagline: showcase?.heroTagline ?? product.tagline,
      description: product.description,
      color: product.color,
      accentColor: product.accentColor,
      status: product.status,
      industries,
      haystack: [
        product.name,
        product.tagline,
        product.description,
        showcase?.heroTagline ?? "",
        showcase?.heroDescription ?? "",
        ...industries,
        ...(showcase?.capabilities.map((c) => `${c.title} ${c.description}`) ?? []),
        ...(showcase?.sampleBusinesses.map((b) => `${b.name} ${b.summary}`) ?? []),
      ].join(" "),
    };
  });

  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-5 pt-5 sm:px-8">
        <Breadcrumbs crumbs={[{ label: dict.breadcrumbs.universe, href: "/" }, { label: dict.breadcrumbs.showcase }]} />
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-12">
        <SectionHeading
          eyebrow={dict.showcaseIndex.eyebrow}
          title={dict.showcaseIndex.title}
          description={dict.showcaseIndex.body}
        />

        <ShowcaseExplorer cards={cards} />
      </section>
    </main>
  );
}
