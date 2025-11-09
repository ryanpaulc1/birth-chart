"use client";

import { useEffect, useState, use } from "react";
import AstrologyWheel from "@/components/AstrologyWheel";

// Zodiac symbol images
const ZODIAC_IMAGES: { [key: string]: string } = {
  "Aries": "/zodiac/Aries.png",
  "Taurus": "/zodiac/Taurus.png",
  "Gemini": "/zodiac/Gemini.png",
  "Cancer": "/zodiac/Cancer.png",
  "Leo": "/zodiac/Leo.png",
  "Virgo": "/zodiac/Virgo.png",
  "Libra": "/zodiac/Libra.png",
  "Scorpio": "/zodiac/Scorpio.png",
  "Sagittarius": "/zodiac/Sagittarius.png",
  "Capricorn": "/zodiac/Capricorn.png",
  "Aquarius": "/zodiac/Aquarius.png",
  "Pisces": "/zodiac/Pisces.png"
};

// For now, we'll use mock data - in production, fetch based on ID
export default function ChartPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [displayedSign, setDisplayedSign] = useState<string | null>(null);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // In production, fetch chart data based on resolvedParams.id
    // For now, use sessionStorage to get the data from the form submission
    const storedData = sessionStorage.getItem("lastChart");
    if (storedData) {
      setChartData(JSON.parse(storedData));
    }
  }, [resolvedParams.id]);

  // Prevent scrolling on mobile to avoid address bar issues
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Prevent scrolling on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, []);

  // Handle sign selection with fade out/in transition
  useEffect(() => {
    if (selectedSign) {
      if (displayedSign && selectedSign !== displayedSign) {
        // Fade out current content
        setContentVisible(false);
        // Wait for fade out, then update displayed sign
        const fadeOutTimeout = setTimeout(() => {
          setDisplayedSign(selectedSign);
          // Wait a bit for DOM to update, then fade in new content
          const fadeInTimeout = setTimeout(() => {
            setContentVisible(true);
          }, 50);
          return () => clearTimeout(fadeInTimeout);
        }, 500); // 500ms fade out to match duration
        return () => clearTimeout(fadeOutTimeout);
      } else {
        // First time showing panel
        setDisplayedSign(selectedSign);
        setTimeout(() => setContentVisible(true), 50);
      }
    }
  }, [selectedSign, displayedSign]);

  if (!chartData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading chart...</p>
      </main>
    );
  }

  const { name, birthDetails, kundli, planets } = chartData;

  // Map Vedic names to Western zodiac signs
  const vedicToWestern: { [key: string]: string } = {
    "Mesha": "Aries",
    "Vrishabha": "Taurus",
    "Mithuna": "Gemini",
    "Karka": "Cancer",
    "Simha": "Leo",
    "Kanya": "Virgo",
    "Tula": "Libra",
    "Vrishchika": "Scorpio",
    "Dhanu": "Sagittarius",
    "Makara": "Capricorn",
    "Kumbha": "Aquarius",
    "Meena": "Pisces"
  };

  const sunSignVedic = birthDetails?.data?.soorya_rasi?.name || "Unknown";
  const moonSignVedic = birthDetails?.data?.chandra_rasi?.name || "Unknown";

  const sunSign = vedicToWestern[sunSignVedic] || birthDetails?.data?.zodiac?.name || sunSignVedic;
  const moonSign = vedicToWestern[moonSignVedic] || moonSignVedic;

  // Get rising sign from kundli data (lagna)
  const risingSignVedic = kundli?.data?.lagna_rasi?.name || "Capricorn";
  const risingSign = vedicToWestern[risingSignVedic] || risingSignVedic;

  return (
    <main className="relative min-h-[200vh]">
      {/* Golden gradient glow at bottom */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-[523px] h-[523px] pointer-events-none z-0"
        style={{
          bottom: '-350px',
          background: 'radial-gradient(circle, rgba(208, 209, 201, 0.9) 0%, rgba(208, 209, 201, 0.6) 25%, rgba(208, 209, 201, 0.3) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Fixed Header - shifts left on desktop when drawer open, hidden on mobile when drawer open */}
      <div className={`fixed top-12 left-0 z-10 transition-all duration-500 ${
        selectedSign ? 'lg:right-[400px] max-lg:hidden' : 'right-0'
      }`}>
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-6xl text-cream mb-4">
            {name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            Sun in <span className="italic">{sunSign}</span>, Moon in{" "}
            <span className="italic">{moonSign}</span>,
            <br />
            <span className="italic">{risingSign}</span> Rising
          </p>
        </div>
      </div>

      {/* Fixed Astrology Wheel - shifts left on desktop when drawer is open, hidden on mobile when drawer open */}
      <div
        className={`fixed top-1/2 left-1/2 translate-y-[-20%] w-[150vw] lg:w-[90vw] lg:max-w-[1000px] pointer-events-none transition-transform duration-500 ${
          selectedSign ? 'lg:-translate-x-[calc(50%+200px)] max-lg:hidden z-[26]' : '-translate-x-1/2 z-5'
        }`}
      >
        <div className="pointer-events-auto">
          <AstrologyWheel
            sunSign={sunSign}
            moonSign={moonSign}
            risingSign={risingSign}
            planets={planets}
            onSignClick={setSelectedSign}
            drawerOpen={!!selectedSign}
          />
        </div>
      </div>

      {/* Sticky bottom section with gradient fade - shifts left on desktop when drawer open, hidden on mobile when drawer open */}
      <div className={`fixed bottom-0 left-0 z-[27] transition-all duration-500 ${
        selectedSign ? 'lg:right-[400px] max-lg:hidden' : 'right-0'
      }`}>
        {/* Gradient overlay to fade wheel */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #181818 0%, #181818 40%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 pb-8">
          {/* Instruction text */}
          <p className="text-center text-white/80 mb-6 font-['Mabry_Mono_Pro',monospace] text-sm">
            Scroll to SPIN the WHEEL
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="bg-black text-cream px-8 py-4 rounded-lg font-medium text-lg hover:bg-black/80 transition-colors">
              buy a print
            </button>
            <button className="bg-black text-cream px-8 py-4 rounded-lg font-medium text-lg hover:bg-black/80 transition-colors">
              speak with an expert
            </button>
          </div>

          {/* Back button */}
          <div className="text-center">
            <a
              href="/"
              className="text-cream/80 hover:text-cream underline transition-colors"
            >
              ← Create another chart
            </a>
          </div>
        </div>
      </div>

      {/* Background overlay - click to close on desktop */}
      {selectedSign && (
        <div
          className="hidden lg:block fixed inset-0 z-25 cursor-pointer"
          onClick={() => setSelectedSign(null)}
        />
      )}

      {/* Right Panel Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full lg:w-[400px] bg-[#181818] z-30 transition-opacity duration-500 ${
          selectedSign ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Vertical Divider - hidden on mobile */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-[#4e5e89]" />

        {/* Content with fade out/in transition */}
        <div className="px-6 lg:px-12 pt-14 pb-32 overflow-y-auto h-full">
          {displayedSign && (
            <div
              key={displayedSign}
              className={`transition-opacity duration-500 ${
                contentVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Zodiac Symbol Image - upright, max 150px on longest dimension */}
              <div className="mb-6 opacity-90 flex items-start">
                <img
                  src={ZODIAC_IMAGES[displayedSign]}
                  alt={displayedSign}
                  className="max-w-[150px] max-h-[150px] object-contain"
                />
              </div>

              {/* Zodiac Name */}
              <h2 className="text-5xl text-white mb-12 font-['Instrument_Serif']">
                {displayedSign}
              </h2>

              {/* Description */}
              <p className="text-sm text-[#d0d1c9] leading-[1.45] font-[family-name:var(--font-geist-mono)] font-light">
                {getZodiacDescription(displayedSign)}
              </p>
            </div>
          )}
        </div>

        {/* Back to wheel button - mobile only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#4e5e89] p-6 text-center">
          <button
            onClick={() => setSelectedSign(null)}
            className="text-cream/80 hover:text-cream underline transition-colors"
          >
            ← Back to wheel
          </button>
        </div>
      </div>
    </main>
  );
}

// Zodiac sign descriptions
function getZodiacDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    "Aries": "The first sign of the zodiac, Aries is known for its pioneering spirit and bold energy. As a fire sign ruled by Mars, Aries brings courage, enthusiasm, and a natural leadership quality. Those influenced by Aries energy are often direct, ambitious, and ready to take on new challenges with unwavering confidence.",
    "Taurus": "Grounded and steady, Taurus is an earth sign ruled by Venus. This sign embodies stability, sensuality, and appreciation for life's pleasures. Taurus energy brings patience, determination, and a love for comfort and beauty. Known for reliability and practical wisdom.",
    "Gemini": "Ruled by Mercury, Gemini is the sign of communication and duality. This air sign brings curiosity, adaptability, and intellectual energy. Gemini influences quick thinking, social connections, and a love for learning and exchanging ideas.",
    "Cancer": "Cancer is a water sign ruled by the Moon, deeply connected to emotion and intuition. This sign brings nurturing energy, emotional depth, and strong ties to home and family. Cancer energy is protective, empathetic, and highly attuned to feelings.",
    "Leo": "Ruled by the Sun, Leo is a fire sign radiating warmth, creativity, and confidence. This sign brings natural charisma, generosity, and a flair for self-expression. Leo energy inspires leadership, loyalty, and a love for celebration and recognition.",
    "Virgo": "An earth sign ruled by Mercury, Virgo brings analytical precision and practical service. This sign embodies attention to detail, organization, and a desire for improvement. Virgo energy is methodical, helpful, and committed to excellence.",
    "Libra": "Ruled by Venus, Libra is an air sign seeking balance, harmony, and beauty. This sign brings diplomatic energy, social grace, and a love for partnership. Libra influences fairness, aesthetic appreciation, and the ability to see multiple perspectives.",
    "Scorpio": "Scorpio is a water sign ruled by Pluto and Mars, known for intensity and transformation. This sign brings deep emotional power, investigative abilities, and magnetic presence. Scorpio energy is passionate, resourceful, and unafraid of life's mysteries.",
    "Sagittarius": "Ruled by Jupiter, Sagittarius is a fire sign embodying adventure and philosophy. This sign brings optimism, wanderlust, and a quest for meaning. Sagittarius energy is expansive, honest, and always seeking growth and new horizons.",
    "Capricorn": "An earth sign ruled by Saturn, Capricorn represents discipline and ambition. This sign brings structure, responsibility, and long-term vision. Capricorn energy is patient, strategic, and committed to building lasting achievements.",
    "Aquarius": "Ruled by Uranus and Saturn, Aquarius is an air sign of innovation and humanity. This sign brings progressive thinking, independence, and concern for collective wellbeing. Aquarius energy is original, intellectual, and future-oriented.",
    "Pisces": "Pisces is a water sign ruled by Neptune and Jupiter, deeply spiritual and imaginative. This sign brings compassion, artistic sensitivity, and connection to the unseen. Pisces energy is intuitive, empathetic, and fluid like the ocean it represents."
  };

  return descriptions[sign] || "A powerful celestial influence in your birth chart.";
}
