/**
 * science-engine.js
 * Domain Scientific Knowledge, Misconception Detection & Reasoning Rules
 * Covers: Physics, Chemistry, Biology, Astronomy
 */

export class ScienceEngine {
    constructor() {
        this.misconceptions = [
            {
                id: 'friction_motion_direction',
                topic: 'physics_friction',
                patterns: [
                    /แรงเสียดทานมีทิศเดียวกับ/i,
                    /friction in the same direction/i,
                    /แรงเสียดทานช่วยดันให้วัตถุเคลื่อนที่ตลอด/i
                ],
                explanation: 'แรงเสียดทานสถิตและจลน์โดยทั่วไปจะ **ต้านการเคลื่อนที่สัมพัทธ์ (Relative Motion)** หรือต้านแนวโน้มการเคลื่อนที่ระหว่างผิวสัมผัส ไม่ได้มีทิศทางเดียวกับการเคลื่อนที่ของวัตถุเสมอไปครับ (ยกเว้นกรณีพิเศษ เช่น การก้าวเดินหรือล้อรถขับเคลื่อนที่แรงเสียดทานสถิตดันตัวเราไปข้างหน้าเพื่อต้านการลื่นไถลถอยหลัง)',
                example: 'เมื่อวัตถุไถลไปทางขวา แรงเสียดทานจลน์ ($f_k$) จะมีทิศชี้ไปทางซ้ายเพื่อต้านการไถลเสมอ'
            },
            {
                id: 'heavier_falls_faster_gravity',
                topic: 'physics_gravity',
                patterns: [
                    /วัตถุหนักตกเร็วกว่าวัตถุเบา/i,
                    /ของหนักตกลงมาถึงพื้นก่อน/i,
                    /heavier objects fall faster/i
                ],
                explanation: 'ในสภาวะสุญญากาศ (ไม่มีแรงต้านอากาศ) วัตถุทุกชนิดจะตกด้วย **ความเร่งโน้มถ่วง $g$ เท่ากันเสมอ** ไม่ว่ามวลจะมากหรือน้อยเพียงใด (ตามการทดลองของกาลิเลโอที่หอเอนปิซา)',
                example: '$F_g = mg$ และ $a = \\frac{F}{m} = \\frac{mg}{m} = g$ มวล $m$ ตัดกันพอดี จึงได้ความเร่งคงที่ $9.8 \\text{ m/s}^2$ เท่ากัน'
            },
            {
                id: 'no_force_no_motion',
                topic: 'physics_newton1',
                patterns: [
                    /ไม่มีแรงวัตถุต้องหยุด/i,
                    /ต้องมีแรงกระทำตลอดเวลาถึงจะเคลื่อนที่/i,
                    /constant force needed for motion/i
                ],
                explanation: 'ตาม **กฎข้อที่ 1 ของนิวตัน (กฎความเฉื่อย)**: วัตถุที่กำลังเคลื่อนที่ด้วยความเร็วคงที่อยู่แล้ว หากแรงลัพธ์เป็นศูนย์ ($\\Sigma F = 0$) วัตถุจะ **รักษาสภาพการเคลื่อนที่ด้วยความเร็วคงที่ในแนวเส้นตรงต่อไปเรื่อย ๆ** โดยไม่จำเป็นต้องมีแรงผลักดันกระทำตลอดเวลา',
                example: 'ยานอวกาศในอวกาศลึกที่ดับเครื่องยนต์แล้วจะแล่นไปข้างหน้าด้วยความเร็วเดิมตลอดกาล'
            },
            {
                id: 'circular_motion_outward_force',
                topic: 'physics_circular',
                patterns: [
                    /แรงเหวี่ยงหนีศูนย์กลางดึงออกไปข้างนอกจริง/i,
                    /centrifugal force is a real action force/i
                ],
                explanation: 'แรงที่กระทำต่อวัตถุจริง ๆ คือ **แรงสู่ศูนย์กลาง ($F_c$)** ที่ชี้เข้าหาจุดศูนย์กลางตลอดเวลา ส่วนความรู้สึกเหมือนถูก "เหวี่ยงออก" (Centrifugal effect) เป็นเพียง **ความเฉื่อย (Inertia)** ของวัตถุที่พยายามจะเคลื่อนที่เป็นเส้นตรงตามแนวสัมผัส',
                example: 'เมื่อเชือกที่ผูกวัตถุหมุนขาด วัตถุจะไม่พุ่งหนีออกจากศูนย์กลางในแนวรัศมี แต่จะพุ่งไปตามแนวเส้นสัมผัสวงกลมทันที'
            },
            {
                id: 'plant_respiration_night_only',
                topic: 'biology_respiration',
                patterns: [
                    /พืชหายใจเฉพาะตอนกลางคืน/i,
                    /plants only respire at night/i,
                    /พืชสังเคราะห์แสงแทนการหายใจ/i
                ],
                explanation: 'พืช **หายใจระดับเซลล์ (Cellular Respiration) ตลอดเวลาทั้งกลางวันและกลางคืน (24 ชั่วโมง)** เพื่อสร้างพลังงาน ATP ให้เซลล์มีชีวิต แต่ในเวลากลางวันมีอัตราการสังเคราะห์ด้วยแสง (Photosynthesis) ผลิตออกซิเจนมากกว่าอัตราการใช้ออกซิเจน',
                example: 'สมการหายใจ: $C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{ATP}$ เกิดขึ้นในไมโทคอนเดรียตลอดเวลา'
            },
            {
                id: 'seasons_distance_to_sun',
                topic: 'astronomy_seasons',
                patterns: [
                    /ฤดูร้อนเกิดจากโลกอยู่ใกล้ดวงอาทิตย์/i,
                    /ฤดูกาลเกิดจากระยะห่างของวงโคจร/i,
                    /seasons caused by distance to sun/i
                ],
                explanation: 'ฤดูกาลบนโลกเกิดจาก **แกนหมุนของโลกเอียงทำมุมประมาณ $23.5^\\circ$ กับระนาบวงโคจร** ทำให้แต่ละซีกโลกได้รับมุมตกกระทบของแสงอาทิตย์และระยะเวลากลางวันไม่เท่ากันตลอดปี ไม่ได้เกิดจากระยะห่างของวงโคจร (ความจริงเดือนกรกฎาคมซีกโลกเหนือเป็นฤดูร้อน โลกกลับอยู่จุดไกลดวงอาทิตย์ที่สุด หรือ Aphelion)',
                example: 'เมื่อซีกโลกเหนือเอียงเข้าหาดวงอาทิตย์ แสงตกกระทบเกือบตั้งฉาก พลังงานต่อหน่วยพื้นที่สูง จึงเป็นฤดูร้อน'
            }
        ];

        this.scientificConcepts = {
            physics: {
                newton_first_law: {
                    name: "กฎข้อที่ 1 ของนิวตัน (กฎความเฉื่อย)",
                    formula: "\\Sigma \\vec{F} = 0 \\implies \\vec{v} = \\text{constant}",
                    summary: "ถ้าแรงลัพธ์ที่กระทำต่อวัตถุเป็นศูนย์ วัตถุที่อยู่นิ่งจะอยู่นิ่งต่อไป และวัตถุที่กำลังเคลื่อนที่จะเคลื่อนที่ด้วยความเร็วคงที่ในแนวเส้นตรง"
                },
                newton_second_law: {
                    name: "กฎข้อที่ 2 ของนิวตัน (กฎความเร่ง)",
                    formula: "\\Sigma \\vec{F} = m\\vec{a}",
                    summary: "เมื่อมีแรงลัพธ์ที่ไม่เป็นศูนย์มากระทำต่อวัตถุ จะทำให้วัตถุเกิดความเร่งในทิศทางเดียวกับแรงลัพธ์ โดยความเร่งจะแปรผันตรงกับแรงลัพธ์และแปรผกผันกับมวลของวัตถุ"
                },
                newton_third_law: {
                    name: "กฎข้อที่ 3 ของนิวตัน (แรงกิริยาและปฏิกิริยา)",
                    formula: "\\vec{F}_{A \\rightarrow B} = -\\vec{F}_{B \\rightarrow A}",
                    summary: "ทุกแรงกิริยา (Action) ย่อมมีแรงปฏิกิริยา (Reaction) ที่มีขนาดเท่ากันแต่มีทิศทางตรงกันข้ามเสมอ และกระทำต่อวัตถุคนละชิ้น จึงไม่สามารถหักล้างกันได้"
                },
                friction_force: {
                    name: "แรงเสียดทาน (Friction)",
                    formula: "f_s \\le \\mu_s N, \\quad f_k = \\mu_k N",
                    summary: "แรงต้านการเลื่อนไถลระหว่างผิวสัมผัส แรงเสียดทานสถิตมีค่าตั้งแต่ 0 จนถึงค่าสูงสุด $\\mu_s N$ ส่วนแรงเสียดทานจลน์มีค่าคงที่ $\\mu_k N$"
                },
                centripetal_force: {
                    name: "แรงสู่ศูนย์กลาง (Centripetal Force)",
                    formula: "F_c = \\frac{mv^2}{r} = m\\omega^2 r",
                    summary: "แรงลัพธ์ที่ดึงวัตถุเข้าหาศูนย์กลางความโค้ง ทำให้ทิศทางความเร็วเปลี่ยนไป เกิดเป็นการเคลื่อนที่แบบวงกลม"
                }
            },
            chemistry: {
                mole_concept: {
                    name: "โมลและปริมาณสาร (Mole Concept)",
                    formula: "n = \\frac{g}{Mw} = \\frac{N}{6.022 \\times 10^{23}} = \\frac{V_{\\text{STP}}}{22.4}",
                    summary: "โมลเป็นหน่วยวัดปริมาณสารเคมีมาตรฐาน โดยสาร 1 โมลประกอบด้วยอนุภาค $6.022 \\times 10^{23}$ ตัว และมีมวลเป็นกรัมเท่ากับมวลโมเลกุล (Mw)"
                },
                limiting_reagent: {
                    name: "สารกำหนดปริมาณ (Limiting Reagent)",
                    formula: "\\text{อัตราส่วน} = \\frac{\\text{จำนวนโมล}}{\\text{สัมประสิทธิ์ในสมการเคมี}}",
                    summary: "สารตั้งต้นที่ถูกใช้หมดไปก่อนในปฏิกิริยาเคมี จึงเป็นตัวจำกัดและกำหนดปริมาณผลผลิตสูงสุดที่จะเกิดขึ้นได้"
                },
                ph_scale: {
                    name: "ระดับความเป็นกรด-เบส (pH Scale)",
                    formula: "\\text{pH} = -\\log[H^+], \\quad \\text{pH} + \\text{pOH} = 14",
                    summary: "สเกลลอการิทึมแสดงความเข้มข้นของไฮโดรเนียมไอออน โดย pH < 7 เป็นกรด, pH = 7 เป็นกลาง, และ pH > 7 เป็นเบส"
                }
            },
            astronomy: {
                kepler_first_law: {
                    name: "กฎข้อที่ 1 ของเคปเลอร์ (กฎวงรี)",
                    formula: "r(\\theta) = \\frac{a(1 - e^2)}{1 + e\\cos\\theta}",
                    summary: "ดาวเคราะห์โคจรรอบดวงอาทิตย์เป็นวงรี โดยดวงอาทิตย์อยู่ที่จุดโฟกัสหนึ่งของวงรี"
                },
                kepler_second_law: {
                    name: "กฎข้อที่ 2 ของเคปเลอร์ (กฎการกวาดพื้นที่)",
                    formula: "\\frac{dA}{dt} = \\frac{L}{2m} = \\text{constant}",
                    summary: "รัศมีเวกเตอร์จากดวงอาทิตย์ไปยังดาวเคราะห์จะกวาดพื้นที่ได้เท่ากันในคาบเวลาที่เท่ากัน ส่งผลให้ดาวเคราะห์เคลื่อนที่เร็วขึ้นเมื่ออยู่ใกล้ดวงอาทิตย์"
                },
                kepler_third_law: {
                    name: "กฎข้อที่ 3 ของเคปเลอร์ (กฎแห่งฮาร์โมนิก)",
                    formula: "T^2 = a^3 \\quad (\\text{ปี}^2 = \\text{AU}^3)",
                    summary: "กำลังสองของคาบการโคจรรอบดวงอาทิตย์แปรผันตรงกับกำลังสามของระยะกึ่งแกนเอก"
                }
            },
            biology: {
                cell_theory: {
                    name: "ทฤษฎีเซลล์ (Cell Theory)",
                    summary: "สิ่งมีชีวิตทุกชนิดประกอบด้วยเซลล์ เซลล์เป็นหน่วยโครงสร้างและการทำงานพื้นฐาน และเซลล์ใหม่เกิดจากการแบ่งตัวของเซลล์ที่มีอยู่เดิม"
                },
                lotka_volterra: {
                    name: "แบบจำลองประชากรผู้ล่า-เหยื่อ (Lotka-Volterra Model)",
                    formula: "\\frac{dN}{dt} = rN - aNP, \\quad \\frac{dP}{dt} = baNP - mP",
                    summary: "แบบจำลองทางคณิตศาสตร์อธิบายการแกว่งตัวเป็นรอบของประชากรเหยื่อ (N) และผู้ล่า (P) ในระบบนิเวศ"
                }
            }
        };
    }

    /**
     * Scan user question for known misconceptions
     */
    detectMisconception(questionText) {
        if (!questionText || typeof questionText !== 'string') return null;
        for (const item of this.misconceptions) {
            for (const pattern of item.patterns) {
                if (pattern.test(questionText)) {
                    return item;
                }
            }
        }
        return null;
    }

    /**
     * Retrieve matching concept from domain knowledge
     */
    getConcept(subject, conceptKey) {
        return this.scientificConcepts[subject]?.[conceptKey] || null;
    }

    /**
     * Search concepts matching query keywords
     */
    searchConcepts(queryText) {
        const q = queryText.toLowerCase();
        const results = [];

        Object.keys(this.scientificConcepts).forEach(subject => {
            Object.keys(this.scientificConcepts[subject]).forEach(key => {
                const item = this.scientificConcepts[subject][key];
                if (
                    item.name.toLowerCase().includes(q) ||
                    (item.summary && item.summary.toLowerCase().includes(q)) ||
                    q.includes(key)
                ) {
                    results.push({ subject, key, ...item });
                }
            });
        });

        return results;
    }
}

export const scienceEngine = new ScienceEngine();
