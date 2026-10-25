import type { ReactNode } from "react";
import { Container, PageHero } from "@/components/site/primitives";

/** Inner-page wrapper: hero band + content container (narrow for forms/legal, wide for grids). */
export function PageShell({
  eyebrow,
  title,
  intro,
  wide,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <Container narrow={!wide} className="py-14 sm:py-20">
        {children}
      </Container>
    </>
  );
}
