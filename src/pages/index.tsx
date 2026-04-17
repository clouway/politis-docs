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
    text: 'Касов отчет, продажби, клиенти, ценови листи и стокови операции на терен.',
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
    <header
      className="text-white text-center px-4 py-20"
      style={{background: 'linear-gradient(135deg, #264F89 0%, #1a375e 100%)'}}
    >
      <img
        src={logo}
        alt="Politis"
        className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-2xl"
      />
      <h1 className="text-5xl font-bold mb-2">{siteConfig.title}</h1>
      <p className="text-xl opacity-90 mb-8">{siteConfig.tagline}</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          className="button button--lg button--success"
          to="/get-started/introduction"
        >
          Започни тук
        </Link>
        <Link
          className="button button--lg button--outline hero-ghost-btn"
          to="/mobile/cash-session"
        >
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
          <Link
            key={f.to}
            to={f.to}
            className="block p-8 rounded-xl border border-[color:var(--ifm-color-emphasis-200)] bg-[color:var(--ifm-background-surface-color)] hover:-translate-y-1 hover:shadow-xl hover:border-[color:var(--ifm-color-primary)] transition-all !no-underline !text-inherit"
          >
            <div className="text-5xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-[color:var(--ifm-color-primary)]">
              {f.title}
            </h3>
            <p className="opacity-80 m-0">{f.text}</p>
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
