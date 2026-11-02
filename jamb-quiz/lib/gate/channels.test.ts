import { describe, expect, it } from "vitest"

import {
  whatsappChannelAppUrl,
  whatsappChannelHref,
  whatsappChannelWebUrl,
} from "@/lib/gate/channels"

const CODE = "0029VbTEST1234567890"

describe("WhatsApp channel links", () => {
  it("builds the official web link for desktop and fallback", () => {
    expect(whatsappChannelWebUrl(CODE)).toBe(
      `https://whatsapp.com/channel/${CODE}`
    )
  })

  it("uses an https universal link on mobile too", () => {
    expect(whatsappChannelAppUrl(CODE)).toBe(
      `https://whatsapp.com/channel/${CODE}`
    )
  })

  it("always returns the https channel URL by default", () => {
    expect(whatsappChannelHref(CODE)).toBe(
      `https://whatsapp.com/channel/${CODE}`
    )
  })

  it("returns app scheme when explicitly requested", () => {
    expect(whatsappChannelHref(CODE, true)).toBe(
      `whatsapp://channel/${CODE}`
    )
  })
})