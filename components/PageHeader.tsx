export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header>
      <div className="kicker">Gridiron Viz</div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{subtitle}</p>
    </header>
  );
}
