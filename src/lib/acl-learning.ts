export const LEARN_CATEGORIES = ["All", "Fuel", "Movement", "Strength", "Mindset", "Recovery"] as const;
export type LearnCategory = (typeof LEARN_CATEGORIES)[number];

type LearnTopic = {
  id: string;
  category: Exclude<LearnCategory, "All">;
  title: string;
  body: string;
  action: string;
  evidence: string;
  color: string;
  sources: { label: string; url: string }[];
};

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: "landing", category: "Movement", title: "Soft landings, steady knees",
    body: "Land with your hips and knees bent and your knees following the direction of your toes. Avoid landing stiff-legged or letting your knees collapse inward. Keep your trunk steady and practice control before speed.",
    action: "Ask your coach to watch a few slow, two-foot landings and give feedback.",
    evidence: "A prospective study in female athletes linked landing mechanics and knee loading with later ACL injuries. Knee position is one factor, not a guarantee or a diagnosis.",
    color: "bg-sky/50 border-sky",
    sources: [{ label: "Landing mechanics study · 2005", url: "https://pubmed.ncbi.nlm.nih.gov/15722287/" }],
  },
  {
    id: "training", category: "Strength", title: "Train more than one skill",
    body: "Prevention routines work best as a combination: strength, balance, controlled jumps and landings, and feedback from a coach. Build up gradually and keep the routine going through the season.",
    action: "Make a coach-led prevention warmup part of practice, not just a once-in-a-while workout.",
    evidence: "Clinical guidance supports exercise-based prevention programs. Evidence applies to the whole program, not a promise that any single exercise prevents a tear.",
    color: "bg-mint/50 border-mint",
    sources: [{ label: "Exercise-based prevention guideline · 2018", url: "https://www.jospt.org/doi/10.2519/jospt.2018.0303" }],
  },
  {
    id: "hamstrings", category: "Strength", title: "Give your hamstrings some love",
    body: "Your hamstrings and glutes help control your leg during movement. Bridges, hip hinges and progressive hamstring exercises can be part of a balanced program alongside quad strength.",
    action: "Practice bridges with good control; learn harder exercises with a coach or physical therapist.",
    evidence: "Muscle mechanics help explain why posterior-chain training belongs in prevention programs. Strong muscles alone cannot eliminate injury risk.",
    color: "bg-rose/50 border-rose",
    sources: [{ label: "Exercise-based prevention guideline · 2018", url: "https://www.jospt.org/doi/10.2519/jospt.2018.0303" }],
  },
  {
    id: "consistency", category: "Strength", title: "Little routines, often",
    body: "A routine you actually do is more useful than an occasional marathon session. Consistent participation in a structured prevention program matters throughout the season.",
    action: "Pair your prevention warmup with practice and ask your coach about the right weekly schedule.",
    evidence: "Research on neuromuscular training connects program participation with injury outcomes. Study schedules vary; a streak is encouragement, not medical clearance.",
    color: "bg-sun/60 border-sun",
    sources: [{ label: "Neuromuscular training research · 2015", url: "https://pubmed.ncbi.nlm.nih.gov/25732152/" }],
  },
  {
    id: "protein", category: "Fuel", title: "Protein + enough fuel",
    body: "Include protein foods such as eggs, yogurt, tofu, beans, fish or chicken, plus carbohydrates for training energy. Regular meals and snacks support growth and recovery; collagen is not a substitute for balanced meals.",
    action: "After practice, pair a protein food with rice, bread, potatoes or fruit.",
    evidence: "Nutrition research after ACL injury or surgery concerns rehabilitation, not proof that high-protein diets prevent ACL tears in healthy teenagers. A sports dietitian can personalize needs.",
    color: "bg-mint/50 border-mint",
    sources: [{ label: "ACL rehabilitation nutrition paper · 2025", url: "https://link.springer.com/article/10.1007/s40279-025-02174-w" }],
  },
  {
    id: "collagen", category: "Fuel", title: "Collagen: promising, not a shield",
    body: "Your ACL contains collagen, and vitamin C helps your body make it. Collagen or gelatin supplements are being studied, but they have not been shown to prevent ACL tears in teen athletes.",
    action: "Choose a vitamin C food, such as an orange, kiwi, strawberries or peppers. Curious about supplements? Ask a parent or guardian and a sports dietitian or clinician first.",
    evidence: "The microtrauma paper discusses possible nutrition strategies. Changes in collagen-production markers do not establish that supplements repair ACL microtears or prevent injury. No supplement dose or timing is prescribed here.",
    color: "bg-peach/50 border-peach",
    sources: [{ label: "ACL microtrauma and nutrition · 2022", url: "https://www.researchgate.net/publication/366293560_ACL_microtrauma_healing_through_nutrition_modified_sports_training_and_increased_recovery_time" }],
  },
  {
    id: "vitamin-d", category: "Fuel", title: "Vitamin D: check, don’t guess",
    body: "Vitamin D supports bone and muscle health. Foods such as fortified milk or plant drinks, eggs and oily fish can contribute. A clinician can decide whether testing or a supplement makes sense.",
    action: "If you are injured, recovering from surgery or worried about a deficiency, bring it up with your care team.",
    evidence: "Research reports associations between low vitamin D and ACL-related outcomes. Association does not prove that taking vitamin D prevents a tear. Avoid high-dose supplements without medical guidance.",
    color: "bg-sun/60 border-sun",
    sources: [{ label: "Vitamin D and ACL outcomes review · 2025", url: "https://pubmed.ncbi.nlm.nih.gov/40170713/" }],
  },
  {
    id: "energy", category: "Fuel", title: "Don’t run on empty",
    body: "Your body needs energy for school, sport and growth. Consistently eating too little for your activity can affect health and recovery. Persistent fatigue, repeated injuries or changes in your period, if you have one, deserve support.",
    action: "Keep regular meals and a practice snack. Tell a trusted adult or clinician if fueling feels difficult—no calorie counting needed.",
    evidence: "Low energy availability can harm athlete health; that does not mean every missed snack causes an ACL tear. Individual assessment matters.",
    color: "bg-rose/50 border-rose",
    sources: [{ label: "Nutrition and tissue recovery discussion · 2022", url: "https://www.researchgate.net/publication/366293560_ACL_microtrauma_healing_through_nutrition_modified_sports_training_and_increased_recovery_time" }],
  },
  {
    id: "mindset", category: "Mindset", title: "Confidence is part of recovery",
    body: "Feeling nervous after an injury is understandable. Psychological readiness and fear of reinjury can affect the return-to-sport experience. You don’t have to handle those feelings alone.",
    action: "Try a calm breathing reset and share one worry with a coach, trusted adult or care team.",
    evidence: "Return-to-sport research connects psychological factors with recovery. Breathing exercises are a coping tool, not a proven ACL-prevention treatment or a substitute for clearance.",
    color: "bg-lavender/50 border-lavender",
    sources: [{ label: "Psychological factors and return to sport · 2014", url: "https://bjsm.bmj.com/content/48/22/1613" }],
  },
  {
    id: "recovery", category: "Recovery", title: "Recovery isn’t falling behind",
    body: "Rest and adequate food support your training. Pain, swelling, instability or a new knee injury need attention—not another checked box. After an ACL injury or surgery, follow your rehabilitation team’s plan.",
    action: "Tell a trusted adult about knee symptoms and pause painful drills until you get advice.",
    evidence: "Prevention education is not an injury diagnosis or a rehabilitation prescription. Return-to-sport decisions need individual clinical assessment.",
    color: "bg-peach/50 border-peach",
    sources: [{ label: "Exercise-based prevention guideline · 2018", url: "https://www.jospt.org/doi/10.2519/jospt.2018.0303" }],
  },
];