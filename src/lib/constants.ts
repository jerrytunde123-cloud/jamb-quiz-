// src/lib/constants.ts (or wherever CHANNELS is)
export const CHANNELS = [
  {
    id: "ch1",
    label: "Join Main Channel",
    icon: "fab fa-whatsapp",
    // We'll use the deep link format: whatsapp://channel/CODE
    href: "whatsapp://channel/0029VbD2bkWLNSZwxGpz2k0x",
    // Keep the web fallback just in case
    webUrl: "https://whatsapp.com/channel/0029VbD2bkWLNSZwxGpz2k0x",
  },
  {
    id: "ch2",
    label: "JAMB UTME",
    icon: "fab fa-whatsapp",
    href: "whatsapp://channel/0029VbDTOmB1t90jcv9gLf0q",
    webUrl: "https://whatsapp.com/channel/0029VbDTOmB1t90jcv9gLf0q",
  },
];

export type Channel = typeof CHANNELS[0];
