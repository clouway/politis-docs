import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Politis Docs',
  tagline: 'Ръководство за потребители и администратори',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://docs.politis.clouway.com',
  baseUrl: '/',

  organizationName: 'clouway',
  projectName: 'politis-docs',

  plugins: [require.resolve('./plugins/tailwind-config.cjs')],

  onBrokenLinks: 'warn',

  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    localeConfigs: {
      bg: {label: 'Български', htmlLang: 'bg-BG'},
      en: {label: 'English', htmlLang: 'en-US'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/clouway/politis-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Politis',
      logo: {
        alt: 'Politis Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'getStartedSidebar',
          position: 'left',
          label: 'Начало',
        },
        {
          type: 'docSidebar',
          sidebarId: 'mobileSidebar',
          position: 'left',
          label: 'Мобилно',
        },
        {
          type: 'docSidebar',
          sidebarId: 'backofficeSidebar',
          position: 'left',
          label: 'Бек офис',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Документация',
          items: [
            {label: 'Мобилно приложение', to: '/mobile/cash-session'},
            {label: 'Бек офис', to: '/backoffice/cash-session'},
          ],
        },
        {
          title: 'Връзки',
          items: [
            {label: 'clouway.com', href: 'https://clouway.com'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} clouWay. Всички права запазени.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
