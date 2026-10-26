// ADAH JEWELS — Initial Default Catalogue Data (34 Verified Items)
const DEFAULT_PRODUCTS = [
  // Page 2: Rs 50
  { id: 'AJ-E50-01', name: 'Black Floral Drop Earrings', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: true, desc: 'Delicate floral black studs with drop hooks, perfect for everyday chic.' },
  { id: 'AJ-E50-02', name: 'Ruby Pink Floral Studs', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: true, desc: 'Bright magenta-ruby stone studs with antique silver beading & pearl drops.' },
  { id: 'AJ-E50-03', name: 'Daisy Pearl Tops', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: false, desc: 'Minimalist double pearl studs with subtle crystal floral spacers.' },
  { id: 'AJ-E50-04', name: 'Onyx Black Halo Studs', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: true, desc: 'Classic black stone with pearl drops and detailed oxidized edging.' },

  // Page 3: Rs 50
  { id: 'AJ-E50-05', name: 'Golden Pearl Duet Studs', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: false, desc: 'Modern dual-tone white and metallic gold bead earrings.' },
  { id: 'AJ-E50-06', name: 'Pink Cluster Drops', price: 50, category: 'Earrings', tier: '₹50', image: '', type: 'earrings', featured: true, desc: 'Soft pastel pink drop earrings for subtle festive styling.' },
  { id: 'AJ-S50-01', name: 'Pastel Tulip Satin Scrunchies', price: 50, category: 'Scrunchies', tier: '₹50', image: '', type: 'scrunchies', featured: true, desc: 'Silk satin scrunchies featuring charming hanging tulip flower accents.' },

  // Page 4: Rs 60
  { id: 'AJ-E60-01', name: 'Silver Disco Bead Drops', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Textured stone studded spherical jhumki drops.' },
  { id: 'AJ-E60-02', name: 'Mini Bell Jhumkas', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Intricately patterned oxidized bells with hanging ghungroo beads.' },
  { id: 'AJ-E60-03', name: 'Floral Chandelier Earrings', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: false, desc: 'Boho black floral centerpiece framed by hanging silver beads.' },
  { id: 'AJ-E60-04', name: 'Royal Blue Crystal Jhumkas', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Gold finish cone jhumkis encrusted with deep royal blue crystals.' },

  // Page 5: Rs 60
  { id: 'AJ-E60-05', name: 'Golden Filigree Orbs', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: false, desc: 'Cut-out filigree hollow gold balls with sparkling top studs.' },
  { id: 'AJ-E60-06', name: 'Antique Chime Latkans', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Dual-strand oxidized dangler with multiple bell cluster drops.' },
  { id: 'AJ-E60-07', name: 'Dome Pattern Stud Jhumka', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: false, desc: 'Textured dome jhumka studs with antique black patina.' },
  { id: 'AJ-E60-08', name: 'Linear Bar Stone Drops', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Modern bar earrings with marbled stone and dark silver tassels.' },

  // Page 6: Rs 60
  { id: 'AJ-E60-09', name: 'Crystal Blossom Dangle', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Silver petal flowers with shimmering crystal stone and sleek bars.' },
  { id: 'AJ-E60-10', name: 'White Kundan Floral Drops', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Classic white stone floral motif with delicate silver hanging accents.' },
  { id: 'AJ-E60-11', name: 'Emerald Sparkle Studs', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: true, desc: 'Deep green emerald cut stone with surrounding halo crystals.' },
  { id: 'AJ-E60-12', name: 'Magenta Jhumki Studs', price: 60, category: 'Earrings', tier: '₹60', image: '', type: 'earrings', featured: false, desc: 'Oxidized peacock motif with rich magenta center stone and pearls.' },

  // Page 7: Rs 100
  { id: 'AJ-E100-01', name: 'Leaf Branch Jhumkas', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Detailed leafy stem post holding a tall textured cylindrical jhumka.' },
  { id: 'AJ-E100-02', name: 'Black Onyx Teardrop Hoops', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: false, desc: 'Intricate silver filigree hoop adorned with teardrop black beads.' },
  { id: 'AJ-E100-03', name: 'Ruby Meenakari Chandelier', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Festive red & green enamel stone work with pearl hangings.' },
  { id: 'AJ-E100-04', name: 'Statement Feather Chandbalis', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Large ornate openwork teardrop loops with leaf feather fringes.' },

  // Page 8: Rs 100
  { id: 'AJ-E100-05', name: 'Mirror Work Afghan Chandbalis', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Traditional real mirror centerpieces with ghungroo bells.' },
  { id: 'AJ-E100-06', name: 'Vintage Coin Dangler Jhumkis', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: false, desc: 'Tribal circular filigree with hanging engraved lucky coins.' },
  { id: 'AJ-E100-07', name: 'Golden Sunburst Mirror Studs', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Antique gold sunburst circular mirror earrings with bead drops.' },
  { id: 'AJ-E100-08', name: 'Peacock Tassel Statement', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Regal peacock oxidized base holding layered waterfall chain tassels.' },

  // Page 9: Rs 100
  { id: 'AJ-E100-09', name: 'Grey Silk Fringe Danglers', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: false, desc: 'Flowing partywear silk thread fringe earrings with crystal top.' },
  { id: 'AJ-E100-10', name: 'Multicolor Afghan Mirror Chandeliers', price: 100, category: 'Earrings', tier: '₹100', image: '', type: 'earrings', featured: true, desc: 'Artistic multi-color glass gems on antique brass chandelier frames.' },

  // Page 10: Rs 120
  { id: 'AJ-E120-01', name: 'Layered Evil Eye Pendant Set', price: 120, category: 'Pendants', tier: '₹120', image: '', type: 'pendants', featured: true, desc: 'Double strand dainty golden chain with evil eye and faux pearl bead.' },
  { id: 'AJ-E120-02', name: 'Geometric Tiered Pearl Drops', price: 120, category: 'Earrings', tier: '₹120', image: '', type: 'earrings', featured: false, desc: 'Multi-layer pearl beads with mirror pyramid jhumki bells.' },
  { id: 'AJ-E120-03', name: 'Crystal Beaded Hoop Tops', price: 120, category: 'Earrings', tier: '₹120', image: '', type: 'earrings', featured: true, desc: 'Full round hoops woven with faceted champagne blush crystals.' },

  // Page 11: Rs 120
  { id: 'AJ-P120-01', name: 'Blush Crystal Flower Studs', price: 120, category: 'Earrings', tier: '₹120', image: 'assets/col_earrings.jpg', type: 'earrings', featured: true, desc: 'Thick braided blush crystal studs with premium luxury shimmer.' },
  { id: 'AJ-P120-02', name: 'Solitaire Crystal Pendant Chain', price: 120, category: 'Pendants', tier: '₹120', image: 'assets/col_necklaces.jpg', type: 'pendants', featured: true, desc: 'Dainty gold chain with radiant solitaire crystal pendant on silk.' },
  { id: 'AJ-P120-03', name: 'Floral Crystal Statement Necklace', price: 120, category: 'Pendants', tier: '₹120', image: 'assets/hero_necklace.jpg', type: 'pendants', featured: true, desc: 'Signature gold flower pendant necklace adorned with marquise crystals.' },

  // Featured Collections: Bracelets & Rings
  { id: 'AJ-B120-01', name: 'Dainty Floral Charm Bracelet', price: 120, category: 'Bracelets', tier: '₹120', image: 'assets/col_bracelets.jpg', type: 'bracelets', featured: true, desc: 'Minimalist gold link bracelet featuring sparkling floral crystal center charm.' },
  { id: 'AJ-R120-01', name: 'Crystal Blossom Stacking Rings', price: 120, category: 'Rings', tier: '₹120', image: 'assets/col_rings.jpg', type: 'rings', featured: true, desc: 'Dual stacking gold rings with delicate floral crystal clusters and pave band.' }
];

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
