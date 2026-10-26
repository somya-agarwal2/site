// ADAH JEWELS — Initial Default Catalogue Data (Empty by default: only custom-added pieces appear)
const DEFAULT_PRODUCTS = [];

// Helper: Generates elegant SVG jewellery art for items without an uploaded photo
function getJewelleryArtSvg(category, name) {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('earring') || cat.includes('jhumka') || cat.includes('stud')) {
    return `
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="jewel-svg">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F2D398"/>
            <stop offset="50%" stop-color="#C5A059"/>
            <stop offset="100%" stop-color="#9E7833"/>
          </linearGradient>
          <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF1EC"/>
            <stop offset="100%" stop-color="#DFBFB7"/>
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <!-- Hook & Stud -->
        <circle cx="80" cy="38" r="8" fill="url(#goldGrad)" filter="url(#softGlow)"/>
        <circle cx="80" cy="38" r="4" fill="#5B2938"/>
        <!-- Link ring -->
        <circle cx="80" cy="54" r="5" stroke="url(#goldGrad)" stroke-width="2.5" fill="none"/>
        <!-- Dangler Body -->
        <path d="M80 62 L96 95 C96 104 89 112 80 112 C71 112 64 104 64 95 Z" fill="url(#gemGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
        <circle cx="80" cy="92" r="5" fill="url(#goldGrad)"/>
        <!-- Hanging Pearl/Beads -->
        <circle cx="68" cy="118" r="3" fill="url(#goldGrad)"/>
        <circle cx="80" cy="122" r="4.5" fill="#FFFFFF" stroke="url(#goldGrad)" stroke-width="1.5"/>
        <circle cx="92" cy="118" r="3" fill="url(#goldGrad)"/>
        <!-- Shimmer highlights -->
        <path d="M74 80 L76 72 L78 80 Z" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `;
  } else if (cat.includes('pendant') || cat.includes('necklace') || cat.includes('chain')) {
    return `
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="jewel-svg">
        <defs>
          <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F7E2B5"/>
            <stop offset="50%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#8B6914"/>
          </linearGradient>
          <radialGradient id="evilEyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1E3A8A"/>
            <stop offset="45%" stop-color="#60A5FA"/>
            <stop offset="70%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#D4AF37"/>
          </radialGradient>
        </defs>
        <!-- Dainty Chain -->
        <path d="M30 20 Q80 80 130 20" stroke="url(#chainGrad)" stroke-width="2" stroke-dasharray="3 2" fill="none"/>
        <path d="M42 22 Q80 94 118 22" stroke="url(#chainGrad)" stroke-width="1.5" fill="none"/>
        <!-- Charm Connector -->
        <circle cx="80" cy="74" r="3" fill="url(#chainGrad)"/>
        <!-- Pendant Medallion -->
        <circle cx="80" cy="94" r="16" fill="url(#evilEyeGrad)" stroke="url(#chainGrad)" stroke-width="2"/>
        <circle cx="80" cy="94" r="4" fill="#0F172A"/>
        <!-- Pearl Accent -->
        <circle cx="80" cy="118" r="5" fill="#FFFDF8" stroke="url(#chainGrad)" stroke-width="1.5"/>
      </svg>
    `;
  } else if (cat.includes('scrunchie')) {
    return `
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="jewel-svg">
        <defs>
          <linearGradient id="satinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EED6CE"/>
            <stop offset="50%" stop-color="#D79E92"/>
            <stop offset="100%" stop-color="#B26C65"/>
          </linearGradient>
          <linearGradient id="tulipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCD5CE"/>
            <stop offset="100%" stop-color="#E76F51"/>
          </linearGradient>
        </defs>
        <!-- Ruffled Satin Ring -->
        <path d="M80 32 C105 32 125 52 125 78 C125 104 105 124 80 124 C55 124 35 104 35 78 C35 52 55 32 80 32 Z" fill="url(#satinGrad)" opacity="0.35"/>
        <path d="M80 40 C72 35 60 42 54 48 C46 56 42 68 44 78 C46 88 54 98 62 104 C72 110 86 112 96 106 C106 100 114 90 116 78 C118 66 112 54 104 46 C96 38 86 42 80 40 Z" fill="url(#satinGrad)" stroke="#B76E79" stroke-width="2"/>
        <circle cx="80" cy="76" r="16" fill="#FAF6F4" stroke="url(#satinGrad)" stroke-width="2"/>
        <!-- Tulip Charms -->
        <path d="M102 98 Q108 118 106 128" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
        <path d="M106 128 C102 124 100 134 106 138 C112 134 110 124 106 128 Z" fill="url(#tulipGrad)"/>
      </svg>
    `;
  } else {
    // Rings / Bracelets / General Luxury
    return `
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="jewel-svg">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F7E2B5"/>
            <stop offset="50%" stop-color="#C5A059"/>
            <stop offset="100%" stop-color="#8B6914"/>
          </linearGradient>
        </defs>
        <!-- Ring Band -->
        <ellipse cx="80" cy="95" rx="36" ry="18" fill="none" stroke="url(#ringGrad)" stroke-width="5"/>
        <ellipse cx="80" cy="95" rx="30" ry="14" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.6"/>
        <!-- Solitaire Crown -->
        <path d="M72 74 L80 60 L88 74 Z" fill="url(#ringGrad)"/>
        <!-- Solitaire Gem -->
        <polygon points="80,48 94,62 80,76 66,62" fill="#FFFFFF" stroke="url(#ringGrad)" stroke-width="2"/>
        <polygon points="80,52 90,62 80,72 70,62" fill="#F4EAE6" opacity="0.8"/>
      </svg>
    `;
  }
}
