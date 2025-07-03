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
  name: "QuickCalendar",
  description: "The one-stop shop for all your calendar needs.",
  url: "https://quickcalendar.com",
  authors: [
    { name: "Gideon Ofori Addo", url: "https://github.com/wuzgood98" },
    { name: "Obed Ehoneah", url: "https://github.com/ehoneahobed" },
  ],
  og: "https://quickcalendar.com/og.png",
  themeColors: {
    light: "#ffffff",
    dark: "#000000",
  },
}
