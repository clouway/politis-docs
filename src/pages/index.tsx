import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

type Feature = {
  icon: string;
  title: string;
  text: string;
  to: string;
};

const FEATURES: Feature[] = [
  {
    icon: '🚀',
    title: 'Начало',
    text: 'Какво е Politis, модел на реализация и бърз старт за нови потребители.',
    to: '/get-started/introduction',
  },
  {
    icon: '📱',
    title: 'Мобилно приложение',
    text: 'За търговския представител: продажби, касов отчет, клиенти, ценови листи и стокови операции — с пълна офлайн поддръжка.',
    to: '/mobile/overview',
  },
  {
    icon: '🖥️',
    title: 'Бек офис (Web)',
    text: 'Централизирано управление на склад, клиенти, доставчици, фактури и парични потоци — със справки за управителя в реално време.',
    to: '/backoffice/overview',
  },
];

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  const logo = useBaseUrl('img/logo.png');
  return (
    <header className="politis-hero text-center px-4 py-20 md:py-24">
      <img
        src={logo}
        alt="Politis"
        width={96}
        height={96}
        className="politis-hero__logo w-24 h-24 mx-auto mb-7"
      />
      <h1 className="politis-hero__title mb-3">{siteConfig.title}</h1>
      <p className="politis-hero__tagline max-w-xl mx-auto mb-9">
        {siteConfig.tagline}
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          className="button button--lg button--success"
          to="/get-started/introduction">
          Започни тук
        </Link>
        <Link
          className="button button--lg button--outline hero-ghost-btn"
          to="/mobile/cash-session">
          Касов отчет (ново)
        </Link>
      </div>
    </header>
  );
}

function FeatureGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="politis-card">
            <span className="politis-card__icon" aria-hidden="true">
              {f.icon}
            </span>
            <h2 className="politis-card__title">
              {f.title}
              <span className="politis-card__arrow" aria-hidden="true">
                →
              </span>
            </h2>
            <p className="politis-card__text">{f.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout description="Ръководство за потребители и администратори на платформата Politis.">
      <Hero />
      <main>
        <FeatureGrid />
      </main>
    </Layout>
  );
}
