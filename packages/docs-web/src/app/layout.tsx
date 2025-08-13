import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { TRPCReactProvider } from "@/trpc/react";
import Image from "next/image";
import "../styles/globals.css";
import type { Metadata } from "next";
import appMetadata from "@/config/metadata";

export const metadata: Metadata = {
  title: {
    default: "ProductMint Documentation",
    template: "%s | ProductMint Documentation",
  },
  description: appMetadata.description,
  icons: [{ rel: "icon", url: `${appMetadata.url.base}/favicon.ico` }],
  applicationName: appMetadata.name,
  authors: [{ name: appMetadata.name, url: appMetadata.twitter.url }],
  keywords: [
    "productmint",
    "nft",
    "payment",
    "subscription",
    "blockchain",
    "cryptocurrency",
    "nft payment",
    "onchain subscription",
    "onchain payment",
    "crypto subscriptions",
    "crypto payments",
    "crypto",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: appMetadata.name,
    description: appMetadata.description,
    emails: appMetadata.contact.email,
    siteName: appMetadata.name,
    url: appMetadata.url.base,
    images: [appMetadata.openGraph.image],
  },
  twitter: {
    site: appMetadata.twitter.site,
    creator: appMetadata.twitter.creator,
    title: appMetadata.name,
    description: appMetadata.description,
    images: [appMetadata.openGraph.image],
  },
  appleWebApp: {
    capable: true,
    title: appMetadata.name,
    statusBarStyle: "black",
  },
  assets: appMetadata.url.assets,
};

const navbar = (
  <Navbar
    projectLink="https://github.com/KodiKraig/product-mint"
    chatLink="https://discord.gg/dEZpyh9Y35"
    logo={
      <div className="flex flex-row gap-2">
        <Image
          src="/assets/ProductMint_Logo.svg"
          alt="ProductMint"
          width={24}
          height={24}
        />
        <b className="text-2xl font-bold">ProductMint</b>
      </div>
    }
    // ... Your additional navbar options
  />
);

const footer = (
  <Footer className="text-bold text-xs">
    © {new Date().getFullYear()} ProductMint
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/KodiKraig/product-mint/tree/main/packages/docs-web"
          footer={footer}
          // ... Your additional layout options
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </Layout>
      </body>
    </html>
  );
}
