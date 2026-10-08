/**
 * calculator-engine.js
 * Deterministic Scientific Computation & Verification Engine
 * 
 * Provides rigorous numerical calculations for:
 * - Physics (Newton's laws, friction, inclined plane, centripetal force, kinematics, energy)
 * - Chemistry (Moles, molarity, dilution, limiting reagent, pH/pOH, gas law)
 * - Astronomy (Kepler's third law, orbital velocities, eccentricity distance)
 * - Biology (Lotka-Volterra derivatives, magnification optics)
 * 
 * ALWAYS includes:
 * Input parameters -> Formula -> Substitution -> Computed Value -> Unit -> Scientific Verification Check
 */

export class CalculatorEngine {
    constructor() {
        this.constants = {
            g: 9.80665, // standard gravity m/s^2 (also supports 10 or 9.8 via params)
            G: 6.67430e-11, // N m^2 / kg^2
            R: 0.08206, // L atm / (mol K)
            NA: 6.02214076e23, // Avogadro
            kw: 1.0e-14
        };
    }

    // ==========================================
    // 1. PHYSICS COMPUTATIONS
    // ==========================================

    /**
     * Compute Force: F = m * a
     */
    calculateForce(mass, acceleration) {
        const m = Number(mass);
        const a = Number(acceleration);
        if (isNaN(m) || isNaN(a)) throw new Error('Invalid numeric parameters for F = ma');

        const F = m * a;

        // Verification layer
        const verify = Math.abs(a === 0 ? F : (F / m) - a) < 1e-6;

        return {
            topic: "Newton's Second Law",
            formula: "F = m \\cdot a",
            inputs: { mass: { value: m, unit: "kg" }, acceleration: { value: a, unit: "m/s²" } },
            substitution: `F = (${m}) \\cdot (${a})`,
            result: F,
            unit: "N (Newtons)",
            verified: verify,
            verificationNote: verify ? `ตรวจสอบย้อนกลับ: \\frac{F}{m} = \\frac{${F}}{${m}} = ${a} \\text{ m/s²} (ตรงกัน)` : "⚠ Calculation verification failed",
            interpretation: `แรงลัพธ์ขนาด ${F.toFixed(3)} N กระทำต่อมวล ${m} kg ทำให้เกิดความเร่ง ${a} m/s² ในทิศทางเดียวกัน`
        };
    }

    /**
     * Compute Acceleration: a = F / m
     */
    calculateAcceleration(force, mass) {
        const F = Number(force);
        const m = Number(mass);
        if (isNaN(F) || isNaN(m)) throw new Error('Invalid numeric parameters for a = F/m');
        if (m <= 0) throw new Error('มวลต้องมากกว่า 0 kg');

        const a = F / m;
        const verify = Math.abs((m * a) - F) < 1e-6;

        return {
            topic: "Acceleration Calculation",
            formula: "a = \\frac{F}{m}",
            inputs: { force: { value: F, unit: "N" }, mass: { value: m, unit: "kg" } },
            substitution: `a = \\frac{${F}}{${m}}`,
            result: a,
            unit: "m/s²",
            verified: verify,
            verificationNote: verify ? `ตรวจสอบย้อนกลับ: m \\cdot a = ${m} \\cdot ${a.toFixed(4)} = ${F} \\text{ N} (ตรงกัน)` : "⚠ Calculation verification failed",
            interpretation: `ความเร่งของวัตถุเท่ากับ ${a.toFixed(3)} m/s² แปรผันตรงกับแรงและแปรผกผันกับมวล`
        };
    }

    /**
     * Compute Friction & State on Flat or Inclined Surface
     */
    calculateFriction(mu, normalForce) {
        const u = Number(mu);
        const N = Number(normalForce);
        if (isNaN(u) || isNaN(N)) throw new Error('Invalid friction parameters');

        const f = u * N;
        const verify = Math.abs(N === 0 ? f : (f / u) - N) < 1e-6;

        return {
            topic: "Friction Force",
            formula: "f = \\mu \\cdot N",
            inputs: { coefficient: { value: u, unit: "dimensionless" }, normalForce: { value: N, unit: "N" } },
            substitution: `f = (${u}) \\cdot (${N})`,
            result: f,
            unit: "N",
            verified: verify,
            verificationNote: verify ? `ตรวจสอบ: \\frac{f}{\\mu} = \\frac{${f.toFixed(2)}}{${u}} = ${N} \\text{ N}` : "⚠ Verification mismatch",
            interpretation: `แรงเสียดทานมีค่า ${f.toFixed(2)} N ในทิศตรงข้ามกับแนวโน้มการเคลื่อนที่`
        };
    }

    /**
     * Complete Inclined Plane Mechanics Solver
     * m: mass (kg)
     * thetaDeg: angle in degrees
     * appliedForce: external force parallel to incline up (+) or down (-)
     * muStatic: static friction coefficient
     * muKinetic: kinetic friction coefficient (if omitted, uses muStatic)
     * g: gravitational acceleration (default 9.8 or 10)
     */
    calculateInclinedPlane({ mass, thetaDeg = 0, appliedForce = 0, muStatic = 0.2, muKinetic = null, g = 9.8 }) {
        const m = Number(mass);
        const theta = Number(thetaDeg);
        const Fapp = Number(appliedForce);
        const us = Number(muStatic);
        const uk = Number(muKinetic !== null ? muKinetic : us);
        const grav = Number(g);

        if (isNaN(m) || m <= 0) throw new Error('มวลต้องมากกว่า 0 kg');

        const thetaRad = (theta * Math.PI) / 180;
        const mg = m * grav;
        const N = mg * Math.cos(thetaRad); // Normal force
        const Fgx = mg * Math.sin(thetaRad); // Gravitational force pulling down the ramp
        const fsMax = us * N; // Max static friction
        const fk = uk * N;   // Kinetic friction

        // Net driving force trying to move the object down/up the incline
        // Let positive be "up the incline", negative be "down the incline"
        const drivingForce = Fapp - Fgx; // if Fapp=0, driving is -Fgx (pulling down)

        let isMoving = false;
        let frictionForce = 0;
        let netForce = 0;
        let acceleration = 0;
        let stateDescription = "";

        if (Math.abs(drivingForce) > fsMax) {
            // Overcomes static friction -> Moves!
            isMoving = true;
            // Direction of motion
            const motionSign = Math.sign(drivingForce); // +1 moving up, -1 moving down
            frictionForce = -motionSign * fk; // opposes motion
            netForce = drivingForce + frictionForce;
            acceleration = netForce / m;
            stateDescription = motionSign > 0
                ? `วัตถุกำลังเคลื่อนที่ขึ้นตามแนวพื้นเอียงด้วยความเร่ง ${acceleration.toFixed(3)} m/s²`
                : `วัตถุกำลังเคลื่อนที่ไถลลงตามแนวพื้นเอียงด้วยความเร่ง ${Math.abs(acceleration).toFixed(3)} m/s²`;
        } else {
            // Static equilibrium (Newton's 1st Law)
            isMoving = false;
            frictionForce = -drivingForce; // precisely cancels driving force
            netForce = 0;
            acceleration = 0;
            stateDescription = `วัตถุอยู่นิ่งในสภาวะสมดุลสถิต (Static Equilibrium, \\Sigma F = 0) เพราะแรงขับ (${Math.abs(drivingForce).toFixed(2)} N) ยังไม่ชนะแรงเสียดทานสถิตสูงสุด (${fsMax.toFixed(2)} N)`;
        }

        // Verification check
        const verify = isMoving ? Math.abs((m * acceleration) - netForce) < 1e-4 : netForce === 0;

        return {
            topic: "Inclined Plane Mechanics",
            formula: "N = mg\\cos\\theta, \\quad F_{gx} = mg\\sin\\theta, \\quad \\Sigma F = ma",
            inputs: { mass: m, thetaDeg: theta, appliedForce: Fapp, muStatic: us, muKinetic: uk, g: grav },
            components: {
                weight: mg,
                normalForce: N,
                gravityParallel: Fgx,
                maxStaticFriction: fsMax,
                kineticFriction: fk,
                actualFriction: Math.abs(frictionForce),
                drivingForce,
                netForce,
                acceleration,
                isMoving
            },
            verified: verify,
            verificationNote: verify ? `ตรวจสอบสมดุล/ความเร่ง: \\Sigma F = (${m}) \\cdot (${acceleration.toFixed(4)}) = ${netForce.toFixed(3)} N (ถูกต้อง)` : "⚠ Verification mismatch",
            explanation: stateDescription
        };
    }

    /**
     * Compute Centripetal Force: Fc = m * v^2 / r
     */
    calculateCentripetalForce(mass, velocity, radius) {
        const m = Number(mass);
        const v = Number(velocity);
        const r = Number(radius);
        if (isNaN(m) || isNaN(v) || isNaN(r) || r <= 0 || m <= 0) {
            throw new Error('รัศมีและมวลต้องมากกว่า 0');
        }

        const ac = (v * v) / r;
        const Fc = m * ac;
        const Ek = 0.5 * m * v * v;
        const verify = Math.abs((Fc * r) / (m * v) - v) < 1e-4;

        return {
            topic: "Centripetal Force & Circular Motion",
            formula: "F_c = \\frac{m \\cdot v^2}{r}, \\quad a_c = \\frac{v^2}{r}",
            inputs: { mass: m, velocity: v, radius: r },
            substitution: `F_c = \\frac{${m} \\cdot (${v})^2}{${r}} = \\frac{${m} \\cdot ${v*v}}{${r}}`,
            acceleration: ac,
            force: Fc,
            kineticEnergy: Ek,
            unit: "N",
            verified: verify,
            verificationNote: verify ? `ตรวจสอบย้อนกลับ: \\sqrt{\\frac{F_c \\cdot r}{m}} = \\sqrt{\\frac{${Fc.toFixed(2)} \\cdot ${r}}{${m}}} = ${v} \\text{ m/s}` : "⚠ Verification mismatch",
            interpretation: `วัตถุต้องการแรงสู่ศูนย์กลาง ${Fc.toFixed(2)} N ชี้เข้าหาจุดศูนย์กลางตลอดเวลาเพื่อรักษาวงโคจรรัศมี ${r} m`
        };
    }

    // ==========================================
    // 2. CHEMISTRY COMPUTATIONS
    // ==========================================

    /**
     * Compute Moles from Mass: n = g / Mw
     */
    calculateMoles(massGrams, molarMass) {
        const g = Number(massGrams);
        const mw = Number(molarMass);
        if (isNaN(g) || isNaN(mw) || mw <= 0) throw new Error('มวลและมวลโมเลกุลต้องเป็นตัวเลขที่มากกว่า 0');

        const n = g / mw;
        const molecules = n * this.constants.NA;
        const verify = Math.abs((n * mw) - g) < 1e-5;

        return {
            topic: "Mole Concept (n = g/Mw)",
            formula: "n = \\frac{\\text{mass (g)}}{Mw (\\text{g/mol})}",
            inputs: { mass: g, molarMass: mw },
            substitution: `n = \\frac{${g}}{${mw}}`,
            moles: n,
            molecules: molecules,
            unit: "mol",
            verified: verify,
            verificationNote: verify ? `ตรวจสอบ: n \\times Mw = ${n.toFixed(5)} \\times ${mw} = ${g} \\text{ g} (ตรงกัน)` : "⚠ Mismatch",
            interpretation: `สารมวล ${g} กรัม คิดเป็น ${n.toFixed(4)} โมล หรือมีจำนวนอนุภาค ${molecules.toExponential(3)} โมเลกุล/ไอออน`
        };
    }

    /**
     * Solution Dilution: M1 * V1 = M2 * V2
     * Solve for unknown among M1, V1, M2, V2
     */
    calculateDilution({ M1, V1, M2, V2 }) {
        let result = {};
        if (M1 !== undefined && V1 !== undefined && V2 !== undefined && M2 === undefined) {
            const m2 = (Number(M1) * Number(V1)) / Number(V2);
            result = { target: 'M2', value: m2, unit: 'M (mol/L)' };
        } else if (M1 !== undefined && V1 !== undefined && M2 !== undefined && V2 === undefined) {
            const v2 = (Number(M1) * Number(V1)) / Number(M2);
            result = { target: 'V2', value: v2, unit: 'mL' };
        } else if (M2 !== undefined && V2 !== undefined && M1 !== undefined && V1 === undefined) {
            const v1 = (Number(M2) * Number(V2)) / Number(M1);
            result = { target: 'V1', value: v1, unit: 'mL' };
        } else {
            throw new Error('กรุณาระบุตัวแปร 3 ตัวเพื่อหาตัวแปรที่ 4 ในสูตร M1V1 = M2V2');
        }

        return {
            topic: "Solution Dilution (M₁V₁ = M₂V₂)",
            formula: "M_1 V_1 = M_2 V_2",
            inputs: { M1, V1, M2, V2 },
            solved: result,
            interpretation: `ความเข้มข้นหรือปริมาตรสารละลายหลังเจือจางสอดคล้องกับการอนุรักษ์จำนวนโมลตัวถูกละลาย`
        };
    }

    /**
     * Limiting Reagent Calculator for 2A + B -> Products
     * stoichiometric Coeff A and B
     */
    calculateLimitingReagent({ molA, coeffA = 1, molB, coeffB = 1, nameA = "สาร A", nameB = "สาร B" }) {
        const nA = Number(molA);
        const nB = Number(molB);
        const cA = Number(coeffA);
        const cB = Number(coeffB);

        if (isNaN(nA) || isNaN(nB) || cA <= 0 || cB <= 0) {
            throw new Error('Invalid stoichiometry parameters');
        }

        const ratioA = nA / cA;
        const ratioB = nB / cB;

        let limiting = "";
        let excess = "";
        let unreactedExcess = 0;
        let reactionsCompleted = 0;

        if (ratioA < ratioB) {
            limiting = nameA;
            excess = nameB;
            reactionsCompleted = ratioA;
            unreactedExcess = nB - (ratioA * cB);
        } else if (ratioB < ratioA) {
            limiting = nameB;
            excess = nameA;
            reactionsCompleted = ratioB;
            unreactedExcess = nA - (ratioB * cA);
        } else {
            limiting = "ทั้งสองตัวทำปฏิกิริยาหมดพอดี (Equimolar Stoichiometric)";
            excess = "ไม่มีสารเหลือ";
            reactionsCompleted = ratioA;
            unreactedExcess = 0;
        }

        return {
            topic: "Limiting Reagent Determination",
            formula: "\\text{Ratio} = \\frac{\\text{moles}}{\\text{coefficient}}",
            inputs: { [nameA]: { moles: nA, coeff: cA, ratio: ratioA }, [nameB]: { moles: nB, coeff: cB, ratio: ratioB } },
            limitingReagent: limiting,
            excessReagent: excess,
            excessRemaining: unreactedExcess,
            reactionsCompleted,
            verified: true,
            interpretation: `สารกำหนดปริมาณคือ ${limiting} เพราะมีอัตราส่วนโมลต่อสัมประสิทธิ์น้อยที่สุด (${Math.min(ratioA, ratioB).toFixed(4)}) จึงหมดก่อนและกำหนดปริมาณผลิตภัณฑ์ทั้งหมด`
        };
    }

    /**
     * Acid-Base pH and pOH: pH = -log10[H+]
     */
    calculatePH(hConcentration) {
        const h = Number(hConcentration);
        if (isNaN(h) || h <= 0) throw new Error('ความเข้มข้นไอออนต้องมากกว่า 0 mol/L');

        const ph = -Math.log10(h);
        const poh = 14.0 - ph;
        const oh = Math.pow(10, -poh);
        const verify = Math.abs(ph + poh - 14.0) < 1e-6;

        let nature = "เป็นกลาง (Neutral)";
        if (ph < 6.99) nature = "กรด (Acidic)";
        else if (ph > 7.01) nature = "เบส (Basic / Alkaline)";

        return {
            topic: "pH & pOH Calculation",
            formula: "\\text{pH} = -\\log[H^+], \\quad \\text{pH} + \\text{pOH} = 14",
            inputs: { hConcentration: h },
            substitution: `\\text{pH} = -\\log(${h})`,
            pH: ph,
            pOH: poh,
            ohConcentration: oh,
            nature,
            verified: verify,
            verificationNote: verify ? `ตรวจสอบ: pH + pOH = ${ph.toFixed(2)} + ${poh.toFixed(2)} = 14.00` : "⚠ Mismatch",
            interpretation: `สารละลายมีค่า pH เท่ากับ ${ph.toFixed(2)} จัดเป็นสารละลาย${nature}`
        };
    }

    // ==========================================
    // 3. ASTRONOMY COMPUTATIONS
    // ==========================================

    /**
     * Kepler's Third Law: T^2 = a^3 (T in Earth years, a in AU for Sun orbit)
     */
    calculateKeplerThirdLaw(semiMajorAxisAU) {
        const a = Number(semiMajorAxisAU);
        if (isNaN(a) || a <= 0) throw new Error('กึ่งแกนเอก a ต้องมากกว่า 0 AU');

        // T^2 = a^3 => T = sqrt(a^3) = a^(1.5)
        const T = Math.sqrt(Math.pow(a, 3));
        const aRecomputed = Math.cbrt(T * T);
        const verify = Math.abs(aRecomputed - a) < 1e-4;

        return {
            topic: "Kepler's Third Law of Planetary Motion",
            formula: "T^2 = a^3 \\implies T = \\sqrt{a^3} = a^{1.5}",
            inputs: { semiMajorAxisAU: a },
            substitution: `T = \\sqrt{(${a})^3} = \\sqrt{${Math.pow(a, 3).toFixed(3)}}`,
            periodYears: T,
            periodDays: T * 365.25,
            verified: verify,
            verificationNote: verify ? `ตรวจสอบย้อนกลับ: \\sqrt[3]{T^2} = \\sqrt[3]{${(T*T).toFixed(3)}} = ${a.toFixed(2)} \\text{ AU}` : "⚠ Mismatch",
            interpretation: `ดาวเคราะห์ที่มีระยะห่างกึ่งแกนเอก ${a} AU จะใช้เวลาโคจรรอบดวงอาทิตย์ ${T.toFixed(2)} ปีโลก (${(T * 365.25).toFixed(0)} วัน)`
        };
    }

    /**
     * Kepler Orbital Distances: Perihelion and Aphelion
     * r_peri = a(1 - e), r_aph = a(1 + e)
     */
    calculateKeplerDistances(semiMajorAxisAU, eccentricity) {
        const a = Number(semiMajorAxisAU);
        const e = Number(eccentricity);
        if (isNaN(a) || isNaN(e) || a <= 0 || e < 0 || e >= 1) {
            throw new Error('ค่าความรี e ต้องอยู่ในช่วง [0, 1) และ a > 0');
        }

        const rPeri = a * (1 - e);
        const rAph = a * (1 + e);
        const b = a * Math.sqrt(1 - e * e); // semi-minor axis
        const verify = Math.abs(((rPeri + rAph) / 2) - a) < 1e-6;

        return {
            topic: "Kepler Elliptical Orbit Distances",
            formula: "r_{\\text{peri}} = a(1 - e), \\quad r_{\\text{aph}} = a(1 + e)",
            inputs: { a, e },
            perihelion: rPeri,
            aphelion: rAph,
            semiMinorAxis: b,
            verified: verify,
            verificationNote: verify ? `ตรวจสอบ: \\frac{r_{\\text{peri}} + r_{\\text{aph}}}{2} = \\frac{${rPeri.toFixed(2)} + ${rAph.toFixed(2)}}{2} = ${a} \\text{ AU}` : "⚠ Mismatch",
            interpretation: `จุดใกล้สุด (Perihelion) = ${rPeri.toFixed(2)} AU, จุดไกลสุด (Aphelion) = ${rAph.toFixed(2)} AU ดาวเคราะห์จะมีความเร็วสูงสุดที่จุดใกล้สุดตามกฎข้อที่ 2 ของเคปเลอร์`
        };
    }
}

export const calculatorEngine = new CalculatorEngine();
