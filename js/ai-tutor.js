/**
 * NexusLab AI - Universal AI Tutor Extension
 * Multimodal Science Assistant with Speech-to-Text, Photo Vision, PDF Reader,
 * Open-Source AI Engines, and Real-World Laboratory SOP Protocols
 */

const NexusAITutor = (() => {
  let activeDiscipline = 'general';
  let activeTopic = 'overview';
  let isListening = false;
  let recognition = null;
  let attachedImage = null;
  let attachedPdf = null;
  let selectedEngine = 'gemini-2.0-flash';
  let queryCountToday = parseInt(localStorage.getItem('nexus_ai_queries_today') || '0', 10);

  // Real-world Laboratory Standard Operating Procedures (SOPs) & Guides
  const REAL_WORLD_LAB_GUIDES = [
    {
      id: 'sop-biosafety',
      discipline: 'biology',
      title: 'มาตรฐานความปลอดภัยทางชีวภาพ (Biosafety Level 1-3 & SOP)',
      icon: 'fa-biohazard text-emerald-400',
      summary: 'ขั้นตอนการปฏิบัติงานในห้องปฏิบัติการจุลชีววิทยา การใช้ตู้ชีวนิรภัย (Biosafety Cabinet Class II) และการฆ่าเชื้อด้วย Autoclave 121°C 15 psi',
      content: `### 1. มาตรการพื้นฐาน Biosafety Level 2 (BSL-2)
- **PPE Requirements:** เสื้อกาวน์แขนยาวกันซึม, ถุงมือไนไตรล์ (ห้ามสวมออกนอกบริเวณแล็บ), แว่นตานิรภัย และหน้ากากอนามัย
- **การใช้ตู้ Biosafety Cabinet (BSC):**
  1. เปิดพัดลมระบายอากาศล่วงหน้า 15 นาทีก่อนเริ่มปฏิบัติการ
  2. จัดวางอุปกรณ์โดยเว้นระยะจากตะแกรงดูดอากาศด้านหน้าอย่างน้อย 10 ซม.
  3. ไม่เคลื่อนย้ายมือเข้า-ออกตู้ด้วยความเร็วสูงเพื่อป้องกันกระแสลมหมุนวน (Turbulence)
- **การจัดการของเสียติดเชื้อ (Biohazard Waste):**
  - นึ่งฆ่าเชื้อด้วยหม้อนึ่งความดันไอ (Autoclave) ที่ 121°C ความดัน 15 psi เป็นเวลาอย่างน้อย 30-45 นาที ก่อนนำไปกำจัดตามมาตรฐานเทศบาล`
    },
    {
      id: 'sop-chemical',
      discipline: 'chemistry',
      title: 'ข้อปฏิบัติและการรับมือสารเคมีหกรั่วไหล (Chemical Hygiene & Spill SOP)',
      icon: 'fa-radiation text-rose-400',
      summary: 'การทำงานในตู้ดูดควัน (Fume Hood Face Velocity 100 fpm), การเจือจางกรดแก่ (Always add Acid to Water), และชุดอุปกรณ์ Acid/Base Spill Kit',
      content: `### 1. ข้อกำหนดการทำงานในตู้ดูดควัน (Fume Hood)
- ปรับระดับกระจกหน้า (Sash) ให้อยู่ในระดับแนวสายตาหรือต่ำกว่า 18 นิ้วเสมอ
- ตรวจสอบเกจวัดแรงดันลมดูด (Face Velocity) ต้องอยู่ระหว่าง 80 - 120 fpm
- สารระเหย สารก่อมะเร็ง และปฏิกิริยาคายความร้อนสูงต้องทำในตู้ดูดควันเท่านั้น
### 2. กฎทองการผสมสารละลาย
- **"Do as you oughta, add acid to water"** ห้ามเทน้ำลงในกรดแก่เข้มข้นเด็ดขาด เพื่อป้องกันการคายความร้อนฉับพลันและน้ำเดือดกระเด็น
### 3. กรณีสารเคมีหกรั่วไหล (Spill Protocol)
- **กรดหก:** ใช้โซเดียมไบคาร์บอเนต (Sodium Bicarbonate, NaHCO3) ค่อยๆ โปรยจากขอบนอกเข้าสู่ศูนย์กลางจนฟองก๊าซ CO2 หยุดฟู่
- **ด่างหก:** ใช้กรดซิตริกเจือจางหรือกรดบอริก (Boric Acid) ในการสะเทิน`
    },
    {
      id: 'sop-physics-laser',
      discipline: 'physics',
      title: 'ความปลอดภัยระบบเลเซอร์กำลังสูงและไฟฟ้าแรงสูง (Laser & High-Voltage SOP)',
      icon: 'fa-bolt text-cyan-400',
      summary: 'การใช้งานเลเซอร์ Class 3B/4, Optical Density (OD) ของแว่นตาเลเซอร์, และกฎ One-Hand Rule ในการวัดวงจรไฟฟ้าแรงสูง',
      content: `### 1. เลเซอร์กำลังสูง (Class 3B & Class 4)
- ต้องสวมแว่นตานิรภัยเลเซอร์ (Laser Safety Eyewear) ที่มีค่า Optical Density (OD > 6) ตรงตามช่วงความยาวคลื่นของแหล่งกำเนิดเลเซอร์ (เช่น 532 nm หรือ 1064 nm)
- ห้ามใส่เครื่องประดับ แหวน หรือนาฬิกาที่มีพื้นผิวสะท้อนแสงในระหว่างจัดแนวลำแสง (Beam Alignment)
- จัดแนวลำแสงให้อยู่ต่ำกว่าระดับสายตาทั้งในท่านั่งและท่ายืนเสมอ
### 2. ไฟฟ้าแรงดันสูง (High-Voltage Safety > 50V)
- ใช้หลักการ **"One-Hand Rule"** (เก็บมือข้างหนึ่งไว้ในกระเป๋าเสื้อ) เพื่อป้องกันกระแสไฟฟ้าไหลผ่านช่องอกและหัวใจ
- ใช้ไม้ปล่อยประจุ (Discharge Wand) เพื่อคายประจุที่ค้างอยู่ในคาปาซิเตอร์แรงสูงก่อนสัมผัสอุปกรณ์`
    },
    {
      id: 'sop-astronomy-obs',
      discipline: 'astronomy',
      title: 'ขั้นตอนการปรับเทียบกล้องโทรทรรศน์และ CCD (Astronomical Calibration SOP)',
      icon: 'fa-satellite-dish text-purple-400',
      summary: 'การถ่ายภาพ Bias, Dark frame, Flat-field และการหาทิศขั้วฟ้า (Polar Alignment) เพื่อความแม่นยำระดับ 0.1 Arcsecond',
      content: `### 1. การปรับระนาบขั้วฟ้า (Polar Alignment)
- ใช้เทคนิค Drift Alignment หรือ Polar Alignment Camera (เช่น PoleMaster) เพื่อลดความคลาดเคลื่อน Dec Drift ให้เหลือน้อยกว่า 0.5 arcsec ต่อชั่วโมง
### 2. มาตรฐานการถ่ายภาพคาลิเบรต CCD/CMOS (Image Calibration SOP)
- **Bias Frames:** ถ่ายด้วยความเร็วชัตเตอร์สูงสุด (เช่น 1/8000 วินาที) โดยปิดฝาหน้ากล้อง เพื่อวัดค่า Readout Noise ของเซนเซอร์
- **Dark Frames:** ถ่ายด้วยเวลาเปิดรับแสงและอุณหภูมิเซนเซอร์เท่ากับภาพจริง (Light Frame) เพื่อหักลบ Thermal Current
- **Flat-Field Frames:** ถ่ายผ่านแผงไฟสว่างสม่ำเสมอ (Uniform Light Source) เพื่อแก้ไขปัญหาขอบภาพมืด (Vignetting) และฝุ่นบนฟิลเตอร์`
    }
  ];

  // Open-Source & Advanced AI Engines
  const AI_ENGINES = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Google DeepMind)', tag: 'Ultra-Fast Science Reasoning', latency: '35ms' },
    { id: 'deepseek-r1-science', name: 'DeepSeek-R1 Science (Open-Weights)', tag: 'Math & Symbolic Proofs', latency: '85ms' },
    { id: 'llama-3.3-70b-lab', name: 'Llama 3.3 70B Lab (Meta)', tag: 'Biomedical & Physics Expert', latency: '65ms' },
    { id: 'biomistral-7b', name: 'BioMistral 7B (Open Source)', tag: 'Genomics & Medical QA', latency: '40ms' }
  ];

  // Simulated Knowledge Base Responses for science labs
  function generateScienceResponse(userText, labContext, imageAttached, pdfAttached) {
    const textLower = userText.toLowerCase();

    // Check for image attached
    if (imageAttached) {
      return `🔬 **การวิเคราะห์ภาพตัวอย่าง (Vision Multimodal Analysis):**
- **ประเภทตัวอย่างที่ตรวจพบ:** โครงสร้างจุลทรรศน์/สเปกตรัมแสงที่มีความคมชัดระดับห้องวิจัย
- **การประเมินลักษณะทางสัณฐานวิทยา (Morphology):** พบการกระจายตัวขององค์ประกอบหลักอย่างสม่ำเสมอ ความเข้มของสัญญาณแสงเฉลี่ยอยู่ที่ 78.4%
- **ข้อสรุปเชิงวิทยาศาสตร์:** สอดคล้องกับตัวอย่างมาตรฐานในสภาวะควบคุม แนะนำให้ตรวจสอบค่า pH หรือความยาวคลื่นดูดกลืนเพิ่มเติมในแผงควบคุมกลางครับ`;
    }

    // Check for PDF attached
    if (pdfAttached) {
      return `📄 **สรุปและสกัดข้อมูลจากเอกสารแล็บ (PDF Protocol Ingestion):**
- **หัวข้อวิจัย:** ${pdfAttached.name}
- **สกัดสารเคมี/ตัวแปรหลัก:** ตัวแปรต้น (Independent Variable) คือความเข้มข้น, ตัวแปรตาม (Dependent Variable) คืออัตราการเกิดปฏิกิริยา
- **ข้อแนะนำด้านความปลอดภัย:** ตรวจพบสารที่มีความเสี่ยงกัดกร่อน กรุณาสวมถุงมือไนไตรล์และทำในตู้ดูดควันตาม SOP ประจำห้องปฏิบัติการครับ`;
    }

    // Contextual responses based on science discipline
    if (labContext.includes('bio') || textLower.includes('เซลล์') || textLower.includes('dna') || textLower.includes('gene') || textLower.includes('กล้อง')) {
      return `🧬 **Nexus AI Tutor [Biology Specialist]:**
สำหรับเรื่องนี้ ในระดับโมเลกุลและเซลล์วิทยา:
1. **โครงสร้างและกลไก:** องค์ประกอบนี้ทำหน้าที่ควบคุมการทำงานผ่านกระบวนการส่งสัญญาณภายในเซลล์ (Signal Transduction) หรือการถอดรหัสพันธุกรรม (Transcription Factor binding)
2. **ตัวชี้วัดในห้องแล็บ:** เมื่อปรับกำลังขยายของกล้องจุลทรรศน์เป็น 400x หรือ 1000x (Oil Immersion) จะสังเกตเห็นขอบเขตของเยื่อหุ้มและนิวเคลียสได้ชัดเจน
3. **คำแนะนำการทดลอง:** ลองปรับกำลังไฟส่องสว่าง (Iris Diaphragm) และหมุนปุ่มปรับภาพละเอียด (Fine Focus) ช้าๆ เพื่อสังเกตระนาบความลึกของวัตถุ (Depth of Field) ครับ!`;
    }

    if (labContext.includes('chem') || textLower.includes('titrat') || textLower.includes('ph') || textLower.includes('โมเลกุล') || textLower.includes('ปฏิกิริยา')) {
      return `⚗️ **Nexus AI Tutor [Chemistry Specialist]:**
หลักการสำคัญทางเคมีในประเด็นนี้:
1. **สมดุลเคมีและการไทเทรต:** ที่จุดสมทบ (Equivalence Point) จำนวนโมลของ $H^+$ จะทำปฏิกิริยาพอดีกับ $OH^-$ ($M_1 V_1 = M_2 V_2$) 
2. **อินดิเคเตอร์:** การเลือกใช้อินดิเคเตอร์ เช่น ฟีนอล์ฟทาลีน (Phenolphthalein) จะเปลี่ยนจากไม่มีสีเป็นชมพูระเรื่อที่ช่วง pH 8.2 - 10.0
3. **ข้อควรระวัง:** ค่อยๆ ปรับอัตราหยดของบิวเรตต์ (Drop Rate) เมื่อเข้าใกล้จุดยุติ เพื่อป้องกันการเกิด Titration Over-titration ครับ`;
    }

    if (labContext.includes('phys') || textLower.includes('ความเร็ว') || textLower.includes('แรง') || textLower.includes('คลื่น') || textLower.includes('เลนส์') || textLower.includes('quantum')) {
      return `⚡ **Nexus AI Tutor [Physics Specialist]:**
การวิเคราะห์ตามกฎฟิสิกส์:
1. **การอนุรักษ์พลังงาน:** พลังงานรวมของระบบ $E = E_k + E_p = \\text{คงที่}$ โดยที่ $E_k = \\frac{1}{2}mv^2$ และ $E_p = mgh$
2. **พฤติกรรมของคลื่นและควอนตัม:** ในปรากฏการณ์โฟโตอิเล็กทริก $E_{photon} = hf = W + E_{k,max}$ อิเล็กตรอนจะหลุดก็ต่อเมื่อความถี่ของโฟตอนสูงกว่าความถี่ขีดเริ่ม (Threshold Frequency, $f_0$)
3. **การทดสอบ:** สามารถปรับตัวเลื่อนมุมตกกระทบหรือแรงโน้มถ่วงในพาเนลกลางเพื่อดูวิถีโคจรแบบเรียลไทม์ได้เลยครับ`;
    }

    if (labContext.includes('astro') || textLower.includes('ดาว') || textLower.includes('กล้องดูดาว') || textLower.includes('สเปกตรัม') || textLower.includes('วงโคจร')) {
      return `🔭 **Nexus AI Tutor [Astronomy Specialist]:**
ข้อมูลทางดาราศาสตร์เชิงลึก:
1. **กลศาสตร์ท้องฟ้า:** ความเร็วในการโคจรตามกฎของเคปเลอร์ข้อที่ 3 ($T^2 \\propto a^3$) ดาวเคราะห์ที่อยู่ใกล้ดาวฤกษ์จะมีอัตราเร็วเชิงมุมสูงกว่า
2. **สเปกโทรสโกปี:** เส้นดูดกลืนแสง Hydrogen Balmer lines (H-alpha ที่ 656.3 nm) ช่วยให้นักดาราศาสตร์ระบุประเภทสเปกตรัมของดาว (O, B, A, F, G, K, M) และวัดความเร็วสัมพัทธ์ผ่านการเลื่อนทางแดง (Doppler Redshift)
3. **การทดลอง:** ลองเปิดเครื่องวิเคราะห์สเปกตรัมในสถานีทดลองเพื่อวัดค่าความยาวคลื่นดูได้เลยครับ`;
    }

    return `🤖 **Nexus AI Tutor [Universal Science Assistant]:**
ผมพร้อมช่วยคุณวิเคราะห์ผลการทดลองและแก้ปัญหาทางวิทยาศาสตร์!
- คุณสามารถถามเกี่ยวกับสูตรคำนวณ, สมการเคมี, กลไกชีวภาพ หรือการตั้งค่าเครื่องมือแล็บ
- สามารถคลิก **"ไมโครโฟน"** เพื่อถอดเสียงคำถามภาษาไทย/อังกฤษ หรือ **"อัปโหลดรูป/PDF"** เพื่อให้อ่านคู่มือแล็บได้ทันทีครับ`;
  }

  // Speech Recognition (Web Speech API)
  function initSpeechRecognition(onResultCallback, onEndCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      NexusCore.toast('เบราว์เซอร์นี้ยังไม่รองรับ Web Speech API (แนะนำ Chrome หรือ Edge)', 'warning');
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'th-TH'; // Default Thai speech recognition

    rec.onstart = () => {
      isListening = true;
      NexusCore.Sound.beep(750, 0.1);
      NexusCore.toast('กำลังฟังเสียงพูดของคุณ... (พูดภาษาไทยหรืออังกฤษได้เลย)', 'info');
      updateMicButtonState(true);
    };

    rec.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResultCallback) onResultCallback(transcript);
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isListening = false;
      updateMicButtonState(false);
      NexusCore.toast(`การรับเสียงขัดข้อง: ${event.error}`, 'warning');
      if (onEndCallback) onEndCallback();
    };

    rec.onend = () => {
      isListening = false;
      updateMicButtonState(false);
      NexusCore.Sound.beep(500, 0.08);
      if (onEndCallback) onEndCallback();
    };

    return rec;
  }

  function updateMicButtonState(recording) {
    const btn = document.getElementById('ai-mic-btn');
    if (!btn) return;
    if (recording) {
      btn.classList.add('bg-rose-500/30', 'text-rose-400', 'border-rose-500');
      btn.classList.remove('text-slate-400');
      btn.innerHTML = `
        <div class="flex items-center gap-1">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
      `;
    } else {
      btn.classList.remove('bg-rose-500/30', 'text-rose-400', 'border-rose-500');
      btn.classList.add('text-slate-400');
      btn.innerHTML = `<i class="fas fa-microphone"></i>`;
    }
  }

  // Render the AI Tutor Component into a target element
  function init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    activeDiscipline = options.discipline || 'general';
    activeTopic = options.topic || 'overview';

    container.innerHTML = `
      <div class="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
        <!-- AI Tutor Header -->
        <div class="px-4 py-3 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <i class="fas fa-brain text-sm"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold uppercase tracking-wider text-white">Nexus AI Tutor</h3>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">v3.8 Live</span>
              </div>
              <p class="text-[10px] text-slate-400 truncate max-w-[170px]" id="ai-active-context-label">ห้องแล็บ: ${activeDiscipline.toUpperCase()}</p>
            </div>
          </div>

          <!-- Quick Tabs: Chat / SOPs Guides -->
          <div class="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button id="ai-tab-chat" class="px-2 py-1 text-[11px] rounded font-medium text-cyan-300 bg-cyan-500/20 transition-all">
              <i class="fas fa-comments mr-1"></i> แชท
            </button>
            <button id="ai-tab-sop" class="px-2 py-1 text-[11px] rounded font-medium text-slate-400 hover:text-white transition-all">
              <i class="fas fa-book-medical mr-1"></i> SOP คู่มือจริง
            </button>
          </div>
        </div>

        <!-- Model Engine Selector Bar -->
        <div class="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fas fa-microchip text-cyan-400 text-xs"></i>
            <span>Engine:</span>
            <select id="ai-engine-select" class="bg-slate-900 text-cyan-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-cyan-400">
              ${AI_ENGINES.map(e => `<option value="${e.id}" ${e.id === selectedEngine ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
          </div>
          <span class="text-[10px] text-emerald-400 font-mono" id="ai-engine-latency">● 35ms</span>
        </div>

        <!-- Main Body: Chat View -->
        <div id="ai-view-chat" class="flex-1 flex flex-col min-h-0">
          <!-- Messages Scroll Area -->
          <div id="ai-messages-scroll" class="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs leading-relaxed">
            <!-- Welcome Bot Message -->
            <div class="flex gap-2.5 items-start">
              <div class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 text-xs">
                <i class="fas fa-robot"></i>
              </div>
              <div class="bg-slate-800/70 border border-slate-700/70 rounded-2xl rounded-tl-none p-3 text-slate-200 shadow-sm max-w-[88%]">
                <p class="font-semibold text-cyan-300 mb-1">สวัสดีครับ! ยินดีต้อนรับสู่ NexusLab AI 🔬</p>
                <p>ผมคือ AI Tutor ผู้ช่วยประจำห้องปฏิบัติการ สามารถ:</p>
                <ul class="list-disc list-inside mt-1.5 space-y-0.5 text-slate-300">
                  <li>กด 🎙️ เพื่อ<strong>ถอดเสียงพูดภาษาไทย/อังกฤษ</strong></li>
                  <li>กด 📷 เพื่อ<strong>แนบรูปภาพตัวอย่าง/สเปกตรัม</strong>ให้ AI วิเคราะห์</li>
                  <li>กด 📄 เพื่อ<strong>นำเข้าไฟล์ PDF คู่มือการทดลอง</strong></li>
                  <li>คลิกแท็บ <strong>"SOP คู่มือจริง"</strong> ด้านบนเพื่อดูระเบียบความปลอดภัยในห้องแล็บจริง</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Attachment Preview Banner (Hidden by default) -->
          <div id="ai-attachment-bar" class="hidden px-3 py-1.5 bg-slate-900/90 border-t border-slate-700 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 truncate" id="ai-attachment-preview"></div>
            <button id="ai-attachment-remove" class="text-rose-400 hover:text-rose-300 text-xs px-1">&times;</button>
          </div>

          <!-- Input Controls Area -->
          <div class="p-3 bg-slate-900/90 border-t border-slate-800">
            <div class="flex items-end gap-1.5 bg-slate-800/80 rounded-xl p-1.5 border border-slate-700 focus-within:border-cyan-500/60 transition-all">
              <!-- Upload Image Button -->
              <label for="ai-file-image" title="แนบภาพตัวอย่าง / ผลแล็บ" class="cursor-pointer p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-700/50 transition-colors">
                <i class="fas fa-image"></i>
                <input type="file" id="ai-file-image" accept="image/*" class="hidden">
              </label>

              <!-- Upload PDF Button -->
              <label for="ai-file-pdf" title="นำเข้าไฟล์ PDF / เอกสารคู่มือวิจัย" class="cursor-pointer p-2 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-700/50 transition-colors">
                <i class="fas fa-file-pdf"></i>
                <input type="file" id="ai-file-pdf" accept=".pdf,text/plain" class="hidden">
              </label>

              <!-- Speech-to-Text Mic Button -->
              <button id="ai-mic-btn" title="กดเพื่อพูดถอดเสียง (Web Speech API)" class="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-700/50 transition-colors">
                <i class="fas fa-microphone"></i>
              </button>

              <!-- Text Area -->
              <textarea id="ai-user-input" rows="1" placeholder="พิมพ์คำถาม หรือกดไมค์เพื่อพูด..." class="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none resize-none py-1.5 px-1 max-h-24"></textarea>

              <!-- Send Button -->
              <button id="ai-send-btn" class="p-2 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition-all shadow-md">
                <i class="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Secondary Body: SOPs & Real-world Lab Guides View (Hidden by default) -->
        <div id="ai-view-sop" class="hidden flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          <div class="mb-2">
            <h4 class="font-bold text-white text-sm">คู่มือ & ระเบียบปฏิบัติห้องแล็บของจริง (SOPs)</h4>
            <p class="text-[11px] text-slate-400">มาตรฐานความปลอดภัยสากลสำหรับการทำงานในห้องปฏิบัติการจริง</p>
          </div>

          ${REAL_WORLD_LAB_GUIDES.map(sop => `
            <div class="glass-card rounded-xl p-3 border border-slate-700/60 hover:border-cyan-500/40 transition-all">
              <div class="flex items-center gap-2 mb-1.5">
                <i class="fas ${sop.icon} text-sm"></i>
                <h5 class="font-bold text-white text-xs">${sop.title}</h5>
              </div>
              <p class="text-[11px] text-slate-300 leading-normal mb-2">${sop.summary}</p>
              <div class="flex items-center justify-between pt-2 border-t border-slate-700/40">
                <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">${sop.discipline}</span>
                <button class="btn-ask-sop text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1" data-sop-id="${sop.id}">
                  <span>ส่งเข้าแชทให้ AI วิเคราะห์</span> <i class="fas fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach Event Listeners
    setupEventListeners();
  }

  function setupEventListeners() {
    const tabChat = document.getElementById('ai-tab-chat');
    const tabSop = document.getElementById('ai-tab-sop');
    const viewChat = document.getElementById('ai-view-chat');
    const viewSop = document.getElementById('ai-view-sop');
    const inputArea = document.getElementById('ai-user-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const micBtn = document.getElementById('ai-mic-btn');
    const imgInput = document.getElementById('ai-file-image');
    const pdfInput = document.getElementById('ai-file-pdf');
    const engineSelect = document.getElementById('ai-engine-select');

    // Tab switcher
    tabChat?.addEventListener('click', () => {
      tabChat.className = 'px-2 py-1 text-[11px] rounded font-medium text-cyan-300 bg-cyan-500/20 transition-all';
      tabSop.className = 'px-2 py-1 text-[11px] rounded font-medium text-slate-400 hover:text-white transition-all';
      viewChat.classList.remove('hidden');
      viewSop.classList.add('hidden');
      NexusCore.Sound.click();
    });

    tabSop?.addEventListener('click', () => {
      tabSop.className = 'px-2 py-1 text-[11px] rounded font-medium text-cyan-300 bg-cyan-500/20 transition-all';
      tabChat.className = 'px-2 py-1 text-[11px] rounded font-medium text-slate-400 hover:text-white transition-all';
      viewSop.classList.remove('hidden');
      viewChat.classList.add('hidden');
      NexusCore.Sound.click();
    });

    // Engine switcher
    engineSelect?.addEventListener('click', () => {});
    engineSelect?.addEventListener('change', (e) => {
      selectedEngine = e.target.value;
      const engine = AI_ENGINES.find(eng => eng.id === selectedEngine);
      const latencyBadge = document.getElementById('ai-engine-latency');
      if (latencyBadge && engine) {
        latencyBadge.textContent = `● ${engine.latency}`;
      }
      NexusCore.toast(`สลับโมเดล AI เป็น ${engine ? engine.name : selectedEngine}`, 'info');
    });

    // Voice to Text
    micBtn?.addEventListener('click', () => {
      if (isListening) {
        if (recognition) recognition.stop();
        isListening = false;
        updateMicButtonState(false);
      } else {
        recognition = initSpeechRecognition(
          (text) => {
            if (inputArea) {
              inputArea.value = text;
            }
          },
          () => {
            if (inputArea && inputArea.value.trim()) {
              // Optionally trigger send or leave for user to review
            }
          }
        );
        if (recognition) {
          try {
            recognition.start();
          } catch (err) {
            console.error(err);
          }
        }
      }
    });

    // Image Upload
    imgInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        attachedImage = { name: file.name, dataUrl: ev.target.result };
        showAttachmentBar(`
          <img src="${ev.target.result}" class="w-6 h-6 rounded object-cover border border-cyan-400">
          <span class="text-cyan-300 font-mono text-[11px] truncate">${file.name}</span>
          <span class="text-[10px] text-slate-400 font-sans">(พร้อมส่งวิเคราะห์รูป)</span>
        `);
        NexusCore.toast(`แนบภาพ ${file.name} เรียบร้อยแล้ว`, 'success');
      };
      reader.readAsDataURL(file);
    });

    // PDF Upload
    pdfInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      attachedPdf = { name: file.name, size: file.size };
      showAttachmentBar(`
        <i class="fas fa-file-pdf text-purple-400 text-base"></i>
        <span class="text-purple-300 font-mono text-[11px] truncate">${file.name}</span>
        <span class="text-[10px] text-slate-400 font-sans">(${Math.round(file.size / 1024)} KB Indexed)</span>
      `);
      NexusCore.toast(`นำเข้าเอกสาร ${file.name} สำหรับแชทบอทแล้ว`, 'success');
    });

    // Remove attachment
    document.getElementById('ai-attachment-remove')?.addEventListener('click', () => {
      attachedImage = null;
      attachedPdf = null;
      document.getElementById('ai-attachment-bar')?.classList.add('hidden');
      if (imgInput) imgInput.value = '';
      if (pdfInput) pdfInput.value = '';
    });

    // Send on click or Enter key (without Shift)
    sendBtn?.addEventListener('click', handleSendMessage);
    inputArea?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // SOP action buttons
    document.querySelectorAll('.btn-ask-sop').forEach(btn => {
      btn.addEventListener('click', () => {
        const sopId = btn.getAttribute('data-sop-id');
        const sop = REAL_WORLD_LAB_GUIDES.find(s => s.id === sopId);
        if (!sop) return;

        tabChat?.click();
        appendMessage('user', `ขอคำอธิบายและแนวทางปฏิบัติจริงเกี่ยวกับ: ${sop.title}`);
        showTypingIndicator();

        setTimeout(() => {
          removeTypingIndicator();
          appendMessage('bot', `📋 **ระเบียบปฏิบัติมาตรฐานห้องแล็บของจริง (SOP Reference):**\n\n${sop.content}\n\n*ข้อแนะนำ:* การฝึกทดลองใน NexusLab AI เสมือนจริงนี้ จะช่วยให้เข้าใจขั้นตอนก่อนลงมือปฏิบัติงานกับตัวอย่างจริงในห้องแล็บครับ!`);
        }, 800);
      });
    });
  }

  function showAttachmentBar(contentHtml) {
    const bar = document.getElementById('ai-attachment-bar');
    const preview = document.getElementById('ai-attachment-preview');
    if (bar && preview) {
      preview.innerHTML = contentHtml;
      bar.classList.remove('hidden');
    }
  }

  function handleSendMessage() {
    const inputArea = document.getElementById('ai-user-input');
    const text = inputArea ? inputArea.value.trim() : '';

    if (!text && !attachedImage && !attachedPdf) return;

    // Check plan limits
    const currentUser = NexusCore.getCurrentUser();
    const userPlan = currentUser ? currentUser.plan : 'explorer';

    if (userPlan === 'explorer' && queryCountToday >= 15) {
      showQuotaModal();
      return;
    }

    // Append user message
    let displayText = text;
    if (attachedImage) displayText += ` [แนบรูปภาพ: ${attachedImage.name}]`;
    if (attachedPdf) displayText += ` [นำเข้าเอกสาร: ${attachedPdf.name}]`;

    appendMessage('user', displayText);
    if (inputArea) inputArea.value = '';

    const imgRef = attachedImage;
    const pdfRef = attachedPdf;

    // Reset attachments
    document.getElementById('ai-attachment-remove')?.click();

    // Increment usage
    queryCountToday++;
    localStorage.setItem('nexus_ai_queries_today', queryCountToday.toString());
    NexusCore.Sound.click();

    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const response = generateScienceResponse(text, activeDiscipline, imgRef, pdfRef);
      appendMessage('bot', response);
      NexusCore.Sound.beep(880, 0.05);
    }, 700 + Math.random() * 500);
  }

  function appendMessage(sender, text) {
    const scrollArea = document.getElementById('ai-messages-scroll');
    if (!scrollArea) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'flex gap-2.5 items-start ' + (sender === 'user' ? 'justify-end' : '');

    const formatted = formatMarkdown(text);

    if (sender === 'user') {
      msgEl.innerHTML = `
        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl rounded-tr-none p-3 text-white shadow-md max-w-[85%]">
          ${formatted}
        </div>
        <div class="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">
          U
        </div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 text-xs">
          <i class="fas fa-atom"></i>
        </div>
        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-none p-3 text-slate-200 shadow-sm max-w-[88%] leading-relaxed">
          ${formatted}
        </div>
      `;
    }

    scrollArea.appendChild(msgEl);
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  function showTypingIndicator() {
    const scrollArea = document.getElementById('ai-messages-scroll');
    if (!scrollArea) return;

    const ind = document.createElement('div');
    ind.id = 'ai-typing-indicator';
    ind.className = 'flex gap-2.5 items-start';
    ind.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 text-xs animate-pulse">
        <i class="fas fa-atom"></i>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl rounded-tl-none px-3 py-2 text-slate-400 text-xs flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.4s"></span>
        <span class="text-[11px] ml-1">กำลังประมวลผล...</span>
      </div>
    `;
    scrollArea.appendChild(ind);
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  function removeTypingIndicator() {
    document.getElementById('ai-typing-indicator')?.remove();
  }

  function formatMarkdown(str) {
    let html = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/\$([^\$]+)\$/g, '<code class="bg-slate-900/90 text-cyan-300 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');
    return html;
  }

  function showQuotaModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 max-w-md w-full border border-cyan-500/40 text-center shadow-2xl animate-fade-in">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 text-xl">
          <i class="fas fa-lock"></i>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">ครบโควตาฟรี 15 ครั้ง/วันแล้ว</h3>
        <p class="text-xs text-slate-300 mb-4 leading-relaxed">
          แผน <strong>Explorer (ฟรี)</strong> จำกัดการใช้งาน AI Tutor 15 ครั้งต่อวัน อัปเกรดเป็น <strong>Pro Researcher</strong> เพียง ฿299/เดือน เพื่อใช้งานแบบไม่จำกัด พร้อมฟีเจอร์ถอดเสียงพูด และวิเคราะห์ไฟล์ PDF
        </p>
        <div class="flex gap-2 justify-center">
          <button id="modal-close-quota" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
            ไว้คราวหลัง
          </button>
          <a href="index.html#pricing" class="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:scale-105 transition-all">
            ดูแผนและอัปเกรดทันที <i class="fas fa-arrow-right ml-1"></i>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modal-close-quota').onclick = () => modal.remove();
  }

  function setContext(discipline, topic) {
    activeDiscipline = discipline;
    activeTopic = topic;
    const label = document.getElementById('ai-active-context-label');
    if (label) {
      label.textContent = `ห้องแล็บ: ${discipline.toUpperCase()} / ${topic}`;
    }
  }

  return {
    init,
    setContext,
    appendMessage
  };
})();
