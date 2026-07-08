import type { Brand } from "@/data/types";
import { Section } from "./Section";

export function BrandStory({ brand }: { brand: Brand }) {
  return (
    <Section eyebrow="Brand Story" title={`How ${brand.name} works with ${brand.servicesUsed[0]}`}>
      <p className="max-w-3xl text-lg leading-relaxed text-mist-300">{brand.brandStory}</p>
    </Section>
  );
}
