/**
 * NoiseMap FAQ Database
 * Comprehensive collection of predefined questions, alternative phrasings,
 * search keywords, and verified answers describing real NoiseMap features.
 * Operates completely offline without external AI services or API keys.
 */

import { FaqItem, FaqCategoryType } from '../types/copilot';

export const FAQ_CATEGORIES: FaqCategoryType[] = [
  'ABOUT NOISEMAP',
  'UNDERSTANDING NOISE LEVELS',
  'NOISE MAP',
  'NOISE INCIDENTS',
  'REPORTING NOISE',
  'PRIVACY AND SECURITY',
];

export const NOISEMAP_FAQ_DATABASE: FaqItem[] = [
  // ===========================================================================
  // CATEGORY A: ABOUT NOISEMAP
  // ===========================================================================
  {
    id: 'about-001',
    category: 'ABOUT NOISEMAP',
    question: 'What is NoiseMap?',
    alternatives: [
      'Explain NoiseMap',
      'Tell me about NoiseMap',
      'What is the NoiseMap app?',
      'What is this application?',
    ],
    keywords: ['noisemap', 'platform', 'app', 'overview', 'what is noisemap', 'environmental', 'intelligence'],
    answer:
      '**NoiseMap** is a community-driven environmental noise intelligence Progressive Web App (PWA). It empowers citizens to measure sound levels using their smartphone or computer microphone, explore neighborhood noise telemetry across spatial grid sectors, identify persistent elevated noise incidents, and generate formal CPCB-aligned evidence dossiers to advocate for quieter, healthier living environments.',
    relatedQuestions: [
      'What does NoiseMap do?',
      'Why is NoiseMap useful?',
      'Does NoiseMap provide real-time measurements?',
    ],
  },
  {
    id: 'about-002',
    category: 'ABOUT NOISEMAP',
    question: 'What does NoiseMap do?',
    alternatives: [
      'How does NoiseMap work?',
      'What features does NoiseMap have?',
      'NoiseMap capabilities',
      'What can I do on NoiseMap?',
    ],
    keywords: ['features', 'capabilities', 'functionality', 'measure', 'map', 'incidents', 'evidence', 'what does it do'],
    answer:
      'NoiseMap provides five core capabilities:\n\n1. **Acoustic Measurement:** Real-time decibel sampling (average, peak, and minimum dB) with optional microphone calibration.\n2. **Spatial Noise Map:** Interactive Leaflet map displaying noise intensity across ~100m geographic grid sectors.\n3. **Incident Clustering:** Automated grouping of elevated noise readings into verifiable community noise incidents.\n4. **Evidence Dossier Generator:** Instant compilation of tamper-evident PDF complaint documents with CPCB exceedance statistics.\n5. **FAQ Copilot:** Local, deterministic Q&A assistant explaining sound levels, measurements, and noise mitigation.',
    relatedQuestions: [
      'What is NoiseMap?',
      'How do I use the NoiseMap map?',
      'How can I report noise pollution?',
    ],
  },
  {
    id: 'about-003',
    category: 'ABOUT NOISEMAP',
    question: 'Why is NoiseMap useful?',
    alternatives: [
      'Why should I use NoiseMap?',
      'What are the benefits of NoiseMap?',
      'Why is NoiseMap helpful?',
      'Value of NoiseMap',
    ],
    keywords: ['useful', 'benefit', 'why', 'value', 'importance', 'health', 'advocacy', 'community'],
    answer:
      'Noise pollution is an invisible civic hazard linked to sleep disruption, cardiovascular stress, and hearing impairment. Traditional noise complaints are often dismissed because individual grievances lack empirical evidence. NoiseMap solves this by giving communities an accessible tool to collect objective decibel readings, identify chronic hot spots, and present structured data to municipal authorities and resident associations.',
    relatedQuestions: [
      'How does NoiseMap help communities?',
      'Who can use NoiseMap?',
      'What is a decibel?',
    ],
  },
  {
    id: 'about-004',
    category: 'ABOUT NOISEMAP',
    question: 'Who can use NoiseMap?',
    alternatives: [
      'Who is NoiseMap for?',
      'Can anyone use NoiseMap?',
      'Target users for NoiseMap',
      'Is NoiseMap free for public?',
    ],
    keywords: ['who', 'users', 'audience', 'citizens', 'residents', 'public', 'authorities', 'free'],
    answer:
      'NoiseMap is designed for everyone with a modern web browser or smartphone:\n\n* **Local Residents:** Experiencing unwanted generator, construction, or commercial noise.\n* **Resident Welfare Associations (RWAs):** Seeking neighborhood-wide noise telemetry.\n* **Environmental Researchers & Students:** Studying urban soundscapes and traffic patterns.\n* **Civic Advocates & Legal Representatives:** Needing documented evidence dossiers.',
    relatedQuestions: [
      'What is NoiseMap?',
      'Why is NoiseMap useful?',
      'How does NoiseMap help communities?',
    ],
  },
  {
    id: 'about-005',
    category: 'ABOUT NOISEMAP',
    question: 'How does NoiseMap help communities?',
    alternatives: [
      'How does NoiseMap support communities?',
      'Community benefits of NoiseMap',
      'Community action on noise',
      'Collective noise monitoring',
    ],
    keywords: ['community', 'neighborhood', 'collective', 'action', 'collaboration', 'advocacy', 'rwa'],
    answer:
      'NoiseMap transforms isolated grievances into corroborated community telemetry. By aggregating multiple citizen observations across shared geographic sectors (~100m grid cells), the platform proves whether an elevated noise disturbance is an isolated event or an ongoing neighborhood issue, providing undeniable weight to civic petitions.',
    relatedQuestions: [
      'What is a noise incident?',
      'How can I report noise pollution?',
      'What data sources does NoiseMap use?',
    ],
  },
  {
    id: 'about-006',
    category: 'ABOUT NOISEMAP',
    question: 'What is NoiseMap AI Copilot?',
    alternatives: [
      'Explain NoiseMap Copilot',
      'What is the Copilot?',
      'Who is the chatbot?',
      'What does the assistant do?',
    ],
    keywords: ['copilot', 'chatbot', 'assistant', 'ai copilot', 'faq mode', 'help', 'offline assistant'],
    answer:
      '**NoiseMap AI Copilot** is the intelligent environmental guide embedded directly in NoiseMap. In this release, it operates in a fast, lightweight **FAQ Mode** using local predefined questions and answers. It delivers immediate, deterministic answers about sound exposure, decibel thresholds, map features, incident lifecycles, and reporting protocols without requiring external AI API keys or internet-based model calls.',
    relatedQuestions: [
      'Does NoiseMap use AI?',
      'Does this chatbot require an API key?',
      'What should I do if the API-key demo field is displayed?',
    ],
  },
  {
    id: 'about-007',
    category: 'ABOUT NOISEMAP',
    question: 'Does NoiseMap provide real-time measurements?',
    alternatives: [
      'Is NoiseMap live?',
      'Are noise readings in real time?',
      'Live noise measurements',
      'Is noise telemetry real time?',
    ],
    keywords: ['real-time', 'real time', 'live', 'instant', 'measurements', 'stream', 'sensor network'],
    answer:
      'NoiseMap performs **real-time sound sampling** while you actively use the **Measure** tab on your device. However, the markers shown on the map and in incident lists represent **submitted community telemetry** recorded during active sampling sessions. NoiseMap is a participatory sensing network, not an automated 24/7 municipal hardware grid.',
    relatedQuestions: [
      'What data sources does NoiseMap use?',
      'Why might a location\'s latest reading be outdated?',
      'What do map markers represent?',
    ],
  },
  {
    id: 'about-008',
    category: 'ABOUT NOISEMAP',
    question: 'What data sources does NoiseMap use?',
    alternatives: [
      'Where does NoiseMap data come from?',
      'NoiseMap data sources',
      'How is noise data collected?',
      'Origin of noise measurements',
    ],
    keywords: ['data sources', 'sources', 'telemetry', 'sensors', 'recordings', 'origin', 'where data comes from'],
    answer:
      'NoiseMap data originates entirely from **participatory citizen science**:\n\n1. **User Measurements:** Acoustic decibel samples recorded via the browser Web Audio API.\n2. **Device GPS Geolocation:** Quantized into ~100m spatial grid squares for privacy.\n3. **Local & Cloud Storage:** Readings are stored in the local client database and, when enabled, synchronized with Supabase for community map sharing.',
    relatedQuestions: [
      'Does NoiseMap store microphone recordings?',
      'Does NoiseMap collect my location?',
      'Why can phone-based measurements be inaccurate?',
    ],
  },

  // ===========================================================================
  // CATEGORY B: UNDERSTANDING NOISE LEVELS
  // ===========================================================================
  {
    id: 'levels-001',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What is a decibel?',
    alternatives: [
      'Define decibel',
      'What does decibel mean?',
      'How is a decibel defined?',
      'Explain the decibel unit',
    ],
    keywords: ['decibel', 'db', 'unit', 'sound', 'acoustics', 'definition', 'what is decibel'],
    answer:
      'A **decibel (dB)** is a logarithmic unit used to quantify sound pressure level and acoustic intensity relative to the standard human auditory threshold (0 dB SPL = 20 micropascals, the quietest sound a young healthy human ear can perceive). Because sound pressure spans millions of units, the decibel compresses this range into an understandable 0–140 dB scale.',
    relatedQuestions: [
      'What does dB mean?',
      'Why are decibels logarithmic?',
      'What does a reading of 70 dB mean?',
    ],
  },
  {
    id: 'levels-002',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What does dB mean?',
    alternatives: [
      'What does dB stand for?',
      'Meaning of dB',
      'Explain dB',
      'Can you explain dB notation?',
    ],
    keywords: ['db', 'decibels', 'acronym', 'abbreviation', 'meaning', 'stand for', 'dBA'],
    answer:
      '**dB** stands for **decibel** (one-tenth of a Bel, named in honor of Alexander Graham Bell). In environmental acoustics, readings are typically measured as **dBA** (A-weighted decibels), an acoustic frequency filter that adjusts raw decibel values to mirror the human ear\'s natural sensitivity to mid-frequencies (1 kHz–4 kHz).',
    relatedQuestions: [
      'What is a decibel?',
      'What does a reading of 50 dB mean?',
      'Why are decibels logarithmic?',
    ],
  },
  {
    id: 'levels-003',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What does a reading of 50 dB mean?',
    alternatives: [
      'Is 50 dB loud?',
      '50 decibels example',
      '50 dB sound level',
      'How loud is 50 dB?',
    ],
    keywords: ['50 db', '50 decibels', '50', 'quiet', 'home', 'refrigerator', 'moderate'],
    answer:
      'A reading of **50 dB** represents a quiet to moderate sound environment. Common examples include:\n\n* A quiet domestic residence or library.\n* Moderate rainfall outside a closed window.\n* A modern quiet refrigerator humming at 1 meter.\n\nUnder Indian Central Pollution Control Board (CPCB) standards, 50 dB is the daytime limit for designated Silence Zones and well within daytime residential limits (55 dB).',
    relatedQuestions: [
      'What does a reading of 70 dB mean?',
      'What does a reading of 85 dB mean?',
      'What is a decibel?',
    ],
  },
  {
    id: 'levels-004',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What does a reading of 70 dB mean?',
    alternatives: [
      'Is 70 dB loud?',
      '70 decibels example',
      '70 dB sound level',
      'How loud is 70 dB?',
    ],
    keywords: ['70 db', '70 decibels', '70', 'traffic', 'busy street', 'vacuum cleaner', 'loud'],
    answer:
      'A reading of **70 dB** represents elevated, noticeable noise that begins to cause annoyance and conversation interference. Common examples include:\n\n* Busy urban street traffic from a roadside sidewalk.\n* A running household vacuum cleaner.\n* A crowded restaurant dining room.\n\nUnder CPCB standards, 70 dB exceeds residential daytime limits (55 dB) and matches the nighttime limit for heavy industrial zones.',
    relatedQuestions: [
      'What does a reading of 50 dB mean?',
      'What does a reading of 85 dB mean?',
      'What is the difference between a single reading and long-term exposure?',
    ],
  },
  {
    id: 'levels-005',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What does a reading of 85 dB mean?',
    alternatives: [
      'Is 85 dB dangerous?',
      '85 decibels hazard',
      '85 dB sound level',
      'How loud is 85 dB?',
      'Is 85 dB harmful to hearing?',
    ],
    keywords: ['85 db', '85 decibels', '85', 'hazardous', 'hearing damage', 'loud', 'threshold', 'hearing loss'],
    answer:
      '**85 dB** is the internationally recognized occupational safety threshold (WHO & NIOSH). Sustained exposure to 85 dB or higher for more than 8 hours per day can cause permanent noise-induced hearing loss (NIHL). Common examples include:\n\n* Heavy diesel generators operating nearby.\n* Concrete mixers and construction equipment.\n* Continuous heavy traffic with frequent loud truck horns.\n\nHearing protection (earplugs or earmuffs) is recommended in continuous 85+ dB zones.',
    relatedQuestions: [
      'What does a reading of 70 dB mean?',
      'What is the difference between a single reading and long-term exposure?',
      'Why are decibels logarithmic?',
    ],
  },
  {
    id: 'levels-006',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'Why are decibels logarithmic?',
    alternatives: [
      'Why is the decibel scale logarithmic?',
      'Explain logarithmic scale for noise',
      'Why not linear dB?',
      'How does the decibel scale work?',
    ],
    keywords: ['logarithmic', 'log scale', 'linear', 'scale', 'human ear', 'doubling', 'sound energy'],
    answer:
      'The human ear perceives sound across an astonishingly wide acoustic energy range—the loudest sound you can hear without immediate pain is more than 1,000,000,000,000 times more energetic than the quietest audible sound. A linear scale would require trillions of units. A logarithmic scale compresses this into 0–140 dB.\n\n**Crucial rule of thumb:**\n* **+3 dB:** Represents a **doubling** of physical acoustic sound energy.\n* **+10 dB:** Represents a **tenfold increase** in sound energy and is perceived by human hearing as roughly **twice as loud**.',
    relatedQuestions: [
      'What is a decibel?',
      'Why can two measurements differ?',
      'What does dB mean?',
    ],
  },
  {
    id: 'levels-007',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'Why can two measurements differ?',
    alternatives: [
      'Why do my noise readings fluctuate?',
      'Different decibel readings at the same place',
      'Measurement discrepancies',
      'Why does decibel reading change?',
    ],
    keywords: ['differ', 'fluctuate', 'different readings', 'variation', 'distance', 'reflections', 'wind'],
    answer:
      'Decibel readings taken nearby or at different moments often differ due to well-documented acoustic factors:\n\n1. **Distance (Inverse-Square Law):** Doubling your distance from a point noise source reduces sound level by approximately 6 dB.\n2. **Obstacles & Reflections:** Walls, fences, and foliage absorb or bounce sound waves.\n3. **Environmental Factors:** Wind speed and temperature gradients bend sound waves.\n4. **Background Ambient Noise:** Transient events (a passing motorcycle or barking dog) spike peak values temporarily.',
    relatedQuestions: [
      'Why can phone-based measurements be inaccurate?',
      'What is the difference between a single reading and long-term exposure?',
      'Why is microphone calibration important?',
    ],
  },
  {
    id: 'levels-008',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'Why can phone-based measurements be inaccurate?',
    alternatives: [
      'Are smartphone sound meters accurate?',
      'Phone microphone accuracy',
      'Can I trust my phone decibel meter?',
      'How accurate is smartphone noise measurement?',
    ],
    keywords: ['phone', 'smartphone', 'inaccurate', 'accuracy', 'microphone', 'limitations', 'uncalibrated'],
    answer:
      'Consumer smartphones are engineered for voice communication rather than precision acoustic measurement. Their microphones often feature:\n\n* Automatic Gain Control (AGC) that dampens loud sounds.\n* Built-in noise cancellation filters.\n* Uneven frequency response at very low (<100 Hz) or very high (>6 kHz) frequencies.\n\nNoiseMap provides a **Microphone Calibration Offset** in the Measure tab to correct systemic bias, but smartphone readings should be considered community-grade monitoring rather than certified laboratory standards.',
    relatedQuestions: [
      'Why is microphone calibration important?',
      'Why can two measurements differ?',
      'Does NoiseMap provide real-time measurements?',
    ],
  },
  {
    id: 'levels-009',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'What is the difference between a single reading and long-term exposure?',
    alternatives: [
      'Instant reading vs long term exposure',
      'Single peak vs Leq',
      'Sound exposure over time',
      'Single measurement vs continuous noise',
    ],
    keywords: ['exposure', 'long-term', 'single reading', 'peak', 'laeq', 'duration', 'cumulative'],
    answer:
      'A **single reading** (instantaneous dB) reflects acoustic intensity at an exact split second, such as a single car horn. **Long-term exposure** (often measured as equivalent continuous sound level, $L_{Aeq}$) averages acoustic energy over extended durations (1 hour, 8 hours, or 24 hours).\n\nWhile a single loud sound causes brief annoyance or surprise, long-term exposure to continuous moderate noise (55–70 dB) is what causes chronic health impacts like insomnia and hypertension.',
    relatedQuestions: [
      'What does a reading of 85 dB mean?',
      'Why are decibels logarithmic?',
      'What is a noise incident?',
    ],
  },
  {
    id: 'levels-010',
    category: 'UNDERSTANDING NOISE LEVELS',
    question: 'Why is microphone calibration important?',
    alternatives: [
      'How to calibrate microphone?',
      'Microphone offset',
      'Why calibrate sound level?',
      'Importance of microphone calibration',
    ],
    keywords: ['calibration', 'calibrate', 'offset', 'gain', 'hardware', 'adjust', 'accuracy'],
    answer:
      'Because every smartphone model and laptop has a unique microphone hardware setup and protective casing, an uncalibrated device may read 5–15 dB higher or lower than the true sound pressure level.\n\n**Calibration** lets you enter an adjustment offset (+/- dB) based on a known quiet room reference or a calibrated physical sound meter, ensuring your submitted measurements match verified community data.',
    relatedQuestions: [
      'Why can phone-based measurements be inaccurate?',
      'Why can two measurements differ?',
      'What is a decibel?',
    ],
  },

  // ===========================================================================
  // CATEGORY C: NOISE MAP
  // ===========================================================================
  {
    id: 'map-001',
    category: 'NOISE MAP',
    question: 'How do I use the NoiseMap map?',
    alternatives: [
      'How to use the map?',
      'Navigating the noise map',
      'Using NoiseMap map view',
      'Guide to the map',
    ],
    keywords: ['map', 'use map', 'navigation', 'sectors', 'heat map', 'view', 'how to use'],
    answer:
      'To use the NoiseMap map:\n\n1. Select the **Map** tab from the main navigation bar.\n2. Pan and pinch/zoom across your city or neighborhood.\n3. Click any **color-coded sector marker** to open a detailed summary drawer showing average dB, peak dB, recording count, and dominant noise source.\n4. Use the **Locate Me** crosshair icon in the top right to center the map on your GPS coordinates.',
    relatedQuestions: [
      'What do map markers represent?',
      'How do I center the map on my location?',
      'Why might a map area have no readings?',
    ],
  },
  {
    id: 'map-002',
    category: 'NOISE MAP',
    question: 'What do map markers represent?',
    alternatives: [
      'What do the pins on the map mean?',
      'Map marker colors',
      'Understanding map pins',
      'What do circle icons on map mean?',
    ],
    keywords: ['markers', 'pins', 'colors', 'green', 'amber', 'red', 'sectors', 'represent', 'meaning'],
    answer:
      'Each marker on the map represents a spatial grid sector (~100m²). Markers are color-coded based on the sector\'s average noise level:\n\n* 🟢 **Green (<55 dB):** Quiet, compliant with daytime residential limits.\n* 🟡 **Amber (55–70 dB):** Moderate noise, typical of busy commercial or traffic corridors.\n* 🔴 **Red (>=70 dB):** Elevated, disruptive noise exceeding normal environmental limits.\n\nClicking a marker opens detailed readings and contributor statistics.',
    relatedQuestions: [
      'How do I use the NoiseMap map?',
      'What is a noise incident?',
      'Why might a location\'s latest reading be outdated?',
    ],
  },
  {
    id: 'map-003',
    category: 'NOISE MAP',
    question: 'Why is my location not appearing?',
    alternatives: [
      'Location not working on map',
      'Why can\'t NoiseMap find my location?',
      'GPS not showing',
      'Cannot find my position on map',
    ],
    keywords: ['location', 'gps', 'not appearing', 'missing', 'permission', 'geolocation', 'failed'],
    answer:
      'If your location is not appearing on the map:\n\n1. **Check Browser Permissions:** Verify that location access is set to "Allow" for NoiseMap in your browser settings.\n2. **Enable Device GPS:** Make sure Location/GPS is toggled on in your device system settings.\n3. **Indoor Weak Signal:** Being inside thick concrete structures can prevent GPS satellite lock. Try stepping near a window or outdoors.',
    relatedQuestions: [
      'How do I center the map on my location?',
      'Does NoiseMap collect my location?',
      'How do I use the NoiseMap map?',
    ],
  },
  {
    id: 'map-004',
    category: 'NOISE MAP',
    question: 'How do I center the map on my location?',
    alternatives: [
      'How to find my spot on the map?',
      'Center map',
      'Locate me button',
      'Pan map to my current coordinates',
    ],
    keywords: ['center', 'locate', 'my location', 'gps button', 'crosshair', 'find me'],
    answer:
      'Click the **GPS Crosshair button** located in the map control panel (top right corner of the map screen). Your browser will retrieve your current coordinates and smoothly animate the map view to your location, highlighting your position with a blue pulse marker.',
    relatedQuestions: [
      'Why is my location not appearing?',
      'How do I use the NoiseMap map?',
      'Can NoiseMap show noise around a selected location?',
    ],
  },
  {
    id: 'map-005',
    category: 'NOISE MAP',
    question: 'Why might a map area have no readings?',
    alternatives: [
      'Why is this area empty on the map?',
      'Blank areas on noise map',
      'Missing map data',
      'Why are there no markers in my neighborhood?',
    ],
    keywords: ['empty', 'no readings', 'blank', 'unmonitored', 'missing data', 'coverage', 'no markers'],
    answer:
      'NoiseMap is an open, community-powered network. If an area has no map markers, it simply means **no user has recorded or submitted a noise measurement in that sector yet**. You can be the first to contribute by going to the **Measure** tab and recording an acoustic sample in that area!',
    relatedQuestions: [
      'What data sources does NoiseMap use?',
      'What do map markers represent?',
      'How can I report noise pollution?',
    ],
  },
  {
    id: 'map-006',
    category: 'NOISE MAP',
    question: 'What does historical noise data mean?',
    alternatives: [
      'Explain historical noise data',
      'What is historical data?',
      'Past noise readings',
      'Archive data on map',
    ],
    keywords: ['historical', 'past', 'history', 'trend', 'records', 'archive', 'historical data'],
    answer:
      '**Historical noise data** includes measurements recorded outside the current live active window (readings older than 15 minutes). While live views show recent activity, historical records allow you to analyze multi-day patterns, identify recurring peak noise hours, and prove that a disturbance is habitual.',
    relatedQuestions: [
      'Why might a location\'s latest reading be outdated?',
      'What is a noise incident?',
      'How do I use the NoiseMap map?',
    ],
  },
  {
    id: 'map-007',
    category: 'NOISE MAP',
    question: 'Why might a location\'s latest reading be outdated?',
    alternatives: [
      'Outdated map reading',
      'Old noise timestamp',
      'Why is the reading old?',
      'Timestamp on map marker is old',
    ],
    keywords: ['outdated', 'old reading', 'timestamp', 'stale', 'last measured', 'old data'],
    answer:
      'Because NoiseMap relies on community contributions rather than continuous automated hardware sensors, a sector marker will display the timestamp of the last submitted measurement until a new user submits a fresh reading. An old reading confirms that sound occurred at that past time, but does not guarantee the source is still active.',
    relatedQuestions: [
      'Does an old reading prove noise is still happening?',
      'What does historical noise data mean?',
      'Why might a map area have no readings?',
    ],
  },
  {
    id: 'map-008',
    category: 'NOISE MAP',
    question: 'Can NoiseMap show noise around a selected location?',
    alternatives: [
      'Check noise near me',
      'Noise levels around an address',
      'Inspect surrounding noise',
      'Can I search noise around a place?',
    ],
    keywords: ['around', 'nearby', 'selected location', 'radius', 'proximity', 'surrounding'],
    answer:
      'Yes. When you click on any sector on the map or select an incident from the **Incidents** tab, NoiseMap automatically highlights the target sector and surfaces readings recorded in adjacent grid sectors within approximately 500 meters to 1 kilometer.',
    relatedQuestions: [
      'How do I use the NoiseMap map?',
      'What do map markers represent?',
      'What is a noise incident?',
    ],
  },

  // ===========================================================================
  // CATEGORY D: NOISE INCIDENTS
  // ===========================================================================
  {
    id: 'incidents-001',
    category: 'NOISE INCIDENTS',
    question: 'What is a noise incident?',
    alternatives: [
      'Define noise incident',
      'What does an incident mean?',
      'Noise incidents in NoiseMap',
      'What is an incident in the app?',
    ],
    keywords: ['incident', 'what is incident', 'cluster', 'violation', 'exceedance', 'high noise', 'meaning'],
    answer:
      'A **Noise Incident** in NoiseMap is an automated cluster of elevated noise readings (typically averaging >=68–70 dB) recorded in the same spatial grid sector within a specific time window. It represents a significant localized disturbance rather than an isolated momentary spike.',
    relatedQuestions: [
      'How does NoiseMap identify incidents?',
      'Why might an incident remain visible?',
      'What does incident verification mean?',
    ],
  },
  {
    id: 'incidents-002',
    category: 'NOISE INCIDENTS',
    question: 'How does NoiseMap identify incidents?',
    alternatives: [
      'How are incidents detected?',
      'Incident detection algorithm',
      'Clustering criteria',
      'How are clusters formed?',
    ],
    keywords: ['identify', 'detect', 'clustering', 'algorithm', 'consensus', 'spatial grid', 'criteria'],
    answer:
      'NoiseMap uses spatial-temporal clustering:\n\n1. Readings within the same ~100m grid cell are grouped together.\n2. If average noise levels exceed 68 dB and no subsequent quiet reading (<68 dB) is logged within 15 minutes, the cluster is classified as an **Active Incident**.\n3. The system computes average dB, peak dB, dominant sound source, and estimated contributor consensus count.',
    relatedQuestions: [
      'What is a noise incident?',
      'Why might an incident remain visible?',
      'What does incident verification mean?',
    ],
  },
  {
    id: 'incidents-003',
    category: 'NOISE INCIDENTS',
    question: 'Why might an incident remain visible?',
    alternatives: [
      'Why is an old incident still on the page?',
      'Incident persistence',
      'Why is incident not disappearing?',
      'Why is resolved incident shown?',
    ],
    keywords: ['remain visible', 'persistent', 'active incident', 'monitoring', 'not disappearing', 'resolved'],
    answer:
      'Incidents transition through three lifecycle stages:\n\n* **ACTIVE (<=15 min):** Fresh elevated readings confirmed recently.\n* **MONITORING (15–60 min):** Awaiting a recent quiet reading to confirm cessation.\n* **RESOLVED (>60 min):** Concluded, but retained in the log so residents can review historical evidence and export PDF dossiers.',
    relatedQuestions: [
      'What does an outdated incident mean?',
      'Does an old reading prove noise is still happening?',
      'How can missing measurements affect incident status?',
    ],
  },
  {
    id: 'incidents-004',
    category: 'NOISE INCIDENTS',
    question: 'What does an outdated incident mean?',
    alternatives: [
      'Outdated incident status',
      'Stale incident',
      'Is an old incident still happening?',
      'What is a stale incident?',
    ],
    keywords: ['outdated incident', 'stale incident', 'aged', 'expired', 'old incident', 'status'],
    answer:
      'An **outdated incident** means high noise was recorded in the past, but no fresh measurements have been logged recently to corroborate ongoing disturbance. Because sound dissipates quickly, an outdated incident should never be assumed to still be occurring without taking a fresh measurement.',
    relatedQuestions: [
      'Does an old reading prove noise is still happening?',
      'Why might an incident remain visible?',
      'What should I do if an incident appears incorrect?',
    ],
  },
  {
    id: 'incidents-005',
    category: 'NOISE INCIDENTS',
    question: 'Does an old reading prove noise is still happening?',
    alternatives: [
      'Does an old reading prove noise?',
      'Is past reading evidence of current noise?',
      'Can I use old reading as proof of current noise?',
    ],
    keywords: ['prove', 'old reading', 'still happening', 'current noise', 'evidence', 'transient'],
    answer:
      '**No.** Sound is inherently ephemeral and stops when the source powers off. An old reading proves only that noise occurred at that past timestamp. It does not prove active disruption right now. Real-world authorities always require fresh or recurring evidence.',
    relatedQuestions: [
      'What does an outdated incident mean?',
      'How can missing measurements affect incident status?',
      'What should I do if an incident appears incorrect?',
    ],
  },
  {
    id: 'incidents-006',
    category: 'NOISE INCIDENTS',
    question: 'How can missing measurements affect incident status?',
    alternatives: [
      'What happens if no one measures noise?',
      'Missing data impact on incidents',
      'How missing readings change incidents',
    ],
    keywords: ['missing measurements', 'no data', 'unmonitored', 'status impact', 'auto resolution'],
    answer:
      'When no new measurements are submitted for a grid cell, the system cannot verify whether the noise source has stopped or is continuing. Under NoiseMap lifecycle rules, unmonitored clusters automatically age from **ACTIVE** to **MONITORING** after 15 minutes, and to **RESOLVED** after 60 minutes.',
    relatedQuestions: [
      'Why might an incident remain visible?',
      'What does an outdated incident mean?',
      'What should I do if an incident appears incorrect?',
    ],
  },
  {
    id: 'incidents-007',
    category: 'NOISE INCIDENTS',
    question: 'What does incident verification mean?',
    alternatives: [
      'Are incidents verified?',
      'Verification status',
      'How to verify incident',
      'Does verified mean certified?',
    ],
    keywords: ['verification', 'verified', 'evidence', 'consensus', 'multiple users', 'certified'],
    answer:
      'In NoiseMap, **verification** means algorithmic corroboration: multiple independent readings or distinct user sessions recorded consistent elevated decibels in the same grid sector. It denotes reliable crowdsourced consensus—it does **not** imply formal police or court certification.',
    relatedQuestions: [
      'How does NoiseMap identify incidents?',
      'What is a noise incident?',
      'What should I do if an incident appears incorrect?',
    ],
  },
  {
    id: 'incidents-008',
    category: 'NOISE INCIDENTS',
    question: 'Why might the incident page be empty?',
    alternatives: [
      'No incidents listed',
      'Why are there no incidents?',
      'Empty incident list',
      'Zero incidents showing',
    ],
    keywords: ['empty', 'no incidents', 'quiet', 'list empty', 'zero incidents', 'no active'],
    answer:
      'The Incidents page is empty when either:\n\n1. **Environment is Quiet:** All recent community readings in your area are within normal thresholds (<68 dB).\n2. **No Recent Submissions:** No users have submitted measurements in your vicinity within the active monitoring window.\n\nIf you are experiencing loud noise, open the **Measure** tab to record and establish the first incident report!',
    relatedQuestions: [
      'What is a noise incident?',
      'How can I report noise pollution?',
      'How do I use the NoiseMap map?',
    ],
  },
  {
    id: 'incidents-009',
    category: 'NOISE INCIDENTS',
    question: 'What should I do if an incident appears incorrect?',
    alternatives: [
      'Report wrong incident',
      'Incident is inaccurate',
      'Noise has stopped but incident remains',
      'How to clear incorrect incident?',
    ],
    keywords: ['incorrect', 'wrong', 'inaccurate', 'dispute', 'update incident', 'stopped', 'clear incident'],
    answer:
      'If an incident shows elevated noise but the area is now quiet, open the **Measure** tab and record a fresh reading from that location. When a verified quiet reading (<68 dB) is logged for that grid cell, NoiseMap updates the sector state and automatically transitions the incident to resolved.',
    relatedQuestions: [
      'Does an old reading prove noise is still happening?',
      'Why might an incident remain visible?',
      'How does NoiseMap identify incidents?',
    ],
  },

  // ===========================================================================
  // CATEGORY E: REPORTING NOISE
  // ===========================================================================
  {
    id: 'reporting-001',
    category: 'REPORTING NOISE',
    question: 'How can I report noise pollution?',
    alternatives: [
      'How to report noise?',
      'Filing a noise report',
      'Steps to report noise pollution',
      'How to make a noise complaint?',
    ],
    keywords: ['report', 'reporting', 'file complaint', 'complaint', 'submit', 'steps', 'police', 'cpcb'],
    answer:
      'To report noise pollution with NoiseMap:\n\n1. Go to the **Measure** tab and record decibel samples during the disturbance.\n2. Open the **Evidence** tab to review recorded readings.\n3. Click **Generate Complaint Dossier** to compile a formal PDF report containing timestamps, peak and average dB, and statutory CPCB exceedance calculations.\n4. Deliver this PDF dossier to your local municipal ward office, resident association, or police control room.',
    relatedQuestions: [
      'What information should I include in a report?',
      'How do I report construction noise?',
      'What happens after a report is submitted?',
    ],
  },
  {
    id: 'reporting-002',
    category: 'REPORTING NOISE',
    question: 'How do I report construction noise?',
    alternatives: [
      'Reporting construction noise',
      'Construction site loud',
      'Night construction report',
      'How to complain about construction?',
    ],
    keywords: ['construction', 'machinery', 'drilling', 'night work', 'contractor', 'heavy equipment'],
    answer:
      'Under the Indian Noise Pollution (Regulation and Control) Rules, 2000, construction equipment cannot operate during night hours (10:00 PM to 6:00 AM) in residential or silence zones without special permission.\n\nRecord readings from your window or property line during night work, select **Construction** as the source type, and use the **Evidence** tab to generate a dossier citing residential night limit violations (45 dBA max).',
    relatedQuestions: [
      'What information should I include in a report?',
      'How do I report traffic noise?',
      'What happens after a report is submitted?',
    ],
  },
  {
    id: 'reporting-003',
    category: 'REPORTING NOISE',
    question: 'How do I report traffic noise?',
    alternatives: [
      'Report road noise',
      'Honking and traffic complaints',
      'Vehicle noise reporting',
      'Traffic sound report',
    ],
    keywords: ['traffic', 'vehicles', 'honking', 'road', 'transit', 'highway', 'horns'],
    answer:
      'Record multiple 2-to-3 minute samples during peak morning or evening rush hours. Categorize the source as **Traffic** or **Honking**. In the Evidence tab, highlight exceedance above commercial or residential zone norms to petition traffic police and municipal planners for speed calming or no-honking enforcement zones.',
    relatedQuestions: [
      'How do I report construction noise?',
      'What information should I include in a report?',
      'Why is the location important?',
    ],
  },
  {
    id: 'reporting-004',
    category: 'REPORTING NOISE',
    question: 'What information should I include in a report?',
    alternatives: [
      'What should be in a noise complaint?',
      'Essential noise report details',
      'Complaint requirements',
      'Key details for noise complaint',
    ],
    keywords: ['information', 'details', 'include', 'evidence', 'timestamp', 'location', 'source', 'exceedance'],
    answer:
      'A legally actionable noise report should include:\n\n1. **Exact Location & Zone:** Street name and designated zone (Residential, Commercial, Industrial, or Silence Zone).\n2. **Timestamps:** Exact start and end times, especially noting night hours (10 PM–6 AM).\n3. **Sound Metrics:** Average decibels ($L_{Aeq}$), peak decibels ($L_{max}$), and exceedance over CPCB limits.\n4. **Identified Source:** Specific machinery, music venue, generator, or traffic corridor.\n5. **Corroborating Evidence:** Number of affected neighbors or community co-signers.',
    relatedQuestions: [
      'Why is the location important?',
      'Can I report recurring noise?',
      'What happens after a report is submitted?',
    ],
  },
  {
    id: 'reporting-005',
    category: 'REPORTING NOISE',
    question: 'Why is the location important?',
    alternatives: [
      'Why is location needed in report?',
      'Importance of address in noise report',
      'Why location matters for noise limits',
    ],
    keywords: ['location', 'address', 'gps', 'zone', 'jurisdiction', 'importance', 'cpcb limits'],
    answer:
      'Location determines two critical factors:\n\n1. **Statutory Limits:** Permissible decibel limits vary dramatically by zone (e.g., Silence Zone day limit is 50 dB, while Industrial day limit is 75 dB).\n2. **Enforcement Jurisdiction:** Civic authorities (municipal ward offices vs. local police stations) require precise geographical coordinates to inspect the violator.',
    relatedQuestions: [
      'What information should I include in a report?',
      'How can I report noise pollution?',
      'What is a decibel?',
    ],
  },
  {
    id: 'reporting-006',
    category: 'REPORTING NOISE',
    question: 'Can I report recurring noise?',
    alternatives: [
      'Recurring noise issues',
      'Repeated daily noise complaint',
      'Chronic noise logging',
      'How to handle daily loud noise?',
    ],
    keywords: ['recurring', 'repeated', 'chronic', 'daily', 'frequent', 'log', 'persistent'],
    answer:
      '**Yes, and recurring logs are far more effective.** Submit measurements across consecutive days at the same time. The Evidence tab aggregates these multi-day sessions into a historical dossier demonstrating continuous, habitual violations rather than a one-time isolated incident.',
    relatedQuestions: [
      'What information should I include in a report?',
      'What happens after a report is submitted?',
      'Why might my report not be visible?',
    ],
  },
  {
    id: 'reporting-007',
    category: 'REPORTING NOISE',
    question: 'What happens after a report is submitted?',
    alternatives: [
      'What happens next after reporting?',
      'Post submission process',
      'Who takes action on noise complaint?',
      'Does NoiseMap call the police?',
    ],
    keywords: ['after report', 'process', 'outcome', 'action', 'authorities', 'police', 'municipality'],
    answer:
      'NoiseMap is an open civic tool that generates structured evidence dossiers for **you** to submit to enforcement authorities (police control room, State Pollution Control Board, or municipal ward engineers). NoiseMap does not directly dispatch law enforcement or file government legal complaints on its own.',
    relatedQuestions: [
      'How can I report noise pollution?',
      'What information should I include in a report?',
      'Why is my report not visible?',
    ],
  },
  {
    id: 'reporting-008',
    category: 'REPORTING NOISE',
    question: 'Why is my report not visible?',
    alternatives: [
      'Where is my submitted report?',
      'Can\'t see my complaint',
      'Report visibility',
      'Why did my evidence dossier disappear?',
    ],
    keywords: ['not visible', 'missing report', 'where is report', 'drafts', 'disappeared', 'evidence'],
    answer:
      'Generated complaint drafts and evidence files are kept in your browser\'s local session storage. If you opened the app in Private/Incognito mode or cleared browser history, your local draft list may be reset. However, your underlying submitted noise readings remain preserved in the local database and can be recompiled at any time.',
    relatedQuestions: [
      'How can I report noise pollution?',
      'Can I report recurring noise?',
      'What happens after a report is submitted?',
    ],
  },

  // ===========================================================================
  // CATEGORY F: PRIVACY AND SECURITY
  // ===========================================================================
  {
    id: 'privacy-001',
    category: 'PRIVACY AND SECURITY',
    question: 'Does NoiseMap use AI?',
    alternatives: [
      'Is NoiseMap using artificial intelligence?',
      'Does this app have AI?',
      'What AI does NoiseMap use?',
      'Is the chatbot powered by AI?',
    ],
    keywords: ['use ai', 'artificial intelligence', 'machine learning', 'model', 'faq mode', 'offline', 'rules'],
    answer:
      'In this version, NoiseMap Copilot operates as a **deterministic, rule-based FAQ assistant**. It uses local keyword and pattern matching to provide instant answers from an internal database. It **does not** run deep learning models or transmit queries to cloud LLM providers, ensuring maximum speed, offline reliability, and absolute privacy.',
    relatedQuestions: [
      'Does the chatbot connect to Gemini?',
      'Does this chatbot require an API key?',
      'Is my data sent to an AI provider?',
    ],
  },
  {
    id: 'privacy-002',
    category: 'PRIVACY AND SECURITY',
    question: 'Does the chatbot connect to Gemini?',
    alternatives: [
      'Is the chatbot connected to Gemini?',
      'Does it use Google Gemini?',
      'Gemini connection',
      'Is Google Gemini running?',
    ],
    keywords: ['connect to gemini', 'gemini', 'google gemini', 'active connection', 'api', 'gemini running'],
    answer:
      '**No.** The chatbot does not connect to Google Gemini. All responses are served locally and deterministically from predefined FAQ entries. Any Gemini API key field shown in the UI is strictly a **simulated demonstration element**.',
    relatedQuestions: [
      'What should I do if the API-key demo field is displayed?',
      'Does this chatbot require an API key?',
      'Does NoiseMap use AI?',
    ],
  },
  {
    id: 'privacy-003',
    category: 'PRIVACY AND SECURITY',
    question: 'Does this chatbot require an API key?',
    alternatives: [
      'Do I need an API key?',
      'Is an API key required?',
      'Can I use the chatbot without a key?',
      'Do I have to enter an API key to chat?',
    ],
    keywords: ['require api key', 'need key', 'api key', 'credentials', 'free', 'no key', 'requirement'],
    answer:
      '**No API key is required.** The FAQ chatbot is fully operational right out of the box. You do not need a Google Gemini key, an OpenAI key, or any other credentials to ask questions and receive answers.',
    relatedQuestions: [
      'What should I do if the API-key demo field is displayed?',
      'Does the chatbot connect to Gemini?',
      'Does NoiseMap use AI?',
    ],
  },
  {
    id: 'privacy-004',
    category: 'PRIVACY AND SECURITY',
    question: 'Is my data sent to an AI provider?',
    alternatives: [
      'Is data sent to Google or OpenAI?',
      'Does my data go to AI companies?',
      'Data transmission to AI',
      'Are my questions sent to external servers?',
    ],
    keywords: ['sent to ai', 'data transmission', 'external provider', 'google', 'openai', 'cloud', 'privacy'],
    answer:
      '**No.** Your questions, chat history, and device inputs remain entirely within your local browser memory. No data is transmitted to Google, OpenAI, or any third-party AI service.',
    relatedQuestions: [
      'Does NoiseMap store microphone recordings?',
      'Does NoiseMap collect my location?',
      'How does NoiseMap protect user information?',
    ],
  },
  {
    id: 'privacy-005',
    category: 'PRIVACY AND SECURITY',
    question: 'How does NoiseMap protect user information?',
    alternatives: [
      'NoiseMap security practices',
      'User privacy protection',
      'How safe is NoiseMap?',
      'Privacy safeguards in NoiseMap',
    ],
    keywords: ['protect', 'security', 'privacy', 'information', 'safeguards', 'encryption', 'user data'],
    answer:
      'NoiseMap implements strict privacy by design:\n\n1. **Zero Audio Storage:** Raw audio streams are never recorded, saved, or uploaded.\n2. **Spatial Quantization:** Telemetry coordinates are rounded to ~100m grid sectors rather than exact home addresses.\n3. **Ephemeral Memory:** Chat interactions exist only in volatile browser session memory and can be cleared with one click.',
    relatedQuestions: [
      'Does NoiseMap store microphone recordings?',
      'Does NoiseMap collect my location?',
      'Is my data sent to an AI provider?',
    ],
  },
  {
    id: 'privacy-006',
    category: 'PRIVACY AND SECURITY',
    question: 'Does NoiseMap store microphone recordings?',
    alternatives: [
      'Does NoiseMap record audio?',
      'Are voice recordings saved?',
      'Microphone privacy',
      'Is my voice recorded?',
    ],
    keywords: ['recordings', 'audio', 'microphone', 'listen', 'voice', 'eavesdropping', 'store audio'],
    answer:
      '**Absolutely not.** NoiseMap uses the browser\'s Web Audio API solely to compute numerical decibel levels in volatile RAM. No audio clips, voice recordings, or sound files are ever saved to disk, written to storage, or transmitted over the internet.',
    relatedQuestions: [
      'How does NoiseMap protect user information?',
      'Does NoiseMap collect my location?',
      'What data sources does NoiseMap use?',
    ],
  },
  {
    id: 'privacy-007',
    category: 'PRIVACY AND SECURITY',
    question: 'Does NoiseMap collect my location?',
    alternatives: [
      'Does NoiseMap track my GPS?',
      'Location tracking',
      'GPS privacy',
      'Does NoiseMap track me?',
    ],
    keywords: ['collect location', 'gps', 'tracking', 'coordinates', 'location privacy', 'user tracking'],
    answer:
      'NoiseMap requests geolocation access only when you actively measure sound or center the map. Furthermore, coordinates are grouped into coarse **~100m geographic grid squares** before saving, ensuring individual residential doorsteps cannot be identified.',
    relatedQuestions: [
      'Why is my location not appearing?',
      'How does NoiseMap protect user information?',
      'Does NoiseMap store microphone recordings?',
    ],
  },
  {
    id: 'privacy-008',
    category: 'PRIVACY AND SECURITY',
    question: 'What should I do if the API-key demo field is displayed?',
    alternatives: [
      'Should I enter my Gemini key in demo field?',
      'What is the demo key field?',
      'Demo API key input',
      'Why is there an API key field?',
    ],
    keywords: ['demo field', 'demo key', 'what should i do', 'api-key demo', 'placeholder', 'gemini key', 'demo ui'],
    answer:
      'The Gemini API Key field is a **demonstration-only UI element**. **Do NOT enter a real API key.** It does not connect to Gemini, does not validate credentials, and does not store entered values anywhere. The FAQ chatbot works immediately without any key.',
    relatedQuestions: [
      'Does the chatbot connect to Gemini?',
      'Does this chatbot require an API key?',
      'Does NoiseMap use AI?',
    ],
  },
];

/**
 * Quick suggested questions displayed prominently on the welcome screen
 * and in quick selection carousels.
 */
export const QUICK_SUGGESTED_QUESTIONS = [
  'What is NoiseMap?',
  'What does a reading of 70 dB mean?',
  'How do I use the NoiseMap map?',
  'What is a noise incident?',
  'How can I report noise pollution?',
  'Why might a location\'s latest reading be outdated?',
  'How does NoiseMap protect user information?',
  'Does this chatbot require an API key?',
];
