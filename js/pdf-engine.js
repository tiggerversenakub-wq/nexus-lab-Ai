/**
 * pdf-engine.js
 * Client-Side PDF Extraction, Scientific Chunking & Parameter Detection
 * Powered by PDF.js (Client-Side, zero backend dependency)
 */

export class PdfEngine {
    constructor() {
        this.workerInitialized = false;
        this._initWorker();
    }

    _initWorker() {
        if (window.pdfjsLib && !this.workerInitialized) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            this.workerInitialized = true;
        }
    }

    /**
     * Process uploaded File object
     * Extracts text page by page, creates semantic chunks, and extracts scientific parameters
     * @param {File} file
     * @returns {Promise<Object>}
     */
    async processPdfFile(file) {
        this._initWorker();
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library is not loaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;

        let fullText = "";
        const chunks = [];

        // Extract each page
        for (let i = 1; i <= pageCount; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            
            fullText += `\n--- [หน้า ${i}] ---\n` + pageText;

            // Split into semantic chunks (~400 words / paragraphs)
            const paragraphs = pageText.split(/(?:\r?\n){2,}|\.\s+/).filter(p => p.trim().length > 30);
            if (paragraphs.length === 0) {
                chunks.push({
                    page: i,
                    text: pageText.trim(),
                    topics: this._extractTopicsFromText(pageText)
                });
            } else {
                paragraphs.forEach((pText, pIdx) => {
                    chunks.push({
                        page: i,
                        chunkIndex: pIdx,
                        text: pText.trim(),
                        topics: this._extractTopicsFromText(pText)
                    });
                });
            }
        }

        // Scientific metadata & parameters extraction
        const metadata = this._extractScientificMetadata(file.name, fullText);

        return {
            fileName: file.name,
            pageCount,
            fullText,
            chunks,
            metadata
        };
    }

    /**
     * Search relevant chunks for a user question
     */
    findRelevantChunks(chunks, query, maxResults = 3) {
        if (!chunks || chunks.length === 0) return [];
        const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (queryTerms.length === 0) return chunks.slice(0, maxResults);

        const scored = chunks.map(chunk => {
            let score = 0;
            const textLower = chunk.text.toLowerCase();
            queryTerms.forEach(term => {
                if (textLower.includes(term)) score += 2;
                if (chunk.topics.some(t => t.toLowerCase().includes(term))) score += 4;
            });
            return { chunk, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.filter(s => s.score > 0).slice(0, maxResults).map(s => s.chunk);
    }

    _extractTopicsFromText(text) {
        const topics = [];
        const lower = text.toLowerCase();
        if (lower.includes('แรง') || lower.includes('นิวตัน') || lower.includes('force')) topics.push('Physics: Mechanics');
        if (lower.includes('แรงเสียดทาน') || lower.includes('friction')) topics.push('Physics: Friction');
        if (lower.includes('พื้นเอียง') || lower.includes('incline')) topics.push('Physics: Inclined Plane');
        if (lower.includes('วงกลม') || lower.includes('centripetal')) topics.push('Physics: Circular Motion');
        if (lower.includes('กรด') || lower.includes('เบส') || lower.includes('ph') || lower.includes('acid')) topics.push('Chemistry: Acid-Base');
        if (lower.includes('โมล') || lower.includes('molar') || lower.includes('สารกำหนดปริมาณ')) topics.push('Chemistry: Stoichiometry');
        if (lower.includes('เซลล์') || lower.includes('กล้องจุลทรรศน์') || lower.includes('cell')) topics.push('Biology: Cell Biology');
        if (lower.includes('ระบบนิเวศ') || lower.includes('ผู้ล่า') || lower.includes('ecology')) topics.push('Biology: Ecology');
        if (lower.includes('เคปเลอร์') || lower.includes('วงโคจร') || lower.includes('kepler')) topics.push('Astronomy: Kepler');
        return topics;
    }

    /**
     * Detailed regex extraction of scientific values & recommended simulation configuration
     */
    _extractScientificMetadata(fileName, text) {
        const lower = (fileName + ' ' + text).toLowerCase();

        // 1. Check for Physics
        if (lower.includes('พื้นเอียง') || lower.includes('นิวตัน') || lower.includes('newton') || lower.includes('แรงเสียดทาน') || lower.includes('f=ma')) {
            // Extract mass: e.g. 5 kg, 10 กก., มวล 15 kg
            const massMatch = text.match(/(?:มวล|mass)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:kg|กก\.?|g|กรัม)?/i) || text.match(/(\d+(?:\.\d+)?)\s*kg/i);
            const forceMatch = text.match(/(?:แรง|force|f)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:n|นิวตัน)?/i) || text.match(/(\d+(?:\.\d+)?)\s*n\b/i);
            const muMatch = text.match(/(?:สัมประสิทธิ์|mu|µ|u)\s*[:=]?\s*(0(?:\.\d+)?)/i);
            const angleMatch = text.match(/(?:มุม|angle|theta|องศา)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:°|องศา|deg)?/i);

            const mass = massMatch ? parseFloat(massMatch[1]) : 10;
            const force = forceMatch ? parseFloat(forceMatch[1]) : 45;
            const mu = muMatch ? parseFloat(muMatch[1]) : 0.25;
            const angle = angleMatch ? parseFloat(angleMatch[1]) : 0;

            return {
                subject: 'physics',
                subjectThai: 'ฟิสิกส์ (Physics)',
                subMode: 'phys_newton',
                subModeName: 'กฎการเคลื่อนที่นิวตัน & แรง 3 มิติ',
                title: 'การทดลองกฎข้อที่ 2 ของนิวตัน และแรงเสียดทานบนพื้นราบ/พื้นเอียง',
                confidence: 0.92,
                params: {
                    mass,
                    appliedForce: force,
                    frictionCoeff: mu,
                    inclineAngle: angle
                },
                paramDisplay: `มวล m = ${mass} kg, แรงดึง F = ${force} N, สัมประสิทธิ์แรงเสียดทาน µ = ${mu}, มุมเอียง = ${angle}°`,
                summary: 'เอกสารมีเนื้อหาเกี่ยวกับกลศาสตร์ กฎการเคลื่อนที่ของนิวตัน ($F = ma$) และการวิเคราะห์แรงเสียดทาน'
            };
        }

        // 2. Check for Chemistry
        if (lower.includes('hcl') || lower.includes('naoh') || lower.includes('กรด') || lower.includes('เบส') || lower.includes('ไทเทรต') || lower.includes('โมล') || lower.includes('สารละลาย')) {
            const volAMatch = text.match(/(?:สาร\s*a|hcl|กรด)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:ml|มล\.?)?/i);
            const volBMatch = text.match(/(?:สาร\s*b|naoh|เบส)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:ml|มล\.?)?/i);
            const tempMatch = text.match(/(?:อุณหภูมิ|temp)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:°c|c)?/i);

            const volA = volAMatch ? parseFloat(volAMatch[1]) : 50;
            const volB = volBMatch ? parseFloat(volBMatch[1]) : 50;
            const temp = tempMatch ? parseFloat(tempMatch[1]) : 25;

            return {
                subject: 'chemistry',
                subjectThai: 'เคมี (Chemistry)',
                subMode: 'chem_mix',
                subModeName: 'ผสมสารเคมีในบีกเกอร์ 3D',
                title: 'การทดลองปฏิกิริยาสะเทินกรด-เบส และพลังงานความร้อน',
                confidence: 0.90,
                params: {
                    reactionType: 'neutralization',
                    volA,
                    volB,
                    temp
                },
                paramDisplay: `สาร A = ${volA} mL, สาร B = ${volB} mL, อุณหภูมิ = ${temp} °C`,
                summary: 'เอกสารมีเนื้อหาเกี่ยวกับปฏิกิริยาสะเทินระหว่างกรดและเบส การเกิดความร้อน และการคำนวณปริมาณสารสัมพันธ์'
            };
        }

        // 3. Check for Biology
        if (lower.includes('เซลล์') || lower.includes('กล้องจุลทรรศน์') || lower.includes('cell') || lower.includes('microscope') || lower.includes('onion') || lower.includes('ระบบนิเวศ')) {
            const isEco = lower.includes('ระบบนิเวศ') || lower.includes('ห่วงโซ่อาหาร') || lower.includes('ผู้ล่า');
            if (isEco) {
                return {
                    subject: 'biology',
                    subjectThai: 'ชีววิทยา (Biology)',
                    subMode: 'bio_eco',
                    subModeName: 'จำลองระบบนิเวศ Lotka-Volterra',
                    title: 'การจำลองพลวัตประชากรในระบบนิเวศและห่วงโซ่อาหาร',
                    confidence: 0.88,
                    params: { ecoProducers: 120, ecoPrey: 60, ecoPredators: 15 },
                    paramDisplay: 'ผู้ผลิต = 120, สัตว์กินพืช = 60, ผู้ล่า = 15',
                    summary: 'เอกสารกล่าวถึงปฏิสัมพันธ์ระหว่างชนิดพันธุ์ การแกว่งตัวของประชากร และพีระมิดพลังงาน'
                };
            }

            return {
                subject: 'biology',
                subjectThai: 'ชีววิทยา (Biology)',
                subMode: 'bio_micro',
                subModeName: 'กล้องจุลทรรศน์เสมือน & ตัวอย่างเซลล์',
                title: 'การศึกษาโครงสร้างเซลล์พืชและออร์แกเนลล์ภายใต้กล้องจุลทรรศน์',
                confidence: 0.89,
                params: { specimen: 'onion', magnification: 400 },
                paramDisplay: 'ตัวอย่าง: เซลล์เยื่อหอม (Onion Epidermis), กำลังขยาย: 400x',
                summary: 'เอกสารระบุถึงการเตรียมสไลด์สด การปรับโฟกัส และการสังเกตผนังเซลล์กับนิวเคลียส'
            };
        }

        // 4. Default / Astronomy
        const aMatch = text.match(/(?:กึ่งแกนเอก|a)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:au)?/i);
        const eMatch = text.match(/(?:ความรี|e|eccentricity)\s*[:=]?\s*(0(?:\.\d+)?)/i);
        const aVal = aMatch ? parseFloat(aMatch[1]) : 6.0;
        const eVal = eMatch ? parseFloat(eMatch[1]) : 0.5;

        return {
            subject: 'astronomy',
            subjectThai: 'ดาราศาสตร์ (Astronomy)',
            subMode: 'astro_kepler',
            subModeName: 'กลศาสตร์อวกาศ & กฎเคปเลอร์',
            title: 'การศึกษาคาบการโคจรและวงโคจรทรงรีตามกฎของเคปเลอร์',
            confidence: 0.85,
            params: { semiMajorAxis: aVal, eccentricity: eVal },
            paramDisplay: `กึ่งแกนเอก a = ${aVal} AU, ความรี e = ${eVal}`,
            summary: 'เอกสารมีเนื้อหาเกี่ยวกับกลศาสตร์ท้องฟ้า วงโคจรทรงรี และกฎข้อที่ 3 ของเคปเลอร์ ($T^2 = a^3$)'
        };
    }
}

export const pdfEngine = new PdfEngine();
