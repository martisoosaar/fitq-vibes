'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    askly: any
  }
}

export default function AsklyWidget() {
  const asklyKey = process.env.NEXT_PUBLIC_ASKLY_CLIENT_KEY

  useEffect(() => {
    if (!asklyKey) return

    // Initialize Askly when script loads
    if (window.askly) {
      window.askly.init({
        clientKey: asklyKey,
        locale: 'et', // Estonian by default
      })
    }
  }, [asklyKey])

  if (!asklyKey) {
    return null
  }

  return (
    <Script
      id="askly-widget"
      strategy="lazyOnload"
      src="https://widget.askly.com/widget.js"
      onLoad={() => {
        if (window.askly) {
          window.askly.init({
            clientKey: asklyKey,
            locale: 'et',
          })
        }
      }}
    />
  )
}