import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Single family for the whole site, matching every page in the
// "Five Star - Home.dc.html" Claude Design handoff (Round 7).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plusjakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Five Star Conveyancing",
  description: "Compare conveyancing solicitors, side by side.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        {children}
        {/* LiveChat widget — license 19914263 */}
        <Script id="livechat-init" strategy="afterInteractive">
          {`window.__lc = window.__lc || {};
window.__lc.license = 19914263;
window.__lc.integration_name = "manual_channels";
window.__lc.product_name = "livechat";
;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))`}
        </Script>
        <noscript>
          <a href="https://www.livechat.com/chat-with/19914263/" rel="nofollow">
            Chat with us
          </a>
          , powered by{" "}
          <a href="https://www.livechat.com/?welcome" rel="noopener nofollow" target="_blank">
            LiveChat
          </a>
        </noscript>
      </body>
    </html>
  );
}
