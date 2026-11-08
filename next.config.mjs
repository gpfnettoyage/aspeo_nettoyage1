import createMDX from '@next/mdx'


/** @type {import('next').NextConfig} */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://c.bing.com https://va.vercel-scripts.com https://static.hotjar.com https://script.hotjar.com https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.googletagmanager.com https://*.public.blob.vercel-storage.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://c.bing.com https://vitals.vercel-insights.com https://in.hotjar.com https://insights.hotjar.com https://api.hotjar.com wss://ws.hotjar.com https://content.hotjar.io https://metrics.hotjar.io https://vercel.live;
    frame-src 'self' https://vercel.live;
`;

const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader.replace(/\n/g, ''),
                    }
                ]
            },
        ];
    },
    async redirects() {
        return [
            // Redirection principale /services vers /proprete-services
            {
                source: '/services',
                destination: '/proprete-services',
                permanent: true, // Redirection 301 pour le SEO
            },
            // Redirections spécifiques pour services renommés (DOIVENT être avant la redirection générique)
            // Redirection pour le service renommé "Nettoyage de Façades, Toitures, Terrasses" vers "Nettoyage Exterieur"
            {
                source: '/services/nettoyage-de-facades-toitures-terrasses',
                destination: '/proprete-services/nettoyage-exterieur',
                permanent: true,
            },
            // Redirection pour le service renommé "Nettoyage de Locaux Commerciaux" vers "Nettoyage de Surfaces Commerciales"
            {
                source: '/services/nettoyage-de-locaux-commerciaux',
                destination: '/proprete-services/nettoyage-de-surfaces-commerciales',
                permanent: true,
            },
            // Redirection pour le service supprimé "Nettoyage de Piscines"
            {
                source: '/services/nettoyage-de-piscines',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection pour le service supprimé "Nettoyage Transport"
            {
                source: '/services/nettoyage-transport',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection pour le service supprimé "Nettoyage de Tapis et Canapés"
            {
                source: '/services/nettoyage-de-tapis-et-canapes',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection pour le service supprimé "Nettoyage Industriel"
            {
                source: '/services/nettoyage-industriel',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection pour l'URL /proprete-services/nettoyage-industriel (ancien lien d'actualités)
            {
                source: '/proprete-services/nettoyage-industriel',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection pour l'URL /proprete-services/nettoyage-de-tapis-et-canapes (indexée par Google)
            {
                source: '/proprete-services/nettoyage-de-tapis-et-canapes',
                destination: '/proprete-services',
                permanent: true,
            },
            // Redirection générique des pages de services individuels (DOIT être après les redirections spécifiques)
            {
                source: '/services/:title*',
                destination: '/proprete-services/:title*',
                permanent: true,
            },
            // Redirection de /temoignages vers /avis
            {
                source: '/temoignages',
                destination: '/avis',
                permanent: true,
            },
        ];
    }
};

const withMDX = createMDX({
    options: {
        remarkPlugins: ['remark-gfm'],
        rehypePlugins: [],
    },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
