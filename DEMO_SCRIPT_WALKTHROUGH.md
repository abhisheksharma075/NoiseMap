# NoiseMap — 3-Minute Hackathon Demo Rehearsal Script

**Project:** NoiseMap — Privacy-First, Real-Time Noise Pollution Mapping & Reporting PWA  
**Team:** Wave Builders (Aman Tyagi · Abhishek Sharma · Abhishek Bharadwaj)  
**Pitch Duration:** 3 Minutes (6 Precise Scenes)  
**Target Audience:** Hackathon Judges, Civic Technologists, Urban Policy Makers

---

## 🎯 The 5 Key Statements to Tell Judges

1. **"Zero CapEx":** We replaced ₹2-5 Lakh hardware monitors with 750M+ existing Indian smartphone microphones at zero extra cost.
2. **"Verified, Not Just Measured":** A single phone reading is anecdotal and easily dismissed. Our Incident Engine requires 3+ independent citizen devices in a 100m grid within 15 minutes to generate verified civic evidence with mathematical confidence scoring.
3. **"Privacy by Math":** GPS coordinates are mathematically rounded to 100m before they leave the phone. Raw audio is processed purely in client RAM and never recorded or transmitted. We literally cannot track anyone.
4. **"Legal Teeth":** This is not just a passive map. It compiles tamper-evident statutory complaint dossiers citing Rule 5 & 7 of the *Noise Pollution Rules, 2000*—ready for municipal grievance portals.
5. **"Community Power":** When thousands of citizens become sensors, they illuminate nocturnal violations and street realities that regional government stations miss entirely.

---

## 🎬 6-Scene Live Walkthrough Choreography

### Scene 1: The Problem (0:00 – 0:30)
- **Visual:** Open NoiseMap on projector/laptop. Point to empty city radar view.
- **Narrator:**  
  *"India is the 2nd noisiest country on Earth, with 500 million citizens exposed to harmful decibel levels daily. Yet the entire country has only ~50 government noise monitoring stations. That means if an industrial generator or wedding loudspeaker keeps your family awake at 1:00 AM, there is essentially zero empirical data showing it exists. Complaints are dismissed as personal hypersensitivity. We built NoiseMap to close this enforcement void."*

### Scene 2: 1-Tap Sensory Capture (0:30 – 1:00)
- **Visual:** Switch to mobile device or click **"START 10-SEC SAMPLE"** on the `MEASURE` tab.
- **Action:** Speak or play noise into mic. Show the animated **Circular Phosphor Decibel Dial** and the live **CRT Oscilloscope Waveform Canvas** fluctuating in real-time.
- **Narrator:**  
  *"With zero app installs, any citizen taps 'Measure Now'. Using the browser-native HTML5 Web Audio API, our on-device engine computes Root Mean Square acoustic energy and peak impulse decibels. Notice: no audio file is ever saved or sent. As soon as the 10 seconds finish, audio RAM is instantly flushed."*
- **Action:** Select **Traffic** as source and submit the sample to the grid.

### Scene 3: Real-Time Map Ingestion (1:00 – 1:20)
- **Visual:** Switch to the `MAP` tab.
- **Action:** Point to the newly rendered acoustic circle marker on CartoDB Dark Matter. Click it to reveal the **Node Telemetry Inspector**.
- **Narrator:**  
  *"The sample is mathematically quantized to a ~100m grid cell before transmission. Notice how the reading appears on our live city radar layer in sub-200ms. An individual dot says 'it is noisy here'—valuable, but still anecdotal."*

### Scene 4: The WOW Moment — Verified Incident Consensus (1:20 – 2:00)
- **Visual:** Click **"SIMULATOR"** on the top HUD header to open the Demo Controller.
- **Action:** Click **"01. SIMULATE 3 CITIZENS REPORTING NOISE (84 dB)"**. Close modal.
- **Result:**
  1. An animated glowing red beacon pulses on the map.
  2. The top HUD hazard indicator increments.
  3. Navigate to the `INCIDENTS` tab. Show the new **Verified Incident Card**.
- **Narrator:**  
  *"Now, watch what happens when multiple citizens experience the same noise. Our algorithmic engine cross-references spatial proximity (100m) and temporal co-occurrence (15 minutes). Because 3 distinct devices corroborated the spike, single-user bias is eliminated. The engine computes an 88% Evidence Confidence Score based on sample density, peer count, duration, and statutory exceedance."*

### Scene 5: Geo-Fenced Health Alerts (2:00 – 2:20)
- **Visual:** Switch to the `CIVIC ID` tab.
- **Action:** Point to the **Monitored Sensitive Zones** (Home Residence, School Zone). Show the active threshold watch and demonstrate the test notification.
- **Narrator:**  
  *"Citizens can pin sensitive zones—like their home, a school, or a hospital. If sustained noise breaches their personalized threshold, NoiseMap fires automated push and in-app alerts, giving families actionable warning before hearing damage or cardiovascular stress occurs."*

### Scene 6: Civic Action & Statutory Legal Dossier (2:20 – 3:00)
- **Visual:** Switch to `CPCB DOSSIER` tab or click **"GENERATE CPCB COMPLAINT PDF"** on the active incident card.
- **Action:** Click **"DOWNLOAD CPCB EVIDENCE DOSSIER (PDF)"**. Open the downloaded PDF.
- **Narrator:**  
  *"This is where data turns into enforcement. In under 400 milliseconds, our client-side vector engine compiles an official legal complaint citing Rule 5 and Rule 7 of the Central Pollution Control Board Noise Pollution Rules, 2000. It includes tamper-evident reference IDs, peak-to-average decibel curves, and peer contributor counts—ready for immediate filing with Municipal Ward officers or police. From passive smartphone microphone to statutory evidence in one closed civic loop."*

---

## 🛡️ Quick Answers for Judge Q&A

- **Q: Are phone microphones accurate enough for legal penalties?**  
  *A:* "Smartphones are uncalibrated ambient sensors, not Class-1 sound level meters. We explicitly label all data as crowdsourced relative estimates. However, while 1 phone might be off by ±3 dB, when 5 phones in the same 100m block all record 85 dB for 45 minutes, that statistical consensus is legally defensible evidence of an active disturbance."
- **Q: How do you prevent users from spoofing or spamming complaints?**  
  *A:* "Our engine strictly requires $\ge 3$ independent session tokens across sliding temporal windows. One person submitting 50 readings from the same phone only counts as 1 contributor. High-confidence incident promotion is impossible without multi-device corroboration."
- **Q: What if the user is in an area with poor internet connectivity?**  
  *A:* "NoiseMap is a full PWA with an offline Service Worker shell and an autonomous in-memory reactive fallback store. It runs completely offline without network drops."
