type SiteConfig = {
  name: string
  description: string
  url: string
  authors: { name: string; url: string }[]
  og: string
  themeColors: {
    light: string
    dark: string
  }
}

export const siteConfig: SiteConfig = {
  name: "Kreeew",
  description: "Turn your ideas into income streams with AI-powered content creation, email courses, and automation.",
  url: "https://kreeew.com",
  authors: [
    { name: "Obed Ehoneah", url: "https://github.com/ehoneahobed" },
  ],
  og: "https://kreeew.com/og.png",
  themeColors: {
    light: "#ffffff",
    dark: "#000000",
  },
}
