// ============================================================
// MASTER CURRICULUM DEFINITIONS — 10 DOMAINS, 5 CHAPTERS EACH
// ============================================================

export const MASTER_CURRICULUM = [
    {
        id: "python",
        name: "Python Programming",
        icon: "🐍",
        category: "computer_science",
        badge: "Scripting, Logic & Object-Oriented Architecture",
        description: "Master modern Python from first principles, algorithmic thinking, data structures to production-grade scripts.",
        chapters: [
            {
                id: 1,
                title: "Python Basics & Syntax",
                summary: "Interpreter execution, indentation, comments, and the anatomy of a Python script.",
                duration_sec: 120,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Chapter 1: Python Basics & Syntax\nprint("Hello, Future Developer!")\n\n# Python uses clean, whitespace-driven indentation\ndef greet(name):\n    message = f"Welcome to Python, {name}!"\n    return message\n\nprint(greet("Explorer"))`,
                    expected_output: "Hello, Future Developer!\nWelcome to Python, Explorer!",
                    steps: [
                        { line: 2, explanation: "The print() function outputs text directly to standard console." },
                        { line: 5, explanation: "def defines a reusable block of code called a function." },
                        { line: 6, explanation: "f-strings enable easy variable interpolation inside strings." }
                    ]
                },
                checkpoint: {
                    question_id: "py-cp-1",
                    question: "How does Python define code blocks instead of using curly braces {}?",
                    type: "mcq",
                    options: [
                        "A) Semicolons at the end of each line",
                        "B) Consistent indentation (whitespace / tabs)",
                        "C) Parentheses around every statement",
                        "D) Special BEGIN and END keywords"
                    ],
                    correct_answer: "B) Consistent indentation (whitespace / tabs)",
                    hint: "Notice the 4 spaces before statements inside functions and loops.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Languages like C/Java use semicolons; Python relies on clean indentation." }
                    ]
                }
            },
            {
                id: 2,
                title: "Variables, Data Types & Operators",
                summary: "Dynamic typing, integers, floats, strings, booleans, arithmetic, and logical operators.",
                duration_sec: 140,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Variables & Dynamic Types\nage = 21                 # int\ngpa = 3.92               # float\nstudent_name = "Alex"    # str\nis_enrolled = True       # bool\n\n# Arithmetic & Comparison\nnext_year_age = age + 1\nis_honor_roll = gpa >= 3.8 and is_enrolled\n\nprint(f"{student_name} is {next_year_age} next year. Honor roll: {is_honor_roll}")`,
                    expected_output: "Alex is 22 next year. Honor roll: True",
                    steps: [
                        { line: 2, explanation: "Variables are created the moment you assign a value to them." },
                        { line: 8, explanation: "Python dynamically determines the type based on assigned values." },
                        { line: 9, explanation: "Logical operators 'and', 'or', 'not' evaluate boolean expressions." }
                    ]
                },
                checkpoint: {
                    question_id: "py-cp-2",
                    question: "What is the output of type(3.14) in Python?",
                    type: "mcq",
                    options: [
                        "A) <class 'int'>",
                        "B) <class 'float'>",
                        "C) <class 'number'>",
                        "D) <class 'decimal'>"
                    ],
                    correct_answer: "B) <class 'float'>",
                    hint: "Numbers with fractional decimal points belong to floating-point numbers.",
                    common_misconceptions: [
                        { answer: "C", misconception: "Python has distinct 'int' and 'float' types, not a generic 'number' type." }
                    ]
                }
            },
            {
                id: 3,
                title: "Conditional Statements & Loops",
                summary: "Branching with if-elif-else, counter-controlled for loops, and condition-driven while loops.",
                duration_sec: 150,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Conditional branching & Iteration\nscores = [88, 92, 79, 95, 60]\nhonors_count = 0\n\nfor score in scores:\n    if score >= 90:\n        grade = "A (Honor)"\n        honors_count += 1\n    elif score >= 80:\n        grade = "B"\n    else:\n        grade = "Needs Review"\n    print(f"Score {score} -> {grade}")\n\nprint(f"Total honors: {honors_count}")`,
                    expected_output: "Score 88 -> B\nScore 92 -> A (Honor)\nScore 79 -> Needs Review\nScore 95 -> A (Honor)\nScore 60 -> Needs Review\nTotal honors: 2",
                    steps: [
                        { line: 5, explanation: "for ... in iterates through each element in an iterable collection." },
                        { line: 6, explanation: "if and elif evaluate conditions top-to-bottom and execute the first true branch." }
                    ]
                },
                checkpoint: {
                    question_id: "py-cp-3",
                    question: "What will range(1, 5) yield when iterated in a for loop?",
                    type: "mcq",
                    options: [
                        "A) 1, 2, 3, 4, 5",
                        "B) 1, 2, 3, 4",
                        "C) 0, 1, 2, 3, 4, 5",
                        "D) 0, 1, 2, 3, 4"
                    ],
                    correct_answer: "B) 1, 2, 3, 4",
                    hint: "The stop parameter in Python's range() function is always exclusive.",
                    common_misconceptions: [
                        { answer: "A", misconception: "In Python, range(start, stop) excludes the stop value itself." }
                    ]
                }
            },
            {
                id: 4,
                title: "Functions, Lists, Tuples & Dictionaries",
                summary: "Modular functions, mutable lists, immutable tuples, and key-value hash dictionaries.",
                duration_sec: 160,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Modern Data Structures\nstudent_records = [\n    {"id": 101, "name": "Aria", "skills": ("Python", "FastAPI")},\n    {"id": 102, "name": "Dev",  "skills": ("React", "Tailwind")}\n]\n\ndef find_student_by_id(records, target_id):\n    for record in records:\n        if record["id"] == target_id:\n            return record["name"], record["skills"]\n    return None, ()\n\nname, skills = find_student_by_id(student_records, 101)\nprint(f"Found: {name} with skills: {skills}")`,
                    expected_output: "Found: Aria with skills: ('Python', 'FastAPI')",
                    steps: [
                        { line: 2, explanation: "Dictionaries store key-value associations with fast O(1) lookup." },
                        { line: 3, explanation: "Tuples (parentheses) are immutable sequences that cannot be modified." }
                    ]
                },
                checkpoint: {
                    question_id: "py-cp-4",
                    question: "Which of the following is an IMMUTABLE data structure in Python?",
                    type: "mcq",
                    options: [
                        "A) List [1, 2, 3]",
                        "B) Dictionary {'a': 1}",
                        "C) Tuple (1, 2, 3)",
                        "D) Set {1, 2, 3}"
                    ],
                    correct_answer: "C) Tuple (1, 2, 3)",
                    hint: "Tuples cannot have elements added, deleted, or changed after creation.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Lists are mutable and can be modified with .append(), .pop(), etc." }
                    ]
                }
            },
            {
                id: 5,
                title: "Files, Exception Handling & Mini Project",
                summary: "Context managers (with open), try-except-finally error safety, and a capstone project.",
                duration_sec: 180,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Capstone Mini Project: Safe Data Processor\ndef process_user_input(raw_value):\n    try:\n        number = float(raw_value)\n        result = 100 / number\n        return f"Result: {result:.2f}"\n    except ValueError:\n        return "Error: Input must be a valid number."\n    except ZeroDivisionError:\n        return "Error: Cannot divide by zero!"\n\nprint(process_user_input("25"))\nprint(process_user_input("0"))\nprint(process_user_input("abc"))`,
                    expected_output: "Result: 4.00\nError: Cannot divide by zero!\nError: Input must be a valid number.",
                    steps: [
                        { line: 3, explanation: "try block wraps potentially dangerous runtime operations." },
                        { line: 7, explanation: "except catches specific exceptions to prevent application crashes." }
                    ]
                },
                checkpoint: {
                    question_id: "py-cp-5",
                    question: "Why is using 'with open(filename) as f:' preferred for file handling in Python?",
                    type: "mcq",
                    options: [
                        "A) It executes file operations twice as fast",
                        "B) It automatically closes the file even if exceptions occur",
                        "C) It encrypts the file on disk",
                        "D) It converts the file into a Python list"
                    ],
                    correct_answer: "B) It automatically closes the file even if exceptions occur",
                    hint: "The context manager protocol ensures resources are reliably released.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The primary purpose of context managers is guaranteed cleanup and safety, not raw execution speed." }
                    ]
                }
            }
        ]
    },
    {
        id: "physics",
        name: "Physics",
        icon: "⚛️",
        category: "physics",
        badge: "Forces, Energy & Physical Universe",
        description: "Explore the laws governing motion, energy, gravity, matter, and wave dynamics across the universe.",
        chapters: [
            {
                id: 1,
                title: "Units, Measurements & Vectors",
                summary: "SI units, dimensional analysis, scalar vs vector quantities, and vector resolution.",
                duration_sec: 120,
                visual_type: "formula",
                visual_payload: {
                    title: "Vector Resolution in 2D Space",
                    formula_latex: "\\vec{R} = \\sqrt{R_x^2 + R_y^2}, \\quad \\theta = \\tan^{-1}\\left(\\frac{R_y}{R_x}\\right)",
                    step_by_step: [
                        "Break vector A into orthogonal components: Ax = |A| * cos(θ), Ay = |A| * sin(θ)",
                        "Sum algebraic components: Rx = Σ Ax, Ry = Σ Ay",
                        "Compute magnitude using the Pythagorean theorem: |R| = √(Rx² + Ry²)"
                    ],
                    key_takeaway: "Vectors require both magnitude and directional orientation to fully describe physical phenomena."
                },
                checkpoint: {
                    question_id: "ph-cp-1",
                    question: "Which of the following is a VECTOR quantity?",
                    type: "mcq",
                    options: [
                        "A) Mass",
                        "B) Velocity",
                        "C) Temperature",
                        "D) Distance"
                    ],
                    correct_answer: "B) Velocity",
                    hint: "Velocity includes both speed and the direction of motion.",
                    common_misconceptions: [
                        { answer: "D", misconception: "Distance is a scalar; displacement and velocity are vectors." }
                    ]
                }
            },
            {
                id: 2,
                title: "Motion & Laws of Motion",
                summary: "Kinematics, Newton's three laws, inertia, friction, and free-body diagrams.",
                duration_sec: 140,
                visual_type: "simulation",
                visual_payload: {
                    sim_type: "newton_motion",
                    initial_params: { mass: 5, force: 20, friction: 0.2 },
                    explanation: "Newton's Second Law: Acceleration is directly proportional to net force and inversely proportional to mass (F_net = m * a)."
                },
                checkpoint: {
                    question_id: "ph-cp-2",
                    question: "If net external force acting on an object is zero, what can be concluded?",
                    type: "mcq",
                    options: [
                        "A) The object must be stationary",
                        "B) The object accelerates in the direction of motion",
                        "C) The object remains at rest or maintains constant velocity",
                        "D) Gravity ceases to exist on the object"
                    ],
                    correct_answer: "C) The object remains at rest or maintains constant velocity",
                    hint: "Newton's First Law (Law of Inertia) defines motion in the absence of net force.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Zero net force also allows steady, unaccelerated motion at constant speed in a straight line." }
                    ]
                }
            },
            {
                id: 3,
                title: "Work, Energy & Power",
                summary: "Work-energy theorem, kinetic vs potential energy, conservation laws, and mechanical power.",
                duration_sec: 140,
                visual_type: "formula",
                visual_payload: {
                    title: "Conservation of Mechanical Energy",
                    formula_latex: "E_{total} = K + U = \\frac{1}{2}mv^2 + mgh = \\text{constant}",
                    step_by_step: [
                        "Kinetic Energy (K): Energy stored in motion, 0.5 * m * v²",
                        "Gravitational Potential Energy (U): Energy from elevation, m * g * h",
                        "In isolated conservative systems, total energy is strictly conserved."
                    ],
                    key_takeaway: "Energy cannot be created or destroyed; it only transforms between kinetic, potential, and thermal forms."
                },
                checkpoint: {
                    question_id: "ph-cp-3",
                    question: "If an object's speed doubles, how does its kinetic energy change?",
                    type: "mcq",
                    options: [
                        "A) It doubles (2x)",
                        "B) It triples (3x)",
                        "C) It quadruples (4x)",
                        "D) It remains unchanged"
                    ],
                    correct_answer: "C) It quadruples (4x)",
                    hint: "Kinetic energy depends on the square of velocity: KE = 0.5 * m * v².",
                    common_misconceptions: [
                        { answer: "A", misconception: "Because velocity is squared, doubling speed produces (2)² = 4 times the kinetic energy." }
                    ]
                }
            },
            {
                id: 4,
                title: "Gravitation & Properties of Matter",
                summary: "Universal law of gravitation, planetary orbits, elasticity, fluid pressure, and Pascal's principle.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Universal Gravitation & States of Matter",
                    bullet_points: [
                        "Newton's Universal Law: F_g = G * (m1 * m2) / r² — inverse square force.",
                        "Elasticity & Hooke's Law: Stress is directly proportional to strain within elastic limits (F = -k * x).",
                        "Fluids & Pascal's Principle: Pressure applied to an enclosed fluid transmits equally in all directions."
                    ],
                    highlight: "Gravity shapes cosmic planetary orbits, while intermolecular electromagnetic forces govern material strength."
                },
                checkpoint: {
                    question_id: "ph-cp-4",
                    question: "What happens to the gravitational force between two masses if the distance between them is doubled?",
                    type: "mcq",
                    options: [
                        "A) It doubles",
                        "B) It is halved (1/2)",
                        "C) It decreases to one-fourth (1/4)",
                        "D) It remains unchanged"
                    ],
                    correct_answer: "C) It decreases to one-fourth (1/4)",
                    hint: "The gravitational force follows the inverse-square law: F ∝ 1 / r².",
                    common_misconceptions: [
                        { answer: "B", misconception: "Because distance is squared in the denominator, 2² = 4, so force becomes 1/4th." }
                    ]
                }
            },
            {
                id: 5,
                title: "Thermodynamics, Waves & Oscillations",
                summary: "Laws of thermodynamics, heat engines, simple harmonic motion, wave interference, and resonance.",
                duration_sec: 160,
                visual_type: "simulation",
                visual_payload: {
                    sim_type: "pendulum",
                    initial_params: { length: 2.0, gravity: 9.8, angle: 15 },
                    explanation: "Simple Harmonic Motion: Period of oscillation depends on string length and gravitational acceleration: T = 2π√(L/g)."
                },
                checkpoint: {
                    question_id: "ph-cp-5",
                    question: "Which law states that heat cannot spontaneously flow from a colder body to a hotter body?",
                    type: "mcq",
                    options: [
                        "A) Zeroth Law of Thermodynamics",
                        "B) First Law of Thermodynamics",
                        "C) Second Law of Thermodynamics",
                        "D) Third Law of Thermodynamics"
                    ],
                    correct_answer: "C) Second Law of Thermodynamics",
                    hint: "Entropy of an isolated system always tends to increase over time.",
                    common_misconceptions: [
                        { answer: "B", misconception: "The First Law governs energy conservation; the Second Law defines the irreversible direction of heat transfer." }
                    ]
                }
            }
        ]
    },
    {
        id: "math",
        name: "Mathematics",
        icon: "📐",
        category: "math",
        badge: "Rigorous Proofs, Functions & Calculus",
        description: "Build strong foundational logic, algebraic manipulation, trigonometric relationships, and differential calculus.",
        chapters: [
            {
                id: 1,
                title: "Sets, Relations & Functions",
                summary: "Set theory, Venn diagrams, Cartesian products, injective/surjective mappings, and domain/range.",
                duration_sec: 120,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Functions & Set Mappings",
                    bullet_points: [
                        "Set Operations: Union (A ∪ B), Intersection (A ∩ B), and Difference (A \\ B).",
                        "Function Definition: A relation where each element in domain X maps to exactly one element in codomain Y.",
                        "One-to-One (Injective) vs Onto (Surjective) mappings form the foundation of bijective inverses."
                    ],
                    highlight: "A relation is only a function if the vertical line test holds for every domain value."
                },
                checkpoint: {
                    question_id: "math-cp-1",
                    question: "If a function assigns every distinct input to a unique output, what type of function is it?",
                    type: "mcq",
                    options: [
                        "A) Injective (One-to-One)",
                        "B) Surjective (Onto)",
                        "C) Constant function",
                        "D) Discontinuous function"
                    ],
                    correct_answer: "A) Injective (One-to-One)",
                    hint: "No two different inputs produce the exact same output value.",
                    common_misconceptions: [
                        { answer: "B", misconception: "Surjective means the entire codomain is covered; Injective means each input has a unique output." }
                    ]
                }
            },
            {
                id: 2,
                title: "Algebra & Quadratic Equations",
                summary: "Polynomial factorization, quadratic formula, nature of roots (discriminant), and systems of equations.",
                duration_sec: 130,
                visual_type: "formula",
                visual_payload: {
                    title: "The Quadratic Formula & Discriminant",
                    formula_latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad \\Delta = b^2 - 4ac",
                    step_by_step: [
                        "Standard polynomial form: ax² + bx + c = 0",
                        "Calculate discriminant: Δ = b² - 4ac",
                        "If Δ > 0: 2 distinct real roots; if Δ = 0: 1 repeated real root; if Δ < 0: complex conjugate roots."
                    ],
                    key_takeaway: "The discriminant instantly reveals the geometric intersection of the parabola with the x-axis."
                },
                checkpoint: {
                    question_id: "math-cp-2",
                    question: "What does a negative discriminant (Δ < 0) indicate for a quadratic equation?",
                    type: "mcq",
                    options: [
                        "A) Two equal real roots",
                        "B) Two complex (non-real) conjugate roots",
                        "C) Infinite solutions",
                        "D) A linear line rather than a parabola"
                    ],
                    correct_answer: "B) Two complex (non-real) conjugate roots",
                    hint: "Taking the square root of a negative number introduces the imaginary unit i.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Equal real roots occur when Δ = 0; negative Δ produces complex roots." }
                    ]
                }
            },
            {
                id: 3,
                title: "Trigonometry",
                summary: "Unit circle, sine/cosine/tangent ratios, trigonometric identities, and periodic waves.",
                duration_sec: 140,
                visual_type: "formula",
                visual_payload: {
                    title: "Fundamental Pythagorean Identity",
                    formula_latex: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1, \\quad 1 + \\tan^2(\\theta) = \\sec^2(\\theta)",
                    step_by_step: [
                        "On the unit circle, any point coordinates are (cos θ, sin θ).",
                        "Pythagorean theorem x² + y² = r² directly yields cos²(θ) + sin²(θ) = 1.",
                        "Divide across by cos²(θ) to derive 1 + tan²(θ) = sec²(θ)."
                    ],
                    key_takeaway: "Trigonometry connects angular rotations to linear coordinates across periodic oscillations."
                },
                checkpoint: {
                    question_id: "math-cp-3",
                    question: "What is the exact value of sin(90°) or sin(π/2 radians)?",
                    type: "mcq",
                    options: [
                        "A) 0",
                        "B) 0.5",
                        "C) 1",
                        "D) Undefined"
                    ],
                    correct_answer: "C) 1",
                    hint: "At 90 degrees on the unit circle, the y-coordinate reaches its absolute peak.",
                    common_misconceptions: [
                        { answer: "A", misconception: "cos(90°) = 0, whereas sin(90°) = 1." }
                    ]
                }
            },
            {
                id: 4,
                title: "Coordinate Geometry & Calculus Basics",
                summary: "Slope of curves, limits, rates of change, power rule derivatives, and area under curves.",
                duration_sec: 150,
                visual_type: "formula",
                visual_payload: {
                    title: "First Principles Derivative (Limit Definition)",
                    formula_latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}, \\quad \\frac{d}{dx}[x^n] = n x^{n-1}",
                    step_by_step: [
                        "A secant line measures average rate of change between x and x+h.",
                        "Letting h shrink toward zero gives the tangent line: instantaneous velocity.",
                        "Power Rule shortcut: multiply by exponent and reduce power by 1."
                    ],
                    key_takeaway: "Derivatives measure how fast things change; integrals measure how things accumulate."
                },
                checkpoint: {
                    question_id: "math-cp-4",
                    question: "What is the derivative of f(x) = 3x² + 5x - 7 with respect to x?",
                    type: "mcq",
                    options: [
                        "A) 6x + 5",
                        "B) 3x + 5",
                        "C) 6x² + 5",
                        "D) 6x"
                    ],
                    correct_answer: "A) 6x + 5",
                    hint: "Apply the power rule: d/dx(3x²) = 6x and d/dx(5x) = 5.",
                    common_misconceptions: [
                        { answer: "B", misconception: "Multiply coefficient 3 by power 2 to get 6x." }
                    ]
                }
            },
            {
                id: 5,
                title: "Probability & Statistics",
                summary: "Permutations, combinations, conditional probability, Bayes theorem, normal distribution, and mean/variance.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Probabilistic Reasoning & Normal Distribution",
                    bullet_points: [
                        "Bayes' Theorem: P(A|B) = [P(B|A) * P(A)] / P(B) — updating beliefs given new evidence.",
                        "Standard Normal Curve (Empirical Rule): 68% within 1σ, 95% within 2σ, 99.7% within 3σ.",
                        "Expected Value & Variance quantify central tendency and risk dispersion."
                    ],
                    highlight: "Probability quantifies uncertainty before an event; statistics discovers patterns from observed data."
                },
                checkpoint: {
                    question_id: "math-cp-5",
                    question: "In a standard normal distribution, approximately what percentage of data falls within 1 standard deviation of the mean?",
                    type: "mcq",
                    options: [
                        "A) 50%",
                        "B) 68%",
                        "C) 95%",
                        "D) 99.7%"
                    ],
                    correct_answer: "B) 68%",
                    hint: "Remember the empirical 68 - 95 - 99.7 rule.",
                    common_misconceptions: [
                        { answer: "C", misconception: "95% falls within 2 standard deviations; 68% falls within 1 standard deviation." }
                    ]
                }
            }
        ]
    },
    {
        id: "biology",
        name: "Biology",
        icon: "🧬",
        category: "biology",
        badge: "Cellular Architecture, Genetics & Ecosystems",
        description: "Investigate life from microscopic cells, biochemical pathways, organ systems to evolutionary adaptations.",
        chapters: [
            {
                id: 1,
                title: "Introduction to Biology & Cell Structure",
                summary: "Cell theory, prokaryotic vs eukaryotic cells, membrane transport, and organelle functions.",
                duration_sec: 130,
                visual_type: "diagram",
                visual_payload: {
                    organism_or_system: "Eukaryotic Animal Cell",
                    labels: [
                        { name: "Nucleus", desc: "Houses genetic DNA chromatin and orchestrates cellular activity" },
                        { name: "Mitochondria", desc: "Site of cellular respiration and ATP energy generation" },
                        { name: "Endoplasmic Reticulum", desc: "Rough ER synthesizes proteins; Smooth ER synthesizes lipids" },
                        { name: "Golgi Apparatus", desc: "Packages and distributes proteins for cellular export" }
                    ],
                    process_stages: ["Membrane Transport", "Protein Translation", "ATP Synthesis"]
                },
                checkpoint: {
                    question_id: "bio-cp-1",
                    question: "Which organelle is recognized as the primary energy powerhouse of the cell?",
                    type: "mcq",
                    options: [
                        "A) Ribosome",
                        "B) Mitochondrion",
                        "C) Lysosome",
                        "D) Vacuole"
                    ],
                    correct_answer: "B) Mitochondrion",
                    hint: "It generates Adenosine Triphosphate (ATP) through the citric acid cycle and oxidative phosphorylation.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Ribosomes synthesize proteins, while mitochondria generate ATP energy." }
                    ]
                }
            },
            {
                id: 2,
                title: "Biomolecules & Cell Division",
                summary: "Carbohydrates, lipids, proteins, nucleic acids, and stages of Mitosis and Meiosis.",
                duration_sec: 140,
                visual_type: "diagram",
                visual_payload: {
                    organism_or_system: "Cell Cycle & Mitotic Phases",
                    labels: [
                        { name: "Prophase", desc: "Chromosomes condense, nuclear envelope breaks down" },
                        { name: "Metaphase", desc: "Chromosomes align along equatorial metaphase plate" },
                        { name: "Anaphase", desc: "Sister chromatids are pulled apart to opposite poles" },
                        { name: "Telophase", desc: "Nuclear membranes reform, leading to cytokinesis" }
                    ],
                    process_stages: ["Interphase (G1, S, G2)", "Mitosis (PMAT)", "Cytokinesis"]
                },
                checkpoint: {
                    question_id: "bio-cp-2",
                    question: "During which mitotic phase do chromosomes align along the center of the cell?",
                    type: "mcq",
                    options: [
                        "A) Prophase",
                        "B) Metaphase",
                        "C) Anaphase",
                        "D) Telophase"
                    ],
                    correct_answer: "B) Metaphase",
                    hint: "M for Metaphase = Middle alignment.",
                    common_misconceptions: [
                        { answer: "C", misconception: "In Anaphase, chromatids move Apart; in Metaphase, they align in the Middle." }
                    ]
                }
            },
            {
                id: 3,
                title: "Plant Structure & Plant Physiology",
                summary: "Photosynthesis (light reactions & Calvin cycle), xylem/phloem vascular transport, and transpiration.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Plant Physiology & Photosynthetic Pathways",
                    bullet_points: [
                        "Light-Dependent Reactions: Occur in thylakoid membranes, generating ATP and NADPH from sunlight and water.",
                        "Calvin Cycle (Light-Independent): Fixes CO2 into glucose using RuBisCO in the chloroplast stroma.",
                        "Vascular Transport: Xylem transports water/minerals upward via transpirational pull; Phloem translocates sugars bidirectionally."
                    ],
                    highlight: "Photosynthesis converts solar photons into chemical bond energy, providing the foundation for terrestrial trophic webs."
                },
                checkpoint: {
                    question_id: "bio-cp-3",
                    question: "Which plant vascular tissue is primarily responsible for transporting water from roots to leaves?",
                    type: "mcq",
                    options: [
                        "A) Phloem",
                        "B) Xylem",
                        "C) Stomata",
                        "D) Cambium"
                    ],
                    correct_answer: "B) Xylem",
                    hint: "Remember 'Xylem for water, Phloem for food'.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Phloem transports synthesized sugars, while Xylem conducts water and inorganic ions." }
                    ]
                }
            },
            {
                id: 4,
                title: "Human Anatomy & Physiology",
                summary: "Circulatory, nervous, endocrine, digestive, and immune systems homeostasis.",
                duration_sec: 160,
                visual_type: "diagram",
                visual_payload: {
                    organism_or_system: "Human Cardiovascular & Respiratory Homeostasis",
                    labels: [
                        { name: "Heart (4 Chambers)", desc: "Double-loop circulation pumping deoxygenated blood to lungs and oxygenated to body" },
                        { name: "Alveoli", desc: "Microscopic lung sacs with high surface area for rapid O2/CO2 gas diffusion" },
                        { name: "Nephron (Kidney)", desc: "Filters blood plasma and maintains systemic osmotic balance" }
                    ],
                    process_stages: ["Inhalation", "Alveolar Gas Exchange", "Systemic Arterial Perfusion", "Cellular Respiration"]
                },
                checkpoint: {
                    question_id: "bio-cp-4",
                    question: "Which blood vessels carry oxygenated blood away from the heart to systemic body tissues?",
                    type: "mcq",
                    options: [
                        "A) Veins",
                        "B) Arteries",
                        "C) Capillaries",
                        "D) Lymphatics"
                    ],
                    correct_answer: "B) Arteries",
                    hint: "Arteries carry blood Away from the heart.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Veins return blood back toward the heart; arteries carry blood away." }
                    ]
                }
            },
            {
                id: 5,
                title: "Genetics, Evolution & Ecology",
                summary: "Mendelian inheritance, DNA replication, natural selection, speciation, and trophic energy flow.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Evolutionary Synthesis & Ecosystem Dynamics",
                    bullet_points: [
                        "DNA Structure: Double helix with complementary base pairing (A-T, G-C).",
                        "Natural Selection: Differential reproductive success driven by inherited phenotypic variations.",
                        "Trophic Efficiency: Only roughly 10% of energy transfers from one trophic level to the next (Lindeman's efficiency)."
                    ],
                    highlight: "Nothing in biology makes sense except in the light of evolution — connecting genes, organisms, and ecosystems."
                },
                checkpoint: {
                    question_id: "bio-cp-5",
                    question: "According to the central dogma of molecular biology, what is the flow of genetic information?",
                    type: "mcq",
                    options: [
                        "A) Protein → RNA → DNA",
                        "B) DNA → RNA → Protein",
                        "C) RNA → DNA → Protein",
                        "D) DNA → Protein → Carbohydrate"
                    ],
                    correct_answer: "B) DNA → RNA → Protein",
                    hint: "Transcription creates mRNA from DNA, followed by translation into amino acid polypeptides.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Information does not reverse from proteins back into nucleic acids under normal cellular dogma." }
                    ]
                }
            }
        ]
    },
    {
        id: "chemistry",
        name: "Chemistry",
        icon: "🧪",
        category: "chemistry",
        badge: "Atomic Bonds, Thermodynamics & Organic Reactions",
        description: "Examine matter at molecular scales: atomic structure, ionic and covalent bonds, reaction kinetics, and carbon chemistry.",
        chapters: [
            {
                id: 1,
                title: "Basic Concepts of Chemistry",
                summary: "The mole concept, stoichiometry, balancing chemical equations, and percentage composition.",
                duration_sec: 120,
                visual_type: "formula",
                visual_payload: {
                    title: "The Mole Concept & Avogadro's Constant",
                    formula_latex: "n = \\frac{m}{M} = \\frac{N}{N_A}, \\quad N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}",
                    step_by_step: [
                        "1 mole equals exactly Avogadro's number of atoms or molecules.",
                        "Molar mass (M) links macroscopic grams to microscopic moles.",
                        "Stoichiometric coefficients define the exact molar ratios of reactants to products."
                    ],
                    key_takeaway: "The mole is the bridge between countable atoms and measurable laboratory masses."
                },
                checkpoint: {
                    question_id: "ch-cp-1",
                    question: "How many particles are contained in 1 mole of any substance?",
                    type: "mcq",
                    options: [
                        "A) 3.1415 × 10²³",
                        "B) 6.022 × 10²³",
                        "C) 9.81 × 10²²",
                        "D) 1.602 × 10⁻¹⁹"
                    ],
                    correct_answer: "B) 6.022 × 10²³",
                    hint: "This fundamental constant is named after Amedeo Avogadro.",
                    common_misconceptions: [
                        { answer: "D", misconception: "1.602 × 10⁻¹⁹ C is the elementary charge of an electron, not Avogadro's constant." }
                    ]
                }
            },
            {
                id: 2,
                title: "Atomic Structure & Periodic Table",
                summary: "Quantum mechanical model, orbitals (s, p, d, f), Pauli exclusion, Hund's rule, and periodic trends.",
                duration_sec: 140,
                visual_type: "diagram",
                visual_payload: {
                    organism_or_system: "Atomic Orbitals & Periodic Trends",
                    labels: [
                        { name: "Atomic Radius", desc: "Decreases left-to-right across a period due to increasing effective nuclear charge Z_eff" },
                        { name: "Ionization Energy", desc: "Increases across periods as electrons are held tighter by protons" },
                        { name: "Electronegativity", desc: "Fluorine has the highest tendency to attract shared electron pairs" }
                    ],
                    process_stages: ["Aufbau Principle", "Pauli Exclusion Principle", "Hund's Rule of Maximum Multiplicity"]
                },
                checkpoint: {
                    question_id: "ch-cp-2",
                    question: "Which element has the highest electronegativity on the periodic table?",
                    type: "mcq",
                    options: [
                        "A) Oxygen",
                        "B) Chlorine",
                        "C) Fluorine",
                        "D) Francium"
                    ],
                    correct_answer: "C) Fluorine",
                    hint: "Located in group 17, period 2, it attracts electron density most greedily (Paul scale 3.98).",
                    common_misconceptions: [
                        { answer: "D", misconception: "Francium has the lowest electronegativity (most electropositive); Fluorine has the highest." }
                    ]
                }
            },
            {
                id: 3,
                title: "Chemical Bonding",
                summary: "Ionic lattices, covalent bonds, VSEPR molecular geometry, and intermolecular hydrogen bonding.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Chemical Bonding & VSEPR Molecular Geometry",
                    bullet_points: [
                        "Ionic Bonds: Electrostatic attraction between cations and anions formed by complete electron transfer.",
                        "Covalent Bonds: Shared valence electron pairs between non-metals.",
                        "VSEPR Theory: Electron pairs repel each other to maximize spatial separation (e.g. tetrahedral 109.5°, bent H2O 104.5°).",
                        "Hydrogen Bonding: Strong dipole-dipole attractions giving water anomalous high boiling point and surface tension."
                    ],
                    highlight: "Molecular geometry and intermolecular forces dictate boiling points, solubility, and biochemical reactivity."
                },
                checkpoint: {
                    question_id: "ch-cp-3",
                    question: "What is the molecular geometry of a water (H2O) molecule according to VSEPR theory?",
                    type: "mcq",
                    options: [
                        "A) Linear",
                        "B) Trigonal planar",
                        "C) Bent (angular)",
                        "D) Octahedral"
                    ],
                    correct_answer: "C) Bent (angular)",
                    hint: "Two lone pairs on the oxygen atom push the two bonding pairs closer together.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Although CO2 is linear, H2O has two unshared lone pairs that bend the H-O-H angle to ~104.5°." }
                    ]
                }
            },
            {
                id: 4,
                title: "States of Matter & Thermodynamics",
                summary: "Ideal gas law (PV = nRT), phase diagrams, enthalpy, entropy, and Gibbs free energy spontaneity.",
                duration_sec: 150,
                visual_type: "formula",
                visual_payload: {
                    title: "Gibbs Free Energy & Reaction Spontaneity",
                    formula_latex: "\\Delta G = \\Delta H - T \\Delta S, \\quad PV = nRT",
                    step_by_step: [
                        "Enthalpy change (ΔH): Heat absorbed (endothermic > 0) or released (exothermic < 0).",
                        "Entropy change (ΔS): Degree of molecular disorder and energetic dispersal.",
                        "Spontaneous Criterion: When ΔG < 0, a reaction proceeds forward spontaneously at temperature T."
                    ],
                    key_takeaway: "Reactions strive toward minimum energy (negative ΔH) and maximum disorder (positive ΔS)."
                },
                checkpoint: {
                    question_id: "ch-cp-4",
                    question: "Under what condition is a chemical reaction guaranteed to be spontaneous at ALL temperatures?",
                    type: "mcq",
                    options: [
                        "A) Exothermic (ΔH < 0) and increasing entropy (ΔS > 0)",
                        "B) Endothermic (ΔH > 0) and decreasing entropy (ΔS < 0)",
                        "C) Exothermic (ΔH < 0) and decreasing entropy (ΔS < 0)",
                        "D) Only when temperature equals absolute zero"
                    ],
                    correct_answer: "A) Exothermic (ΔH < 0) and increasing entropy (ΔS > 0)",
                    hint: "In ΔG = ΔH - TΔS, if ΔH is negative and -TΔS is negative, ΔG is always negative.",
                    common_misconceptions: [
                        { answer: "B", misconception: "Positive ΔH and negative ΔS results in ΔG > 0, making it non-spontaneous at all temperatures." }
                    ]
                }
            },
            {
                id: 5,
                title: "Chemical Reactions, Acids-Bases & Organic Chemistry",
                summary: "pH scale, Le Chatelier's equilibrium, functional groups (alkanes, alcohols, acids), and reaction mechanisms.",
                duration_sec: 160,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Equilibrium, pH & Carbon Functional Groups",
                    bullet_points: [
                        "Acids & Bases: pH = -log10[H+]. Strong acids dissociate completely; buffers resist drastic pH swings.",
                        "Le Chatelier's Principle: When a system at equilibrium is stressed, it shifts to counteract the imposed change.",
                        "Organic Functional Groups: Alkanes (single bonds), Alkenes (C=C double bonds), Alcohols (-OH), Carboxylic Acids (-COOH)."
                    ],
                    highlight: "Carbon's unique ability to form 4 strong covalent bonds enables the immense complexity of organic molecules."
                },
                checkpoint: {
                    question_id: "ch-cp-5",
                    question: "What is the pH of a neutral aqueous solution at 25°C?",
                    type: "mcq",
                    options: [
                        "A) 0",
                        "B) 7",
                        "C) 14",
                        "D) 10"
                    ],
                    correct_answer: "B) 7",
                    hint: "At neutral pH, [H+] = [OH-] = 1.0 × 10⁻⁷ M.",
                    common_misconceptions: [
                        { answer: "A", misconception: "A pH of 0 represents an extremely strong acid; 7 represents neutrality." }
                    ]
                }
            }
        ]
    },
    {
        id: "computer_science",
        name: "Computer Science",
        icon: "💻",
        category: "computer_science",
        badge: "Computation, Algorithms, Systems & AI",
        description: "From binary logic gates, algorithm complexity (Big-O), databases, networking to machine learning fundamentals.",
        chapters: [
            {
                id: 1,
                title: "Introduction to Computer Science",
                summary: "Von Neumann architecture, binary representation, logic gates, and software layers.",
                duration_sec: 120,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Von Neumann Architecture & Binary Computation",
                    bullet_points: [
                        "Hardware Foundations: CPU (Control Unit + ALU), Memory (RAM), and Input/Output buses.",
                        "Binary Logic: Transistors act as switches representing bits (0 and 1); Boolean logic gates (AND, OR, NOT, XOR).",
                        "Hierarchy of Abstraction: Transistors → Logic Gates → Assembly → High-Level Code → Operating Systems."
                    ],
                    highlight: "Every modern computing system transforms high-level algorithmic abstractions into binary electrical states."
                },
                checkpoint: {
                    question_id: "cs-cp-1",
                    question: "What does the ALU (Arithmetic Logic Unit) inside a CPU do?",
                    type: "mcq",
                    options: [
                        "A) Stores persistent files on hard drives",
                        "B) Performs mathematical calculations and logical comparisons",
                        "C) Renders 3D graphics on the monitor",
                        "D) Connects the computer to the internet"
                    ],
                    correct_answer: "B) Performs mathematical calculations and logical comparisons",
                    hint: "ALU is the calculation engine inside the processor core.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Persistent storage is handled by storage drives; ALU performs immediate arithmetic/logic operations." }
                    ]
                }
            },
            {
                id: 2,
                title: "Programming Fundamentals & Algorithms",
                summary: "Control flow, recursion, Big-O time and space complexity, searching and sorting.",
                duration_sec: 140,
                visual_type: "code_sandbox",
                visual_payload: {
                    language: "python",
                    code: `# Binary Search Algorithm: O(log N) Efficiency\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    \n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid  # Target found\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nnumbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nindex = binary_search(numbers, 23)\nprint(f"Index of 23: {index}")`,
                    expected_output: "Index of 23: 5",
                    steps: [
                        { line: 3, explanation: "Binary search requires a sorted collection and cuts search space in half each cycle." },
                        { line: 6, explanation: "Comparing with middle element determines whether to discard left or right half." }
                    ]
                },
                checkpoint: {
                    question_id: "cs-cp-2",
                    question: "What is the average time complexity of Binary Search on an array of size N?",
                    type: "mcq",
                    options: [
                        "A) O(1)",
                        "B) O(log N)",
                        "C) O(N)",
                        "D) O(N²)"
                    ],
                    correct_answer: "B) O(log N)",
                    hint: "The problem size is halved with every single comparison step.",
                    common_misconceptions: [
                        { answer: "C", misconception: "Linear search is O(N); binary search cuts in half repeatedly, achieving O(log N)." }
                    ]
                }
            },
            {
                id: 3,
                title: "Data Structures",
                summary: "Arrays, Linked Lists, Stacks (LIFO), Queues (FIFO), Trees, and Hash Maps.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Core Data Structures & Algorithmic Tradeoffs",
                    bullet_points: [
                        "Arrays vs Linked Lists: Arrays allow O(1) random index access; Linked lists allow O(1) node insertions.",
                        "Stacks & Queues: Stacks follow LIFO (call stack, undo); Queues follow FIFO (print buffers, breadth-first search).",
                        "Hash Maps: Use cryptographic or polynomial hashing to deliver near O(1) average key lookup time.",
                        "Binary Search Trees: Hierarchical nodes maintaining sorted order for logarithmic lookups."
                    ],
                    highlight: "Picking the right data structure directly impacts software scalability, latency, and memory footprint."
                },
                checkpoint: {
                    question_id: "cs-cp-3",
                    question: "Which data structure operates on a Last-In, First-Out (LIFO) order?",
                    type: "mcq",
                    options: [
                        "A) Queue",
                        "B) Stack",
                        "C) Binary Heap",
                        "D) Hash Table"
                    ],
                    correct_answer: "B) Stack",
                    hint: "Think of a stack of dinner plates — the last plate placed on top is the first one removed.",
                    common_misconceptions: [
                        { answer: "A", misconception: "A queue operates on First-In, First-Out (FIFO), like a grocery checkout line." }
                    ]
                }
            },
            {
                id: 4,
                title: "Databases & Operating Systems",
                summary: "Relational SQL vs NoSQL, ACID transactions, process scheduling, virtual memory, and concurrency.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Operating Systems & Database Systems",
                    bullet_points: [
                        "Process vs Thread: Processes have isolated virtual address spaces; threads share parent process memory.",
                        "Virtual Memory & Paging: Translates virtual addresses to physical RAM frames, enabling memory protection.",
                        "ACID Transactions: Atomicity, Consistency, Isolation, and Durability ensure reliable database state mutations.",
                        "Relational Normalization: Eliminates redundant data anomalies via primary-foreign key integrity constraints."
                    ],
                    highlight: "Operating systems schedule physical hardware, while databases ensure data integrity at enterprise scale."
                },
                checkpoint: {
                    question_id: "cs-cp-4",
                    question: "In database theory, what does the 'A' in ACID transactions stand for?",
                    type: "mcq",
                    options: [
                        "A) Availability",
                        "B) Atomicity",
                        "C) Authentication",
                        "D) Asynchrony"
                    ],
                    correct_answer: "B) Atomicity",
                    hint: "The transaction is all-or-nothing: either all modifications succeed or none take effect.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Availability is part of the CAP theorem, not ACID database properties." }
                    ]
                }
            },
            {
                id: 5,
                title: "Computer Networks, Cybersecurity & AI",
                summary: "OSI 7-layer model, TCP/IP handshake, public-key cryptography, neural networks, and modern AI pipelines.",
                duration_sec: 160,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Networks, Cryptography & Artificial Intelligence",
                    bullet_points: [
                        "TCP/IP Stack: Application (HTTP/DNS), Transport (TCP 3-way handshake), Network (IP routing), Physical link.",
                        "Asymmetric Cryptography: RSA and Elliptic Curve rely on public key encryption and private key decryption.",
                        "Neural Networks & Deep Learning: Multi-layer perceptrons, matrix dot-products, backpropagation, and Transformer self-attention.",
                        "Cybersecurity Defense-in-Depth: Firewalls, zero-trust tokens, TLS 1.3 encryption, and principle of least privilege."
                    ],
                    highlight: "Modern computing connects distributed global networks with autonomous neural intelligence."
                },
                checkpoint: {
                    question_id: "cs-cp-5",
                    question: "Which transport protocol guarantees reliable, in-order packet delivery via acknowledgments?",
                    type: "mcq",
                    options: [
                        "A) UDP (User Datagram Protocol)",
                        "B) TCP (Transmission Control Protocol)",
                        "C) IP (Internet Protocol)",
                        "D) ARP (Address Resolution Protocol)"
                    ],
                    correct_answer: "B) TCP (Transmission Control Protocol)",
                    hint: "It uses sequence numbers, acknowledgments, and retransmissions for guaranteed reliability.",
                    common_misconceptions: [
                        { answer: "A", misconception: "UDP is connectionless and does not guarantee packet arrival order or delivery." }
                    ]
                }
            }
        ]
    },
    {
        id: "history",
        name: "History",
        icon: "🏛️",
        category: "history",
        badge: "Civilizations, Revolutions & Modern Eras",
        description: "Trace human societal evolution from ancient river valleys, empires, renaissance, world wars to globalization.",
        chapters: [
            {
                id: 1,
                title: "Ancient Civilizations",
                summary: "Mesopotamia, Ancient Egypt, Indus Valley Civilization, early writing systems, and legal codes.",
                duration_sec: 130,
                visual_type: "timeline",
                visual_payload: {
                    events: [
                        { year_or_era: "c. 3500 BCE", title: "Mesopotamian City-States", description: "Invention of Cuneiform writing, irrigation, and Code of Ur-Nammu." },
                        { year_or_era: "c. 3100 BCE", title: "Unification of Egypt", description: "Early Dynastic period, hieroglyphics, monumental architecture along the Nile." },
                        { year_or_era: "c. 2500 BCE", title: "Indus Valley (Harappan)", description: "Grid-planned cities (Mohenjo-daro), standardized weights, and advanced urban sanitation." },
                        { year_or_era: "c. 1750 BCE", title: "Code of Hammurabi", description: "One of the earliest codified legal doctrines based on lex talionis." }
                    ]
                },
                checkpoint: {
                    question_id: "hi-cp-1",
                    question: "Which ancient civilization developed the world's earliest known urban sanitation and grid-planned cities?",
                    type: "mcq",
                    options: [
                        "A) Roman Empire",
                        "B) Indus Valley Civilization",
                        "C) Incan Empire",
                        "D) Athenian Democracy"
                    ],
                    correct_answer: "B) Indus Valley Civilization",
                    hint: "Cities like Harappa and Mohenjo-daro had covered drains and standardized brick dimensions.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The Romans built famous aqueducts much later (c. 300 BCE); Indus Valley pioneered urban sewage c. 2500 BCE." }
                    ]
                }
            },
            {
                id: 2,
                title: "Medieval Kingdoms & Empires",
                summary: "The Byzantine Empire, Islamic Golden Age, feudalism in Europe, Tang/Song Dynasties, and Silk Road trade.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Medieval Empires & Transcontinental Exchange",
                    bullet_points: [
                        "Byzantine Continuity: Justinian Code preserved Roman jurisprudence; Constantinople commanded global trade routes.",
                        "Islamic Golden Age (8th-14th century): House of Wisdom in Baghdad led advancements in algebra, optics, astronomy, and medicine.",
                        "Feudal System: Manorial economy structured around land tenure, chivalry, and decentralized feudal obligations.",
                        "Silk Road & Maritime Trade: Transferred silk, paper, gunpowder, and mathematical ideas between East Asia, India, and the Mediterranean."
                    ],
                    highlight: "The medieval era fostered global trade networks and scientific cross-pollination that seeded the modern world."
                },
                checkpoint: {
                    question_id: "hi-cp-2",
                    question: "During the Islamic Golden Age, which famous center of scholarship in Baghdad translated and expanded classical knowledge?",
                    type: "mcq",
                    options: [
                        "A) Library of Alexandria",
                        "B) The House of Wisdom (Bayt al-Hikma)",
                        "C) The Colosseum",
                        "D) Academy of Athens"
                    ],
                    correct_answer: "B) The House of Wisdom (Bayt al-Hikma)",
                    hint: "Founded under Caliph Harun al-Rashid, it catalyzed advances in science, medicine, and mathematics.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The Library of Alexandria was an ancient Hellenistic institution in Ptolemaic Egypt." }
                    ]
                }
            },
            {
                id: 3,
                title: "The Age of Exploration & Renaissance",
                summary: "Humanism, printing press revolution, maritime navigation voyages, and scientific revolution breakthroughs.",
                duration_sec: 140,
                visual_type: "timeline",
                visual_payload: {
                    events: [
                        { year_or_era: "c. 1440 CE", title: "Gutenberg Printing Press", description: "Movable type democratized literacy, sparking the rapid spread of scientific and political ideas." },
                        { year_or_era: "1492 CE", title: "Columbian Exchange", description: "Transatlantic exchange of crops, populations, cultures, and pathogens between hemispheres." },
                        { year_or_era: "1543 CE", title: "Copernican Revolution", description: "Heliocentric model replaced Ptolemaic geocentrism, initiating the Scientific Revolution." }
                    ]
                },
                checkpoint: {
                    question_id: "hi-cp-3",
                    question: "What major technological invention in the 1440s revolutionized literacy and spread knowledge across Europe?",
                    type: "mcq",
                    options: [
                        "A) Steam engine",
                        "B) Movable-type printing press",
                        "C) Magnetic compass",
                        "D) Telegraph"
                    ],
                    correct_answer: "B) Movable-type printing press",
                    hint: "Johannes Gutenberg's printing press made books widely accessible.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The commercial steam engine was developed much later during the 18th-century Industrial Revolution." }
                    ]
                }
            },
            {
                id: 4,
                title: "Colonialism & Independence Movements",
                summary: "Imperial expansion, mercantilism, the Atlantic slave trade, American/French Revolutions, and anti-colonial movements.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Colonial Hegemony & Revolutionary Ideals",
                    bullet_points: [
                        "Mercantilism & Exploitation: Colonies served as captive resource suppliers and consumers for European metropolitan powers.",
                        "Enlightenment Philosophies: Locke, Rousseau, and Montesquieu challenged divine right, inspiring constitutional republics.",
                        "Waves of Revolution: American (1776), French (1789), Haitian (1791) — the first successful slave-led republic.",
                        "Decolonization Movements: Armed resistance and civil disobedience across Asia and Africa in the 19th and 20th centuries."
                    ],
                    highlight: "Enlightenment ideals of sovereignty and natural rights challenged imperial domination worldwide."
                },
                checkpoint: {
                    question_id: "hi-cp-4",
                    question: "Which revolution was the only successful revolt by enslaved people in history that established an independent state in 1804?",
                    type: "mcq",
                    options: [
                        "A) American Revolution",
                        "B) Haitian Revolution",
                        "C) Russian Revolution",
                        "D) Glorious Revolution"
                    ],
                    correct_answer: "B) Haitian Revolution",
                    hint: "Led by Toussaint Louverture against French colonial rule.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The American Revolution did not abolish slavery; the Haitian Revolution was specifically led by enslaved people." }
                    ]
                }
            },
            {
                id: 5,
                title: "World Wars & Modern History",
                summary: "World War I, the Great Depression, World War II, the Cold War, and the contemporary digital information era.",
                duration_sec: 160,
                visual_type: "timeline",
                visual_payload: {
                    events: [
                        { year_or_era: "1914 - 1918", title: "World War I", description: "Industrial warfare, trench warfare, and the collapse of the Ottoman, Austro-Hungarian, and Russian empires." },
                        { year_or_era: "1939 - 1945", title: "World War II", description: "Global conflict against Fascism, the Holocaust, atomic weapons, and the founding of the United Nations." },
                        { year_or_era: "1947 - 1991", title: "The Cold War", description: "Bipolar geopolitical tension between the US and USSR, space race, and nuclear deterrence." },
                        { year_or_era: "1991 - Present", title: "Information Age & Globalization", description: "Internet expansion, geopolitical multipolarity, and global climate governance." }
                    ]
                },
                checkpoint: {
                    question_id: "hi-cp-5",
                    question: "Which international diplomatic organization was founded in 1945 to maintain international peace and security after WWII?",
                    type: "mcq",
                    options: [
                        "A) League of Nations",
                        "B) United Nations (UN)",
                        "C) European Union",
                        "D) North Atlantic Treaty Organization"
                    ],
                    correct_answer: "B) United Nations (UN)",
                    hint: "Charter was signed in San Francisco in 1945 replacing the defunct League of Nations.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The League of Nations was formed after WWI in 1919 and collapsed before WWII." }
                    ]
                }
            }
        ]
    },
    {
        id: "geography",
        name: "Geography",
        icon: "🌍",
        category: "geography",
        badge: "Earth Systems, Geopolitics & Climatology",
        description: "Study dynamic Earth systems: plate tectonics, landforms, meteorological patterns, human demographics, and resource sustainability.",
        chapters: [
            {
                id: 1,
                title: "Earth, Maps & Geographic Coordinates",
                summary: "Latitude, longitude, GPS triangulation, map projections (Mercator vs Peters), and GIS spatial analysis.",
                duration_sec: 120,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Coordinate Systems, Grids & Map Projections",
                    bullet_points: [
                        "Parallels of Latitude: Measure angular distance north or south from the Equator (0° to 90° N/S).",
                        "Meridians of Longitude: Measure east or west from the Prime Meridian in Greenwich, London (0° to 180° E/W).",
                        "Map Projections: Flattening a 3D geoid onto 2D paper inevitably distorts shape, area, distance, or direction.",
                        "GIS (Geographic Information Systems): Multi-layer spatial analysis uniting remote sensing satellite telemetry with demographic data."
                    ],
                    highlight: "Coordinates enable precise planetary navigation, while projection choices reflect cartographic tradeoffs."
                },
                checkpoint: {
                    question_id: "geo-cp-1",
                    question: "What line of longitude is designated as the international Prime Meridian (0° Longitude)?",
                    type: "mcq",
                    options: [
                        "A) The Equator",
                        "B) The Greenwich Meridian",
                        "C) The International Date Line",
                        "D) The Tropic of Cancer"
                    ],
                    correct_answer: "B) The Greenwich Meridian",
                    hint: "It passes through the Royal Observatory in London, England.",
                    common_misconceptions: [
                        { answer: "A", misconception: "The Equator is 0° Latitude, not Longitude." }
                    ]
                }
            },
            {
                id: 2,
                title: "Landforms, Rocks & Natural Processes",
                summary: "Plate tectonics (convergent, divergent, transform), the rock cycle (igneous, sedimentary, metamorphic), and fluvial erosion.",
                duration_sec: 140,
                visual_type: "diagram",
                visual_payload: {
                    organism_or_system: "Tectonic Plate Boundaries & Geomorphology",
                    labels: [
                        { name: "Convergent Boundary", desc: "Plates collide, causing subduction trenches and volcanic mountain ranges (e.g. Himalayas, Andes)" },
                        { name: "Divergent Boundary", desc: "Plates pull apart, forming mid-ocean ridges and continental rift valleys" },
                        { name: "Transform Fault", desc: "Plates slide horizontally past one another, generating high seismic friction (e.g. San Andreas)" }
                    ],
                    process_stages: ["Mantle Convection", "Lithospheric Subduction", "Magmatic Intrusion", "Erosional Weathering"]
                },
                checkpoint: {
                    question_id: "geo-cp-2",
                    question: "What geological process is primarily responsible for the continuous uplift of the Himalayan mountain range?",
                    type: "mcq",
                    options: [
                        "A) Glacial deposition",
                        "B) Continental-continental convergent plate collision",
                        "C) Divergent sea-floor spreading",
                        "D) Fluvial delta formation"
                    ],
                    correct_answer: "B) Continental-continental convergent plate collision",
                    hint: "The Indian Plate collides with the Eurasian Plate, crumpling the continental crust.",
                    common_misconceptions: [
                        { answer: "C", misconception: "Divergent boundaries pull apart; the Himalayas are formed by massive convergent plate collisions." }
                    ]
                }
            },
            {
                id: 3,
                title: "Climate, Weather & Water Resources",
                summary: "Atmospheric circulation, Coriolis effect, ocean conveyor currents (thermohaline), hydrologic cycle, and climatic zones.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Atmospheric Circulation & Oceanic Heat Transfer",
                    bullet_points: [
                        "Hadley, Ferrel & Polar Cells: Drive global wind belts (Trade Winds, Westerlies) via differential solar insolation.",
                        "Coriolis Effect: Earth's rotation deflects moving winds rightward in Northern Hemisphere, leftward in Southern Hemisphere.",
                        "Thermohaline Circulation: The global ocean conveyor belt circulating heat, salinity, and nutrients across continents.",
                        "Watershed Hydrology: Precipitation, groundwater aquifer infiltration, evapotranspiration, and surface runoff equilibrium."
                    ],
                    highlight: "The atmosphere and oceans act as a coupled thermodynamic heat engine redistributing solar energy."
                },
                checkpoint: {
                    question_id: "geo-cp-3",
                    question: "Why do prevailing winds curve rather than travel in a direct straight line between high and low pressure?",
                    type: "mcq",
                    options: [
                        "A) Gravity from the Moon",
                        "B) Earth's rotational Coriolis effect",
                        "C) Ocean tidal friction",
                        "D) Cloud reflectivity"
                    ],
                    correct_answer: "B) Earth's rotational Coriolis effect",
                    hint: "Because Earth rotates beneath the moving air mass.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Lunar gravity drives oceanic tides, but wind deflection is caused by Earth's planetary rotation." }
                    ]
                }
            },
            {
                id: 4,
                title: "Population, Agriculture & Human Geography",
                summary: "Demographic transition model, urban migration patterns, green revolution, and agricultural land use models (von Thünen).",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Demographic Transition & Global Urbanization",
                    bullet_points: [
                        "Demographic Transition Model (DTM): 5 stages tracking crude birth/death rates as nations industrialize.",
                        "Population Pyramids: Reveal age-sex cohorts, dependency ratios, and future workforce expansions or contractions.",
                        "Urbanization & Megacities: Rural-to-urban push-pull factors transforming spatial agglomeration economies.",
                        "Agricultural Typologies: Subsistence farming vs intensive mechanized monoculture and crop rotation."
                    ],
                    highlight: "Human geography examines how human cultures modify landscapes and how geographic constraints shape human society."
                },
                checkpoint: {
                    question_id: "geo-cp-4",
                    question: "In Stage 2 of the Demographic Transition Model, what typically causes rapid population expansion?",
                    type: "mcq",
                    options: [
                        "A) Birth rates skyrocket dramatically",
                        "B) Death rates drop sharply due to sanitation and medicine while birth rates remain high",
                        "C) Massive international immigration",
                        "D) Life expectancy decreases"
                    ],
                    correct_answer: "B) Death rates drop sharply due to sanitation and medicine while birth rates remain high",
                    hint: "Public health improvements drastically reduce infant mortality before social family size norms decrease.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Birth rates usually stay roughly steady; the population boom is driven by plummeting death rates." }
                    ]
                }
            },
            {
                id: 5,
                title: "Natural Resources, Industries & Environmental Issues",
                summary: "Fossil vs renewable energy, industrial location theory, deforestation, climate change feedback loops, and sustainability.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Resource Sustainability & Environmental Governance",
                    bullet_points: [
                        "Energy Transitions: Decarbonization from coal/petroleum to solar, wind, geothermal, and nuclear baseloads.",
                        "Weber's Least Cost Theory: Industrial plants optimize proximity to raw material sources vs consumer markets.",
                        "Anthropogenic Climate Feedback: Arctic ice albedo loss, permafrost methane release, and ocean acidification.",
                        "Circular Economy Principles: Transitioning from linear 'take-make-waste' to regenerative closed-loop recycling."
                    ],
                    highlight: "Sustainable development balances ecological planetary boundaries with equitable human prosperity."
                },
                checkpoint: {
                    question_id: "geo-cp-5",
                    question: "What term describes the phenomenon where melting polar sea ice decreases surface reflectivity, accelerating further warming?",
                    type: "mcq",
                    options: [
                        "A) Thermal inversion",
                        "B) Positive ice-albedo feedback loop",
                        "C) The rain shadow effect",
                        "D) Ozone depletion"
                    ],
                    correct_answer: "B) Positive ice-albedo feedback loop",
                    hint: "Dark ocean water absorbs more solar radiation than reflective white ice, amplifying warming.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Thermal inversion is a localized weather condition trapping pollution under warm air layers." }
                    ]
                }
            }
        ]
    },
    {
        id: "english_literature",
        name: "English Literature",
        icon: "📖",
        category: "english",
        badge: "Rhetoric, Poetics, Shakespeare & Narrative Arc",
        description: "Analyze classic prose, poetic meter, dramatic tragedy, Shakespearean soliloquies, and critical narrative lenses.",
        chapters: [
            {
                id: 1,
                title: "Introduction to Literature & Literary Genres",
                summary: "Canon definition, fiction vs non-fiction, epics, lyric poetry, dramatic conventions, and theme exploration.",
                duration_sec: 120,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Literary Genres & The Anatomy of Narrative",
                    bullet_points: [
                        "Core Genres: Prose Fiction (Novels, Novellas), Poetry (Lyric, Narrative, Dramatic), Drama (Tragedy, Comedy).",
                        "Narrative Perspective: First-person (subjective, unreliable narrator) vs Third-person omniscient.",
                        "Theme vs Subject: The subject is what the text is about; the theme is the profound truth or critique the author asserts.",
                        "Freytag's Pyramid: Exposition → Inciting Incident → Rising Action → Climax → Falling Action → Denouement."
                    ],
                    highlight: "Great literature holds a mirror up to the human condition, questioning morality, power, and identity."
                },
                checkpoint: {
                    question_id: "lit-cp-1",
                    question: "What is the key difference between the 'topic' and the 'theme' of a literary work?",
                    type: "mcq",
                    options: [
                        "A) Topic is the length of the book; theme is the title",
                        "B) Topic is the general subject matter; theme is the deeper insight or statement the author expresses",
                        "C) Topic is written in rhyme; theme is written in prose",
                        "D) There is no difference between topic and theme"
                    ],
                    correct_answer: "B) Topic is the general subject matter; theme is the deeper insight or statement the author expresses",
                    hint: "Topic can be 'War'; Theme can be 'War exposes the fragility of human innocence'.",
                    common_misconceptions: [
                        { answer: "D", misconception: "A topic is merely the subject (e.g. love), whereas the theme is an argument about that subject." }
                    ]
                }
            },
            {
                id: 2,
                title: "Poetry & Poetic Devices",
                summary: "Meter and scansion (iambic pentameter), stanzaic forms (sonnets, haiku), metaphor, symbolism, and alliteration.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Poetic Craft: Rhythm, Figurative Language & Sound",
                    bullet_points: [
                        "Meter & Foot: Iambic Pentameter consists of five metric feet of unstressed followed by stressed syllables (da-DUM × 5).",
                        "Figurative Tropes: Metaphor (direct equation), Simile (using like/as), Personification, and Synecdoche.",
                        "Auditory Devices: Alliteration (consonant repetition), Assonance (vowel melody), and Onomatopoeia.",
                        "Sonnet Architectures: Petrarchan (Octave ABBAABBA + Sestet) vs Shakespearean (ABAB CDCD EFEF GG heroic couplet)."
                    ],
                    highlight: "Poetry is the synthesis of musical acoustic cadence with profound semantic compression."
                },
                checkpoint: {
                    question_id: "lit-cp-2",
                    question: "How many poetic lines and what concluding structure characterizes a Shakespearean (English) sonnet?",
                    type: "mcq",
                    options: [
                        "A) 12 lines ending in a triplet",
                        "B) 14 lines concluding with a rhyming couplet (GG)",
                        "C) 16 lines divided into four equal stanzas",
                        "D) 10 lines of unrhymed free verse"
                    ],
                    correct_answer: "B) 14 lines concluding with a rhyming couplet (GG)",
                    hint: "Three quatrains (ABAB CDCD EFEF) followed by a final Volta-resolved couplet (GG).",
                    common_misconceptions: [
                        { answer: "A", misconception: "All traditional sonnets consist of exactly 14 lines." }
                    ]
                }
            },
            {
                id: 3,
                title: "Short Stories & Prose",
                summary: "Concise characterization, symbolism, irony (verbal, situational, dramatic), and close reading strategies.",
                duration_sec: 140,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "The Art of the Short Story & Subtext",
                    bullet_points: [
                        "Poe's Single Effect: Every sentence in a short story must contribute toward a single unified psychological impression.",
                        "Modes of Irony: Situational (actions cause opposite of expected outcome), Dramatic (audience knows what character does not).",
                        "Subtext & The Iceberg Theory: Hemingway's principle that 7/8ths of emotional resonance lies beneath the surface text.",
                        "Characterization Techniques: Direct exposition vs indirect revelation through dialogue, actions, and interior monologue."
                    ],
                    highlight: "A short story achieves maximum aesthetic impact through deliberate economy and pregnant silences."
                },
                checkpoint: {
                    question_id: "lit-cp-3",
                    question: "What type of irony occurs when the reader or audience knows a crucial secret that the character remains unaware of?",
                    type: "mcq",
                    options: [
                        "A) Verbal irony",
                        "B) Dramatic irony",
                        "C) Socratic irony",
                        "D) Cosmic irony"
                    ],
                    correct_answer: "B) Dramatic irony",
                    hint: "Think of horror films or tragedy where you see the danger behind the door before the character enters.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Verbal irony is when a speaker states the opposite of what they mean (similar to sarcasm)." }
                    ]
                }
            },
            {
                id: 4,
                title: "Drama & Shakespeare",
                summary: "Aristotelian tragedy (hamartia, catharsis), Elizabethan stagecraft, soliloquies, and dramatic subplots.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Shakespearean Tragedy & Dramatic Conventions",
                    bullet_points: [
                        "Tragic Flaw (Hamartia): The protagonist's inherent flaw or misjudgment leading to inescapable downfall (e.g. Macbeth's ambition).",
                        "The Soliloquy: Spoken monologue where characters voice their raw interior thoughts directly to the audience.",
                        "Dramatic Foils: Characters contrasted against each other to highlight distinct traits (e.g. Hamlet vs Laertes).",
                        "Catharsis: The profound emotional release of pity and fear experienced by the audience at the tragedy's climax."
                    ],
                    highlight: "Shakespeare's dramatic theater blends colloquial humor, elevated blank verse, and philosophical introspection."
                },
                checkpoint: {
                    question_id: "lit-cp-4",
                    question: "In classical tragedy, what term describes the emotional purging and spiritual renewal felt by the audience?",
                    type: "mcq",
                    options: [
                        "A) Hamartia",
                        "B) Catharsis",
                        "C) Hubris",
                        "D) Anagnorisis"
                    ],
                    correct_answer: "B) Catharsis",
                    hint: "Aristotle coined this term in Poetics to describe the cleansing effect of tragedy.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Hamartia is the tragic mistake or flaw; Catharsis is the emotional cleansing experienced." }
                    ]
                }
            },
            {
                id: 5,
                title: "Novels, Literary Analysis & Critical Thinking",
                summary: "The rise of the novel, critical theoretical lenses (Marxist, Feminist, Post-colonial), and thesis-driven essays.",
                duration_sec: 160,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Critical Lenses & Deep Textual Exegesis",
                    bullet_points: [
                        "Marxist Criticism: Examines socioeconomic class tensions, commodity fetishism, and institutional power hierarchies.",
                        "Feminist & Gender Theory: Analyzes gender performance, patriarchal structures, and female agency in the narrative.",
                        "Post-Colonial Theory: Decodes cultural hegemony, the 'Other', imperial subjugation, and hybrid identity.",
                        "Formalism & Close Reading: Explores how syntax, diction, motifs, and structural choices construct organic meaning."
                    ],
                    highlight: "Literary criticism teaches not what to think, but how to interrogate ideological assumptions embedded in stories."
                },
                checkpoint: {
                    question_id: "lit-cp-5",
                    question: "Which critical lens primarily evaluates literature through the dynamics of social class, labor, and economic power structures?",
                    type: "mcq",
                    options: [
                        "A) Psychoanalytic criticism",
                        "B) Marxist criticism",
                        "C) Eco-criticism",
                        "D) Reader-response theory"
                    ],
                    correct_answer: "B) Marxist criticism",
                    hint: "Rooted in Karl Marx's analysis of material conditions and socioeconomic power.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Psychoanalytic criticism focuses on unconscious desires and Freudian/Jungian ego mechanisms." }
                    ]
                }
            }
        ]
    },
    {
        id: "economics",
        name: "Economics",
        icon: "💰",
        category: "economics",
        badge: "Markets, Fiscal Policies, Trade & Growth",
        description: "Analyze microeconomic decision-making, supply-demand curves, monetary policies, GDP metrics, and global trade dynamics.",
        chapters: [
            {
                id: 1,
                title: "Introduction to Economics & Basic Concepts",
                summary: "Scarcity, opportunity cost, Production Possibility Frontier (PPF), and rational economic decision-making.",
                duration_sec: 120,
                visual_type: "formula",
                visual_payload: {
                    title: "Opportunity Cost & Scarcity Principle",
                    formula_latex: "\\text{Opportunity Cost} = \\text{Return on Foregone Best Alternative} - \\text{Return on Chosen Option}",
                    step_by_step: [
                        "Fundamental Economic Problem: Unlimited human desires vs finite scarce resources.",
                        "Every economic choice forfeits the next most valuable alternative.",
                        "Production Possibility Frontier (PPF) illustrates maximum output combinations under given technology."
                    ],
                    key_takeaway: "There is no such thing as a free lunch; every action carries an implicit opportunity cost."
                },
                checkpoint: {
                    question_id: "ec-cp-1",
                    question: "What is the economic definition of 'Opportunity Cost'?",
                    type: "mcq",
                    options: [
                        "A) The monetary price paid on a store receipt",
                        "B) The value of the next best alternative given up when making a choice",
                        "C) The total tax paid to the government",
                        "D) The cost of hiring additional employees"
                    ],
                    correct_answer: "B) The value of the next best alternative given up when making a choice",
                    hint: "It represents what you could have done instead with your limited time or resources.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Monetary expense is accounting cost; opportunity cost includes the value of foregone opportunities." }
                    ]
                }
            },
            {
                id: 2,
                title: "Demand, Supply & Market Equilibrium",
                summary: "Law of demand/supply, shifts vs movements along curves, elasticity, and price equilibrium.",
                duration_sec: 140,
                visual_type: "formula",
                visual_payload: {
                    title: "Price Elasticity of Demand (PED)",
                    formula_latex: "E_d = \\frac{\\% \\Delta Q_d}{\\% \\Delta P} = \\frac{\\Delta Q / Q}{\\Delta P / P}, \\quad Q_s(P^*) = Q_d(P^*)",
                    step_by_step: [
                        "Law of Demand: Price and quantity demanded share an inverse relationship (ceteris paribus).",
                        "Market Equilibrium: Point where quantity supplied equals quantity demanded, clearing the market.",
                        "Elasticity (|Ed| > 1): Highly responsive to price changes; Inelastic (|Ed| < 1): Necessities with few substitutes."
                    ],
                    key_takeaway: "Market prices function as an information signaling mechanism coordinating decentralized producers and buyers."
                },
                checkpoint: {
                    question_id: "ec-cp-2",
                    question: "If consumer income increases and demand for a good decreases, what kind of good is it?",
                    type: "mcq",
                    options: [
                        "A) Normal good",
                        "B) Inferior good",
                        "C) Complementary good",
                        "D) Luxury good"
                    ],
                    correct_answer: "B) Inferior good",
                    hint: "Consumers substitute toward higher-quality alternatives as their purchasing power expands.",
                    common_misconceptions: [
                        { answer: "A", misconception: "For normal goods, demand rises when income rises; inferior goods experience falling demand." }
                    ]
                }
            },
            {
                id: 3,
                title: "Production, Costs & Market Structures",
                summary: "Short-run vs long-run costs, perfect competition, monopolistic competition, oligopoly, and monopoly deadweight loss.",
                duration_sec: 150,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Cost Curves & Market Structure Spectrum",
                    bullet_points: [
                        "Marginal Cost = Marginal Revenue (MC = MR): The universal profit-maximization rule for all firms.",
                        "Perfect Competition: Many price-taking firms selling identical goods; long-run economic profits equal zero.",
                        "Monopoly: Single firm with high barriers to entry setting prices, resulting in consumer surplus deadweight loss.",
                        "Oligopoly & Game Theory: Few dominant firms whose strategies depend on rival moves (Nash Equilibrium / Prisoner's Dilemma)."
                    ],
                    highlight: "Competitive markets maximize productive and allocative efficiency, whereas monopolies capture excess economic rents."
                },
                checkpoint: {
                    question_id: "ec-cp-3",
                    question: "At what point do profit-maximizing firms in all market structures produce?",
                    type: "mcq",
                    options: [
                        "A) Where Total Revenue equals Total Cost",
                        "B) Where Marginal Revenue equals Marginal Cost (MR = MC)",
                        "C) Where price is at the highest possible ceiling",
                        "D) Where average fixed cost reaches zero"
                    ],
                    correct_answer: "B) Where Marginal Revenue equals Marginal Cost (MR = MC)",
                    hint: "If MR > MC, producing one more unit adds to profit; if MR < MC, it subtracts from profit.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Where TR = TC, economic profit is zero (breakeven), which is not the maximum profit point." }
                    ]
                }
            },
            {
                id: 4,
                title: "Money, Banking & National Income",
                summary: "GDP calculations (Expenditure: C + I + G + NX), fractional reserve banking, money multiplier, and Central Bank policies.",
                duration_sec: 150,
                visual_type: "formula",
                visual_payload: {
                    title: "Macroeconomic National Income Identity",
                    formula_latex: "Y = C + I + G + (X - M), \\quad M = m \\times B = \\frac{1}{\\text{RR}} \\times B",
                    step_by_step: [
                        "GDP (Y): Consumption (C) + Investment (I) + Government spending (G) + Net Exports (X - M).",
                        "Fractional Reserve Banking: Commercial banks hold reserve fraction RR and lend the remainder.",
                        "Money Multiplier (1 / RR): Explains how initial central bank reserves expand total broad money supply."
                    ],
                    key_takeaway: "GDP measures the total monetary value of finished goods and services produced within a nation's borders."
                },
                checkpoint: {
                    question_id: "ec-cp-4",
                    question: "Which component of GDP represents spending by households on durable and non-durable goods?",
                    type: "mcq",
                    options: [
                        "A) Gross Private Investment (I)",
                        "B) Personal Consumption Expenditures (C)",
                        "C) Government Purchases (G)",
                        "D) Net Exports (NX)"
                    ],
                    correct_answer: "B) Personal Consumption Expenditures (C)",
                    hint: "Consumption accounts for the largest fraction (~60-70%) of GDP in most modern economies.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Investment refers to business capital purchases, equipment, and residential construction." }
                    ]
                }
            },
            {
                id: 5,
                title: "Inflation, Unemployment, International Trade & Economic Growth",
                summary: "CPI inflation, natural rate of unemployment, Phillips curve, comparative advantage, tariffs, and exchange rates.",
                duration_sec: 160,
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Macroeconomic Stability & Comparative Advantage",
                    bullet_points: [
                        "Inflation & Purchasing Power: Measured via Consumer Price Index (CPI); hyperinflation erodes currency credibility.",
                        "Unemployment Typologies: Frictional (job transitions), Structural (skill mismatches), and Cyclical (recession downturns).",
                        "Comparative Advantage: Nations gain from trade by specializing where opportunity cost is lowest, expanding total consumption.",
                        "Monetary & Fiscal Levers: Central banks adjust interest rates, while treasury ministries deploy fiscal stimuli."
                    ],
                    highlight: "Long-term living standards are fundamentally driven by labor productivity growth and sound institutional governance."
                },
                checkpoint: {
                    question_id: "ec-cp-5",
                    question: "According to David Ricardo's theory of trade, why should a nation trade even if another nation produces everything more efficiently?",
                    type: "mcq",
                    options: [
                        "A) To establish geopolitical military alliances",
                        "B) Because trade benefits parties based on Comparative Advantage (lower opportunity cost)",
                        "C) To collect import tariff taxes",
                        "D) Only as a charitable humanitarian policy"
                    ],
                    correct_answer: "B) Because trade benefits parties based on Comparative Advantage (lower opportunity cost)",
                    hint: "Specialization in what you produce at lowest opportunity cost expands the global production possibilities.",
                    common_misconceptions: [
                        { answer: "A", misconception: "Ricardo proved mathematically that mutually beneficial trade depends on relative opportunity costs, not absolute advantages." }
                    ]
                }
            }
        ]
    }
];

// Helper functions for easy consumption across components
export function getAllCurricula() {
    return MASTER_CURRICULUM;
}

export function getCurriculumBySubject(subjectName) {
    if (!subjectName) return MASTER_CURRICULUM[0];
    const clean = subjectName.toLowerCase();
    return (
        MASTER_CURRICULUM.find(s => 
            s.name.toLowerCase() === clean ||
            s.id.toLowerCase() === clean ||
            clean.includes(s.name.toLowerCase()) ||
            clean.includes(s.id.toLowerCase())
        ) || MASTER_CURRICULUM[0]
    );
}

export function findSubjectAndChapter(topicName) {
    if (!topicName) return { subject: MASTER_CURRICULUM[0], chapter: MASTER_CURRICULUM[0].chapters[0] };
    const clean = topicName.toLowerCase();

    // Check direct chapter match
    for (const sub of MASTER_CURRICULUM) {
        for (const ch of sub.chapters) {
            if (ch.title.toLowerCase() === clean || clean.includes(ch.title.toLowerCase())) {
                return { subject: sub, chapter: ch };
            }
        }
    }

    // Check subject match
    for (const sub of MASTER_CURRICULUM) {
        if (sub.name.toLowerCase() === clean || clean.includes(sub.name.toLowerCase()) || clean.includes(sub.id.toLowerCase())) {
            return { subject: sub, chapter: sub.chapters[0] };
        }
    }

    return { subject: MASTER_CURRICULUM[0], chapter: MASTER_CURRICULUM[0].chapters[0] };
}

// Generate an offline / fallback rich video lesson object adhering strictly to the schema
export function buildCurriculumVideoLesson({
    topic,
    subject = "",
    level = "beginner",
    language = "English",
    persona = "lilly",
    time_minutes = 20
}) {
    const { subject: matchedSubject, chapter: matchedChapter } = findSubjectAndChapter(topic || subject);
    const chosenSubject = subject ? getCurriculumBySubject(subject) : matchedSubject;

    // Build the chapters for the video lesson
    // If a specific chapter was requested, we build an in-depth 4-chapter breakdown of that chapter!
    // If the entire subject was requested, we present all 5 chapters of that subject!
    const isExactChapter = chosenSubject.chapters.some(c => c.title.toLowerCase() === (topic || "").toLowerCase());

    let lessonChapters = [];

    if (isExactChapter) {
        // Deep-dive into this specific chapter across 4 progressive parts
        const targetCh = chosenSubject.chapters.find(c => c.title.toLowerCase() === topic.toLowerCase()) || matchedChapter;
        lessonChapters = [
            {
                id: 1,
                title: `${targetCh.title}: Foundations & Core Intuition`,
                duration_sec: 90,
                narration_script: `Welcome to our masterclass on ${targetCh.title}, part of our ${chosenSubject.name} curriculum. Today we are unlocking this vital concept step-by-step. ${targetCh.summary}`,
                avatar_emotion: "welcoming",
                visual_type: targetCh.visual_type,
                visual_payload: targetCh.visual_payload
            },
            {
                id: 2,
                title: `${targetCh.title}: Detailed Principles & Demonstration`,
                duration_sec: 120,
                narration_script: `Let's look deeper into the mechanics of ${targetCh.title}. Notice how the visual demonstration brings abstract theory directly into concrete reality. Focus on how each variable behaves.`,
                avatar_emotion: "demonstrating",
                visual_type: targetCh.visual_type,
                visual_payload: targetCh.visual_payload,
                checkpoint: targetCh.checkpoint
            },
            {
                id: 3,
                title: `${targetCh.title}: Practical Applications & Problem Solving`,
                duration_sec: 110,
                narration_script: `Now let's apply our knowledge of ${targetCh.title} to real-world challenges. When you see how this is applied in practical systems, everything clicks into place.`,
                avatar_emotion: "explaining",
                visual_type: "whiteboard",
                visual_payload: {
                    headline: `Applying ${targetCh.title}`,
                    bullet_points: [
                        "Analyze common scenarios and edge cases.",
                        "Avoid standard pitfalls and cognitive misconceptions.",
                        "Apply best practices to achieve reliable, predictable results."
                    ],
                    highlight: `Mastering ${targetCh.title} provides a permanent building block in your ${chosenSubject.name} journey.`
                }
            },
            {
                id: 4,
                title: `${targetCh.title}: Review, Synthesis & Next Steps`,
                duration_sec: 80,
                narration_script: `Outstanding focus! You've mastered the core intuition, working principles, and practical application of ${targetCh.title}. You are ready for the checkpoint assessment!`,
                avatar_emotion: "encouraging",
                visual_type: "whiteboard",
                visual_payload: {
                    headline: "Chapter Milestone Complete",
                    bullet_points: [
                        `Completed foundational deep dive into ${targetCh.title}.`,
                        "Passed live conceptual verification check.",
                        `Ready to progress to the next chapter in ${chosenSubject.name}.`
                    ],
                    highlight: "Click 'Final Assessment' above to record your mastery score in your student profile!"
                }
            }
        ];
    } else {
        // Full subject masterclass covering all 5 chapters!
        lessonChapters = chosenSubject.chapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            duration_sec: ch.duration_sec,
            narration_script: `In Chapter ${ch.id} of ${chosenSubject.name}, we examine ${ch.title}. ${ch.summary}. Let's explore the visual demonstrations on your screen.`,
            avatar_emotion: ch.id === 1 ? "welcoming" : ch.id === 5 ? "encouraging" : "explaining",
            visual_type: ch.visual_type,
            visual_payload: ch.visual_payload,
            checkpoint: ch.checkpoint
        }));
    }

    return {
        title: `${topic || chosenSubject.name} — Interactive AI Video Lesson`,
        topic: topic || chosenSubject.name,
        subject: chosenSubject.category,
        level: level,
        language: language,
        persona: persona,
        estimated_minutes: time_minutes,
        summary: `Comprehensive masterclass on ${topic || chosenSubject.name} in the ${chosenSubject.name} curriculum.`,
        learning_objectives: [
            `Understand the core foundations of ${topic || chosenSubject.name}`,
            "Analyze interactive demonstrations and dynamic visual payloads",
            "Demonstrate concept retention through targeted checkpoint assessments"
        ],
        chapters: lessonChapters
    };
}
