/**
 * Sizing and Topical Authority Content Repository
 * Standard parameters and expert guidelines for Boiler Feedwater Systems
 */

export interface WorkedExample {
  id: string;
  title: string;
  boilerCapacity: string;
  boilerPressure: string;
  feedwaterTemp: string;
  calculations: {
    step1_flow: string;
    step2_head: string;
    step3_npsh: string;
    step4_power: string;
  };
  finalSizing: string;
}

export interface StandardReference {
  code: string;
  name: string;
  authority: string;
  description: string;
  guidelines: string[];
}

export interface CommonMistake {
  title: string;
  consequence: string;
  expertSolution: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  schemaAnswer: string;
}


export const WorkedExamplesList: WorkedExample[] = [
  {
    id: "ex-1",
    title: "Example 1: Sizing a Boiler Feed Water Pump for a 50 TPH Industrial Steam Boiler",
    boilerCapacity: "50 Metric Tons/Hr (50,000 kg/hr) Maximum Continuous Rating (MCR)",
    boilerPressure: "45 bar(g) operating drum pressure",
    feedwaterTemp: "105°C (Deaerator operating at 0.2 bar-gauge)",
    calculations: {
      step1_flow: "DESIGN MASS FLOW RATE (Q_mass):\n• MCR Boiler Evaporation rate = 50,000 kg/hr.\n• Blowdown Rate = 3% continuous bleed (1,500 kg/hr).\n• Hydrological System Safety Factor = 10% for mechanical clearances and control drift.\n• Q_mass = 50,000 * (1 + 0.03) * 1.10 = 56,650 kg/hr.\n• At 105°C, feedwater density (ρ) = 954.3 kg/m³.\n• Volumetric Design Flow Rate (Q) = Q_mass / ρ = 56,650 / 954.3 = 59.36 m³/hr (approx. 261.4 GPM).",
      step2_head: "TOTAL DYNAMIC HEAD (TDH):\n• Feed System Discharge Pressure Target (Pd) = 45 bar(g) + 10% safety buffer for piping drops and feedwater control valve drop (approx. 4.5 bar) = 49.5 bar(g).\n• Deaerator Suction Inlet Pressure (Ps) = 0.2 bar(g).\n• Differential Pressure (Pd - Ps) = 49.3 bar = 4.93 * 10^5 N/m².\n• Differential Pressure Head = (49.3 * 10^5) / (954.3 * 9.81) = 526.6 meters of water column (m.w.c).\n• Suction Lift Static Height (Hz) = Suction vessel (Deaerator) is placed 7 meters above the pump centerline = +7.0 m (static head contributes to suction head, helping the pump).\n• Total system pipe friction loss (Hf) = Suction pipe friction (Hfs = 0.8m) + Discharge line pipe friction (Hfd = 18m) = 18.8 meters.\n• Dynamic Velocity Acceleration Head (Hv) = 1.5 meters.\n• Hydrostatic Safety Factor = 10%.\n• Total Dynamic Head (TDH) = (526.6 - 7.0 + 18.8 + 1.5) * 1.10 = 593.9 meters of head (approx. 1,948 feet).",
      step3_npsh: "NET POSITIVE SUCTION HEAD (NPSHa):\n• Deaerator pressure (Absolute) = 1.013 bar (ATM) + 0.2 bar (G) = 1.213 bar abs.\n• High-temperature vapor pressure of water at 105°C = 1.208 bar abs (extremely close to boiling point!).\n• Suction Static elevation (Hz) = +7.0 m.\n• Friction resistance loss in suction line (Hfs) = 0.8 m.\n• NPSHa = (P_suction_abs - P_vapor_abs) / (ρ * g) + Hz - Hfs\n• (121,300 Pa - 120,800 Pa) / (954.3 * 9.81) = 0.05 meters pressure head margin.\n• NPSHa = 0.05 m + 7.0 m - 0.8 m = 6.25 meters.\n• Verified Rule: A typical pump for this duty requires NPSHr = 4.5 meters. The safety margin is 6.25 - 4.5 = 1.75 meters (which exceeds the minimum 1.5m standard, suppressing any transient bubble cavitation).",
      step4_power: "POWER AND MOTOR COEFFICIENT DRIVER:\n• Volumetric Flow Rate (Q) = 59.36 m³/hr = 0.01649 m³/sec.\n• Net head of water column (H) = 593.9 meters.\n• Feed water Fluid Density (ρ) = 954.3 kg/m³.\n• Hydraulic Power (P_hyd) = (954.3 * 9.81 * 0.01649 * 593.9) / 1000 = 91.68 kW.\n• Pump Efficiency (η_p) = 74% (at best efficiency point).\n• Brake Horsepower Shaft Power = P_hyd / η_p = 91.68 / 0.74 = 123.89 kW.\n• Mechanical Shaft Transmission Coupling Efficiency = 98%.\n• Motor Driver Grid Conversion Input Efficiency = 93% (IE3 Premium Class).\n• Motor Shaft Power required = 123.89 / 0.98 = 126.4 kW.\n• Standard commercial selection requires a 110% buffer to prevent trip: Motor Nameplate duty = 126.4 * 1.10 = 139 kW.\n• Select standard frame: 150 kW (200 HP) induction motor."
    },
    finalSizing: "RECOMMENDED PUMP SPECIFICATION:\n• Sized Flow: 60 m³/hr | TDH: 595 meters | NPSHa: 6.25 m | Selected Driver: 150 kW, 2-Pole squirrel-cage mechanical induction motor (2950 RPM)."
  },
  {
    id: "ex-2",
    title: "Example 2: Sizing BFP Utility Sizing for Co-generation Plant (150 TPH Boiler)",
    boilerCapacity: "150 Tons/Hour Continuous Utility Load (150,000 kg/hr)",
    boilerPressure: "95 bar(g) main steam drum header pressure",
    feedwaterTemp: "140°C (High pressure de-aerator arrangement at 2.6 bar-gauge)",
    calculations: {
      step1_flow: "DESIGN VOLUMETRIC FLOW:\n• MCR Load = 150,000 kg/hr\n• Purge blowdown sweep = 2% continuous (3,000 kg/hr)\n• Safety Factor = 12% flow expansion margin\n• Q_mass = 150,000 * (1 + 0.02) * 1.12 = 171,360 kg/hr.\n• At 140°C, feedwater density (ρ) = 925.8 kg/m³.\n• Volumetric Flow (Q) = 171,360 / 925.8 = 185.1 m³/hr (815 GPM).",
      step2_head: "TOTAL DYNAMIC HEAD (TDH):\n• System Discharge Requirement = 95 bar(g) + 12% control allowance = 106.4 bar(g).\n• Suction source pressure (Ps) = 2.6 bar(g).\n• Differential Pressure (Pd - Ps) = 103.8 bar = 1.038 * 10^7 N/m².\n• Pressurization Head = 1.038 * 10^7 / (925.8 * 9.81) = 1,142.9 meters.\n• Suction elevation (Hz) = 12 meters static height.\n• Friction drops (Hf) = Suction pipe (1.2m) + Discharge pipeline & check valves (29m) = 30.2 meters.\n• Dynamic Velocity Head (Hv) = 2.0 meters.\n• Sizing Safety Buffer = 10%.\n• TDH = (1142.9 - 12 + 30.2 + 2.0) * 1.10 = 1,281.6 meters (approx. 4,204 feet).",
      step3_npsh: "NPSH SAFETY AUDITING:\n• Suction pressure abs = 1.013 + 2.6 = 3.613 bar abs.\n• Water Vapor Pressure at 140°C = 3.614 bar abs. (Boiling fluid threshold!).\n• Suction Static elevation (Hz) = 12.0 meters.\n• Suction Pipe friction loss (Hfs) = 1.2 meters.\n• NPSHa = (3.613 - 3.614) * 10^5 / (925.8 * 9.81) + 12.0 - 1.2 = 10.8 meters.\n• High-temperature fluid requires significant suction static height of deaerator (12m minimum) to satisfy NPSHr (6.5m) and maintain secure cavitation margin.",
      step4_power: "BREAK HORSEPOWER CONSUMPTION:\n• Volumetric flow Q = 185.1 m³/hr = 0.0514 m³/sec.\n• Sizing TDH = 1,281.6 meters.\n• Density = 925.8 kg/m³.\n• Hydraulic Power (P_hyd) = (925.8 * 9.81 * 0.0514 * 1281.6) / 1000 = 598.6 kW.\n• Best pump efficiency (η) = 78%.\n• Brake Horsepower (BHP) shaft demand = 598.6 / 0.78 = 767.4 kW.\n• Selecting a 20% motor torque margin: Selected Motor Driver Frame = 900 kW (approx 1,200 HP) high-tension 6.6 kV drive motor."
    },
    finalSizing: "RECOMMENDED PUMP SPECIFICATION:\n• Multistage Ring-Section Barrel-Cased Feedwater Pump with 11 internal stages, 185 m³/hr rating, 1,285m head, 900 kW Prime Driver."
  }
];

export const IndustryStandardsList: StandardReference[] = [
  {
    code: "ASME Section I & VII",
    name: "Rules for Construction of Power Boilers & Care of Power Boilers",
    authority: "American Society of Mechanical Engineers (ASME)",
    description: "Governs boiler feed calculations, safety factor provisions, and dual-redundancy guidelines for steam generating systems.",
    guidelines: [
      "Requires a minimum of two separate, independent feed water streams for solid-fuel fired boilers or systems producing over 11,000 kg/hr steam.",
      "Each independent feed water source must have sufficient capacity to fed the boiler at 100% maximum continuous rating (MCR).",
      "Feed piping system must withstand feed pump shut-off head design pressures (typically 120-130% of system design pressure)."
    ]
  },
  {
    code: "API Standard 610",
    name: "Centrifugal Pumps for Petroleum, Petrochemical and Natural Gas Industries",
    authority: "American Petroleum Institute (API)",
    description: "The gold standard for heavy-duty, high-pressure, high-temperature horizontal centrifugal pumps used in refining and thermal processing.",
    guidelines: [
      "Recommends BB4 (single-case multistage ring section) or BB5 (double-case barrel pumps) configurations for fluids above 150°C or operating pressure above 35 bar.",
      "Pump casings must remain pressure tight for a hydrostatic test pressure equal to 1.5 times the maximum allowable working pressure (MAWP).",
      "Requires mechanical seals conforming to API-682 standards with external heat barrier cooling flushing loops (Plan 21 or Plan 23) for boiler feed service."
    ]
  },
  {
    code: "IS 9137:1978",
    name: "Code for Acceptance Tests for Centrifugal, Mixed Flow and Axial Pumps - Class C",
    authority: "Bureau of Indian Standards (BIS)",
    description: "Defines Indian industrial and power field commissioning quality tolerances, test tolerances, and efficiency calculation benchmarks.",
    guidelines: [
      "Establishes strict performance verification tolerances on output flow (±9%) and mechanical head (±4%).",
      "Provides procedures for verifying motor driver efficiency scaling coefficients.",
      "Details specific pressure measurement tap specifications on suction and discharge lines."
    ]
  },
  {
    code: "HI/ANSI 14.3",
    name: "Rotodynamic Pumps for Design and Application",
    authority: "Hydraulic Institute Standards",
    description: "Global standards detailing calculations for viscous fluids, NPSH margins, piping alignments, and mechanical testing parameters.",
    guidelines: [
      "Sets a minimum safe NPSH continuous margin ratio (NPSHa / NPSHr) of 1.3 to 1.5 to resist sub-surface micro-bubble cavitation erosion.",
      "Maintains that maximum liquid velocity in suction piping should be confined below 1.5 - 2.0 m/sec to suppress pressure friction drops."
    ]
  }
];

export const CommonSizingMistakes: CommonMistake[] = [
  {
    title: "1. Calculating Net Suction Pressure at Cold Conditions (Ignoring Temperature)",
    consequence: "Catastrophic Cavitation and Impeller Destruction within weeks.",
    expertSolution: "Water vapor pressure increases exponentially as temperature rises. At 120°C, the boiling pressure of water is 1.98 bar(a). Failure to substitute water's true boiling vapor pressure at high feed conditions results in overestimating the NPSH Available. Always execute NPSHa audits utilizing the maximum peak temperature of the feedwater stream."
  },
  {
    title: "2. Under-estimating the Feedwater Control Valve Pressure Drop",
    consequence: "System cannot feed steam drums at full thermal load, triggering low-level boiler trips.",
    expertSolution: "Feedwater system control valves require structural throttle drops of 2 to 5 bar to smoothly adjust to steam loading swings. Sizers frequently look only at steam drum pressure and main pipe friction, forgetting that the regulating globe valve consumes considerable head. Always add 10% to 15% to direct drum pressures to provide head buffer with valve safety margins."
  },
  {
    title: "3. Selection of Oversized Sizing Safety Factors ('Double Padding')",
    consequence: "Pumps operate far to the left of their Best Efficiency Point (BEP), escalating motor heat & power bills.",
    expertSolution: "When the boiler designer adds 10% padding to steam layout flows, the piping designer adds 10% to head, and the pump vendor adds another 10% for mechanical clearances, the pump operates in a highly throttled, low-efficiency zone. This results in mechanical heat recirculation, shaft deflection, and severe power waste. Limit safety padding factors tightly to 10-15% above actual thermodynamic mass load requirements."
  },
  {
    title: "4. Failure to Correct Physical Density Factors in Volumetric Conversions",
    consequence: "Pump is selected with insufficient flow rating, because the volumetric GPM was converted using common tap water density.",
    expertSolution: "Boilers are rated in mass flow standards (Tons/hr or kg/hr). Pumps are selected based on volumetric flows (m³/hr or GPM). Water expands heavily at hot feed temperatures: at 140°C, a cubic meter weighs only 925 kg (as opposed to 1000 kg at 4°C). Sizing the pump with cold density creates a 7.5% flow deficit. Always divide Mass Flow by Hot Density (ρ) corresponding to boiler deaerator temperatures."
  }
];

export const FullFaqList: FAQItem[] = [
  {
    id: "faq-1",
    question: "How is a Boiler Feed Pump size calculated and what parameters are critical?",
    answer: "Boiler feed pump (BFP) sizing is calculated through three unified physical stages. First, determine the design mass flow rate (kg/hr or lb/hr) by factoring in the boiler's Maximum Continuous Rating (MCR) steam capacity and continuous deaerator blowdown purge, scaled by an engineering safety coefficient (typically 1.10 to 1.15). Second, convert this mass flow to volumetric discharge flow (m³/hr or GPM) using the hot density of feedwater at operating temperature. Next, calculate the Total Dynamic Head (TDH), which is the absolute difference between discharge piping system backpressure (drum operating target + control valve delta + line friction losses) and suction inlet pressure, summed with net static vertical lift height. Lastly, calculate hydraulic and brake power consumption to select a correctly sized electric induction motor driver.",
    schemaAnswer: "First, determine design mass flow rate including boiler continuous boiler steam output, blowdown, and safety margins (usually 1.10 to 1.15). Second, divide mass flow by feedwater hot density to get volumetric flow. Third, calculate Total Dynamic Head (TDH) as discharge pressure minus suction pressure (converted to meters), adding suction/discharge piping friction losses and static lift height. Lastly, calculate electric brake motor horsepower based on pump mechanical efficiency."
  },
  {
    id: "faq-2",
    question: "Why does hot water density coefficient drastically change BFP selection?",
    answer: "Water is not incompressible when subjected to chemical heat expansion. As water temperature increases inside a thermal power cycle (e.g., from room temperature up to deaerated preheated conditions ranging between 100°C and 160°C), its volumetric density drops significantly (dropping from 1000 kg/m³ to as low as 900 kg/m³). Since centrifugal pumps are strictly dynamic volumetric displacement devices, a pump sized using cold water constants (1000 kg/m³) will have a mass delivery deficit of up to 10% under heat loads. Failing to calibrate for hot fluid density will lead to selecting an undersized pump that cannot sustain boiler steam drum levels at full boiler continuous rating.",
    schemaAnswer: "As water heats from 20°C to deaerator temperatures like 140°C, its density drops from 1000 kg/m³ to 925 kg/m³. If you size volumetric pump flow (m³/hr or GPM) using cold water constants, you will have a severe mass flow delivery deficit. Hot density must be retrieved dynamically to convert mass-based boiler capacities into accurate volumetric selection parameters."
  },
  {
    id: "faq-3",
    question: "What is the recommended NPSH safety margin for boiler feed water pumps?",
    answer: "Given the high vapor pressures and rapid temperature transience typical of deaerator water headers, the Hydraulic Institute (HI/ANSI) and industry standards recommend maintaining a strict Net Positive Suction Head Available (NPSHa) margin of at least 1.5 to 2.0 meters (or 1.3 to 1.5 times the pump's required NPSHr) over the entire running curve. Boiler feed pumps operate on the verge of liquid-vapor phase transition. If steam pressure inside the deaerator drops suddenly, hot water inside the suction line can flash into transient vapor bubbles. If these bubbles enter the pump impeller, they collapse under high pressure, causing catastrophic structural cavitation erosion, severe metal pitting, vibration, and swift shaft mechanical seal failures.",
    schemaAnswer: "Always guarantee that Net Positive Suction Head Available (NPSHa) has at least a 1.5m to 2.0m security margin over manufacturer's NPSHr. In hot steam-water power plant layouts, rapid turbine load shedding can trigger sudden deaerator pressure drops, flashing hot water into feed line cavitation bubbles that violently collapse inside impeller channels."
  },
  {
    id: "faq-4",
    question: "How do I calculate the Total Dynamic Head (TDH) accurately?",
    answer: "The formula for Boiler Feed Pump TDH (Total Dynamic Head) is: TDH = [(Pd - Ps) * 10.2 / SG] + H_static + H_friction_suction + H_friction_discharge + H_velocity_head. In this formula, Pd is the boiler steam drum pressure plus feedwater control valve drops (bar), Ps is deaerator pressure (bar), SG is the hot fluid specific gravity (dimensionless), H_static is the net height difference (meters), and H_friction is the cumulative friction drop in piping and fittings. The 10.2 factor converts bar pressure to physical water column meters. This calculation yields the energy in meters of liquid column of the specific preheated water being handled by the pump impellers.",
    schemaAnswer: "TDH = [(Pd - Ps) * 10.2 / SG] + Hz + Hf_suction + Hf_discharge + Hv, where Pd is discharge pressure, Ps is suction deaerator pressure, SG is hot liquid specific gravity, Hz is static elevations, Hf represents pipe system friction, and Hv is velocity head difference."
  },
  {
    id: "faq-5",
    question: "What is the difference between a boiler feed pump and a condensate extraction pump?",
    answer: "A Condensate Extraction Pump (CEP) is positioned at the absolute cold end of the power cycle. It extracts low-temperature condensed water from the turbine condenser hotwell under heavy vacuum conditions and transfers it through low-pressure regenerative feed heaters. It handles low temperatures (typically 35°C to 50°C) and moderately low head. On the other hand, a Boiler Feed Pump (BFP) is placed further downstream in the high-pressure stage. It takes hot preheated water from the deaerator storage tank and injects it into high-pressure steam boiler drums. It operates under extreme thermodynamic conditions (temperatures usually between 105°C and 165°C, with discharge pressures up to 180 bar for utility boilers). It requires heavy structural designs, such as multi-stage horizontal ring-section or barrel casing structures.",
    schemaAnswer: "Condensate Extraction Pumps (CEP) draw low-temperature (35-50°C) water from hotwell vacuum vessels under low pressure. Boiler Feed Pumps (BFP) pump high-temperature (105-165°C) water from deaerator tanks into high-pressure steam boilers (up to 180 bar) requiring multistage, massive mechanical constructions."
  },
  {
    id: "faq-6",
    question: "Why must deaerator tanks be elevated high above the feed pump centerline?",
    answer: "Deaerator storage tanks must be elevated (typically 6 to 15 meters) for one primary thermodynamic reason: to physically generate the necessary static head buffer (Hz) to satisfy the Net Positive Suction Head Available (NPSHa). Because deaerated water is stored at its saturated boiling point corresponding to operating vessel pressure, its absolute suction pressure is equal to its vapor pressure. Consequently, the pressure-head term in the NPSHa formula cancels out completely [(P_suction_abs - P_vapor) / (ρ * g) = 0]. Thus, static liquid height is the only mechanical source of positive pressure head before entering the pump nozzle. Elevating the deaerator prevents vapor flash cavitation.",
    schemaAnswer: "At the deaerator water surface, pressure and boiling vapor pressure are in thermodynamic equilibrium, which cancels out the static pressure term. Consequently, suction elevation head (Hz) minus pipe friction drop is the only physical variable producing positive head to prevent water from vaporizing in the suction nozzle."
  },
  {
    id: "faq-7",
    question: "How is pump brake horsepower (BHP) related to fluid specific gravity?",
    answer: "Brake Horsepower (BHP), or pump shaft power consumption, is calculated using the formula: BHP = (Q * H * ρ * g) / η_pump, which translates to: BHP = (Q * TDH * SG) / (3960 * η) in US units, or kW = (m³/hr * TDH * SG) / (367.2 * η) in metric. Hence, shaft power is directly proportional to Specific Gravity (SG) or fluid density (ρ). Because preheated feedwater at higher temperatures has a lower Specific Gravity than cold water, the actual electrical input power (kW) consumed by the pump is lower than it would be for cold water. Always verify motor sizing against cold commissioning conditions, as testing with cold water can overload a motor sized strictly for hot working specific gravities.",
    schemaAnswer: "Brake shaft power is directly proportional to Specific Gravity (SG). Hot feedwater at 140°C has an SG of ~0.925 and requires less motor energy than cold water testing (SG = 1.0) under identical volumes. Motor sizing must be evaluated against cold commissioning to avoid electrical overload."
  },
  {
    id: "faq-8",
    question: "What is API 610 BB4 vs BB5 barrel pump configuration, and when are they used?",
    answer: "API 610 BB4 refers to horizontal, single-case, radially split ring-section multistage centrifugal pumps (often called 'tie-rod' pumps). These are highly cost-effective and suited for continuous mid-to-high pressure industrial boilers up to ~100 bar. API 610 BB5 refers to double-case, radially split barrel pumps. The double-case construction encloses the entire pumping elements inside an inner core inside a secondary pressure-containment outer barrel. BB5 pumps are extremely robust, leak-free, and recommended for utility boiler applications exceeding 100 bar, temperatures above 150°C, or hazardous heavy-duty power services where mechanical thermal shock is probable.",
    schemaAnswer: "BB4 pumps are radially split ring-section multistage centrifugal pumps, ideal for medium pressures up to 100 bar. BB5 pumps are double-case barrel pumps where high pressures (100 to 250+ bar) are contained safely within a redundant outer containment barrel to withstand thermal and hydraulic shocks."
  },
  {
    id: "faq-9",
    question: "What is boiler continuous blowdown (CBD) and how does it affect capacity calculations?",
    answer: "Boiler continuous blowdown (CBD) is the deliberate, ongoing discharge of a small fraction of water from the boiler steam drum. This process expels concentrated dissolved solids (TDS) and prevents critical mineral scaling on boiler evaporator tubes. The blowdown rate typically ranges from 1% to 5% of the steam output. Since this blown-down water is lost from the closed loop, the boiler feed pump must supply equivalent makeup. Therefore, the design pump flow capacity must sum the steam evaporation requirement (MCR) and the blowdown flow requirement, plus safety margins, to prevent feedwater shortages.",
    schemaAnswer: "To prevent scale-inducing mineral build-up, boilers bleed off 1% to 5% of their water capacity continuously. Because this blowdown is lost as hot water, the boiler feed water pump must supply this additional flow. It is factored as Q_mass = Steam Capacity (MCR) * (1 + Blowdown Rate % / 100)."
  },
  {
    id: "faq-10",
    question: "How does variable frequency drive (VFD) speed speed controls save power in BFPs?",
    answer: "Historically, feedwater flow is throttled using control valves, which wastes pressure across the control valve and forces the pump to operate at high, power-wasting heads. In contrast, a Variable Frequency Drive (VFD) alters the rotational speed of the pump in response to boiler steam drum level fluctuations. According to the pump Affinity Laws, required shaft power varies as the cube of the speed ratio (P2 / P1 = (N2 / N1)³). Reducing pump speed by just 20% drops power demand by approximately 49%. Sizing with VFD controls significantly improves plant heat rate and reduces motor wear.",
    schemaAnswer: "Traditional control valves throttle discharge flow by adding heavy artificial friction friction, wasting power. A VFD adjusts pump speed directly. Under pump Affinity Laws, rotor speed reduction decreases electric power consumptions cubically, generating high energy savings during low load."
  },
  {
    id: "faq-11",
    question: "What is specific speed (Ns) and how does it determine BFP impeller geometry?",
    answer: "Specific Speed (Ns) is an index of pump impeller shape, defined by the formula Ns = N * √Q / H^0.75 (where N is RPM, Q is flow, and H is head per stage). In boiler feed pump configurations, where the design requires extremely high pressure (high head H) and moderate, controlled volumetric flow (Q), the calculated specific speed is low (generally between 500 and 1,500). Physically, low specific speeds indicate a narrow, large-diameter radial flow impeller design. Radial flow impellers generate high centrifugal heads, making them ideal for multi-stage configurations designed to feed boiler steam cycles.",
    schemaAnswer: "Specific Speed Ns = N * √Q / H^0.75 classifies impeller geometry. High head and moderate flow result in low specific speeds (500 to 1,500), which dictates radial flow impellers with narrow corridors and large diameters, typical of multi-stage boiler feed systems."
  },
  {
    id: "faq-12",
    question: "How does the feedwater control valve pressure drop affect motor selection?",
    answer: "Feedwater regulating control valves require a structural throttle drop of 2 to 5 bar to smoothly regulate the flow. Under ASME guidelines, this throttle loss must be directly added to the static boiler steam drum operating pressure during TDH calculation. Sizing a pump without accounting for this flow control valve pressure drop can lead to motor trip under high steam demands, because the pump cannot overcome the aggregate resistance and the control valve throttles shut. Ensuring this valve pressure drop is fully integrated into the TDH prevents control deficiencies and motor overload.",
    schemaAnswer: "A control valve must consume 2 to 5 bar of head to throttle feedwater levels effectively. This pressure drop must be factored into the TDH. Sizing calculations must include this control-valve delta to ensure the selected pump and motor can feed the drum during high-capacity shifts."
  }
];

export const AssumptionsAndLimitationsText = `
### Calculations Assumptions & Limitations

Engineering calculations present high accuracy only when physical boundary conditions are strictly controlled. Our calculation framework is based on the following specific criteria and theoretical limits:

1. **Newtonian Liquid Assumptions:** Every hydraulic calculation assumes clean, clear water acting as a pure Newtonian fluid with linear shear mechanics. For boilers using high solid concentrations or additive treatments, viscosity corrections under the Hydraulic Institute (HEI) standards may be required.
2. **Fixed Heat Coefficients:** The dynamic water density and vapor pressure formulas assume thermodynamic equilibrium at the designated feedwater temperature. High transient shifts, such as cold boiler startup or thermal shocks, may cause variations of up to ±5% in fluid density.
3. **No Dynamic Piping Transient Forces:** The Total Dynamic Head (TDH) calculation utilizes steady-state fluid velocity fields. Water hammer, sudden stop-valve collapses, and start-up line purging transients are excluded. Piping designs must be independently audited for fluid pressure safety.
`;
