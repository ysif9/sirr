'use client'

import React from 'react'
import { Squircle } from '@squircle-js/react'
import {
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Link as LinkIcon,
  BookUser
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Helper component for styled list items
const GuideListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

// Helper for external link buttons
const ExternalLinkButton = ({ href, text }: { href: string; text: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200 hover:underline transition-colors"
  >
    <LinkIcon className="w-3 h-3" />
    {text}
  </a>
);


// Main Component
const AnonymityGuide = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Your Guide to Anonymity</h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Your safety is our top priority. Following these steps helps ensure your identity remains protected, even before you submit a report.
        </p>
      </section>

      {/* Critical Warning */}
      <Squircle cornerRadius={20} cornerSmoothing={1} className="bg-red-900/40 border border-red-500/30 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-red-300">Why This Is Critical for Reporters</h3>
            <p className="mt-2 text-red-200/90">
              If you're submitting a report about your workplace or from a network you don't control, your employer or network administrator can see the websites you visit. This could expose your identity and put you at risk of retaliation. 
              <strong className="block mt-2">These steps are essential to protect you.</strong>
            </p>
          </div>
        </div>
      </Squircle>
      
      {/* Quick Start Section */}
      <Squircle cornerRadius={20} cornerSmoothing={1} className="bg-slate-800 border border-slate-700 p-6">
        <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-400"/>
              <h2 className="text-2xl font-bold">Quick Start: Get Protected in 5 Minutes</h2>
            </div>
            <p>For immediate protection, we highly recommend using Cloudflare WARP. It's free, easy to use, and effectively hides your browsing from your Internet Provider (ISP) or employer.</p>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-gray-300">
              <li>Download and install the app for your device.</li>
              <li>Open the app and flip the switch to "Connected".</li>
              <li>That's it! Your connection is now private.</li>
            </ol>
            <div className="pt-4 flex flex-wrap gap-4">
              <a href="https://1.1.1.1/" target="_blank" rel="noopener noreferrer" className="inline-block group transition-all transform hover:scale-105">
                <Squircle cornerRadius={12} cornerSmoothing={1} className="bg-white text-slate-900 font-bold py-2 px-4 shadow-lg group-hover:bg-gray-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5"/> Download WARP
                  </div>
                </Squircle>
              </a>
              <ExternalLinkButton href="https://1.1.1.1/help" text="Verify Your Connection" />
            </div>
        </section>
      </Squircle>

      {/* Detailed Guide */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <BookUser className="w-6 h-6 text-sky-400"/>
          <h2 className="text-2xl font-bold">Detailed Privacy Guide</h2>
        </div>
        
        <p>For those who want a deeper understanding or prefer manual setup, this guide provides more options.</p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-slate-800/50 border border-slate-700 rounded-lg">
            <AccordionTrigger className="w-full text-left p-4 text-lg font-semibold text-white hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg">
              Best Practices for Reporting
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-t border-slate-700 p-6">
                <ul className="space-y-3">
                  <GuideListItem>
                    <strong>Use a non-work device and network:</strong> If possible, report from a personal device on a network not connected to your employer (like home Wi-Fi or public Wi-Fi with WARP/VPN enabled).
                  </GuideListItem>
                  <GuideListItem>
                    <strong>Avoid personal details:</strong> Do not include your name, contact information, or any details in the report that could identify you unless absolutely necessary for the report itself.
                  </GuideListItem>
                  <GuideListItem>
                    <strong>Use secure connections:</strong> Always ensure your connection is protected with one of the tools below before visiting our site.
                  </GuideListItem>
                  <GuideListItem>
                    <strong>Privacy-focused browsers:</strong> Consider using browsers like Brave or Firefox, which offer stronger default privacy protections.
                  </GuideListItem>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="bg-slate-800/50 border border-slate-700 rounded-lg">
            <AccordionTrigger className="w-full text-left p-4 text-lg font-semibold text-white hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg">
              Advanced Option 1: Secure Your Browser (DNS-over-HTTPS)
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-t border-slate-700 p-6 space-y-4">
                <p>DNS-over-HTTPS (DoH) encrypts the part of your traffic that reveals which websites you visit. You can enable it directly in your browser.</p>
                <div>
                  <h4 className='font-bold text-white mb-1'>Firefox:</h4>
                  <p className="text-sm">Settings → Privacy & Security → Enable DNS over HTTPS → Max Protection.</p>
                </div>
                <div>
                  <h4 className='font-bold text-white mb-1'>Chrome/Edge:</h4>
                  <p className="text-sm">Settings → Privacy and security → Security → Use secure DNS (set to Cloudflare).</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="bg-slate-800/50 border border-slate-700 rounded-lg">
            <AccordionTrigger className="w-full text-left p-4 text-lg font-semibold text-white hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg">
              Advanced Option 2: Use a VPN
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-t border-slate-700 p-6 space-y-4">
                <p>A Virtual Private Network (VPN) provides the strongest protection by encrypting all your internet traffic and hiding your true IP address.</p>
                <div className='flex items-start gap-2 text-yellow-300'>
                  <AlertTriangle className='w-4 h-4 mt-1 flex-shrink-0' />
                  <p><strong>Important:</strong> Not all VPNs are trustworthy. Avoid free VPNs that may log and sell your data. Choose a reputable, paid VPN with a strict "no-logs" policy.</p>
                </div>
                <p className='font-bold text-white'>Recommended Providers:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><ExternalLinkButton href="https://mullvad.net" text="Mullvad" /> - Strong privacy focus, accepts anonymous payments.</li>
                  <li><ExternalLinkButton href="https://protonvpn.com" text="ProtonVPN" /> - Based in Switzerland with strong privacy laws.</li>
                  <li><ExternalLinkButton href="https://www.ivpn.net/" text="IVPN" /> - Transparent and regularly audited.</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final Reassurance */}
        <section className="text-center border-t border-slate-700 pt-12">
        <h2 className="text-2xl font-bold text-white">Your Courage to Report Matters. Your Safety Matters More.</h2>
        <p className="mt-4 text-gray-400">We are committed to providing a secure platform for you to share information safely. By taking these extra steps, you add a powerful layer of protection to your anonymity.</p>
      </section>
    </div>
  )
}

export default AnonymityGuide