// src/lib/constants.ts

export const CHANNELS = [
  {
    id: "ch1",
    label: "Join Main Channel",
    icon: "fab fa-whatsapp",
    href: "whatsapp://channel/0029VbD2bkWLNSZwxGpz2k0x",
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

export const OPTIONAL_CHANNEL = {
  label: "2027 JAMBITES",
  href: "https://whatsapp.com/channel/0029VbCwT4KAojYzRNFvpT1h",
};

export type Channel = typeof CHANNELS[0];
