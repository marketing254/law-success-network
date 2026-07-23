import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import {
  getAgreement,
  allAgreementSlugs,
  AGREEMENT_INDEX,
  type Block,
} from "@/lib/agreements";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allAgreementSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getAgreement(slug);
  if (!doc) return { title: "Agreement not found | Law Member Network" };

  return {
    title: `${doc.title} | Law Member Network`,
    description:
      doc.parties ??
      "The Law Member Network agreements. Law Member Network, a service offered by Ekwa Marketing Inc.",
    openGraph: { title: doc.title, url: `/agreements/${slug}` },
  };
}

/** Renders **bold** spans without dangerouslySetInnerHTML. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="ag-p">
          <Rich text={block.text} />
        </p>
      );

    case "ul":
      return (
        <ul className="ag-ul">
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      );

    case "ramp":
      return (
        <div className="ag-ramp">
          {block.steps.map((s, i) => (
            <div className="ag-rstep" key={i}>
              <div className="n">{s.amount}</div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>
      );

    case "roles":
      return (
        <div className="ag-roles">
          {block.chips.map((c, i) => (
            <span className={c.active ? "ag-chip on" : "ag-chip"} key={i}>
              {c.active ? <span aria-hidden="true">&#10003;</span> : null}
              {c.label}
            </span>
          ))}
        </div>
      );

    case "field":
      return (
        <div className="ag-field">
          <span className="q">{block.label}</span>
          <span className="line">{block.value}</span>
        </div>
      );

    case "note":
      return <p className="ag-note-inline">{block.text}</p>;

    default:
      return null;
  }
}

export default async function AgreementPage({ params }: Props) {
  const { slug } = await params;
  const doc = getAgreement(slug);
  if (!doc) notFound();

  return (
    <>
      <SiteNav active="agreements" />

      <main className="ag-page">
        <div className="wrap ag-wrap">
          <div className="ag-crumb">
            <Link href="/agreements">Agreements</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.docLabel ?? doc.title}</span>
          </div>

          <h1 className="ag-title">{doc.title}</h1>
          {doc.subtitle ? <p className="ag-sub">{doc.subtitle}</p> : null}

          {doc.parties ? (
            <div className="ag-parties">
              <Rich text={doc.parties} />
            </div>
          ) : null}

          <article className="ag-body">
            {doc.sections.map((section, i) => (
              <section className="ag-sec" key={i}>
                {section.heading ? <h2>{section.heading}</h2> : null}
                {section.blocks.map((block, j) => (
                  <BlockView block={block} key={j} />
                ))}
              </section>
            ))}
          </article>

          {doc.footer ? <p className="ag-footer">{doc.footer}</p> : null}

          <nav className="ag-others" aria-label="Other agreements">
            <h3>The other agreements</h3>
            <div className="ag-otherlinks">
              {AGREEMENT_INDEX.filter((a) => a.slug !== slug).map((a) => (
                <Link key={a.slug} href={`/agreements/${a.slug}`}>
                  <b>{a.label}</b>
                  <small>{a.who}</small>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
