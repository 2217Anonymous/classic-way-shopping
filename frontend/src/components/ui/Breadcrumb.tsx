import Link from "next/link";
import Container from "./Container";

export default function Breadcrumb({
  title,
  items,
}: {
  title: string;
  items?: { label: string; href?: string }[];
}) {
  const crumbs = items || [{ label: title }];

  return (
    <section className="section-breadcrumb margin-b-50">
      <Container>
        <div className="bb-breadcrumb-inner flex flex-wrap">
          <div className="w-full md:w-1/2">
            <h2 className="bb-breadcrumb-title">{title}</h2>
          </div>
          <div className="w-full md:w-1/2">
            <ul className="bb-breadcrumb-list">
              <li className="bb-breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li>
                <i className="ri-arrow-right-double-fill" />
              </li>
              {crumbs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.href ? "bb-breadcrumb-item" : "bb-breadcrumb-item active"}
                >
                  {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
