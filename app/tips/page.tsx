import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TOK Exhibition Tips",
  description: "Practical advice for writing a strong IB TOK exhibition — choosing objects, writing justifications, and avoiding common mistakes.",
};

const sections = [
  {
    title: "Choosing your prompt",
    accent: "var(--yellow)",
    tips: [
      { h: "Pick the prompt that fits your objects, not the other way around", body: "The most common mistake is choosing a 'good-sounding' prompt and then struggling to find objects. Start with objects you're genuinely curious about — a photograph, an artefact, a piece of data — and then find the prompt that best connects them." },
      { h: "Difficulty ≠ better marks", body: "A 'challenging' prompt that you write about shallowly scores worse than an 'accessible' prompt written with genuine depth. The marks are for the quality of your analysis, not the complexity of the question." },
      { h: "The prompt should have a yes/no uncertainty", body: "Good prompts for exhibition work are contestable. If there's an obvious single answer, the knowledge question becomes harder to explore. Look for prompts where different areas of knowledge genuinely disagree." },
    ],
  },
  {
    title: "Choosing your objects",
    accent: "var(--mint)",
    tips: [
      { h: "Specificity is everything", body: "Not 'a photograph of a war' but 'Nick Ut's Napalm Girl, 1972'. Not 'a scientific paper' but 'Watson and Crick's 1953 DNA structure letter in Nature'. Specific objects let you make specific analytical claims." },
      { h: "Vary your object types", body: "Using three objects from the same type (three artworks, three scientific findings) makes it hard to show breadth. Vary across Personal, Cultural, Scientific, Linguistic, Mathematical, or Natural objects to demonstrate the prompt applies across knowledge areas." },
      { h: "You need a personal connection to at least one", body: "IB guidelines require at least one object with a personal connection — something from your own life, community, or experience. This doesn't mean it has to be sentimental, just that you can speak to why it matters to you specifically." },
    ],
  },
  {
    title: "Writing your justification",
    accent: "var(--pink)",
    tips: [
      { h: "Open with the knowledge question, not a definition", body: "Don't start with 'Knowledge is defined as…' or 'According to the IB…'. Open with the specific epistemic claim your object raises. 'Napalm Girl confronts the tension between photographic evidence and the ethics of its production…'" },
      { h: "95–150 words per object", body: "This is tighter than it sounds. Every sentence must earn its place. Cut anything that could apply to any object — keep only what is specific to your particular object and your particular prompt." },
      { h: "Name the WOK or AOK, but make it earn its mention", body: "Don't just say 'this connects to the natural sciences'. Say why the natural sciences produce a specific kind of knowledge claim here that differs from, say, the arts. The connection should be analytical, not decorative." },
      { h: "End with what makes this object analytically interesting", body: "Your last sentence should explain what the object reveals about how we know, not just what it is. 'What makes this object particularly interesting for this prompt is that it raises the question of whether…'" },
    ],
  },
  {
    title: "Common mistakes to avoid",
    accent: "var(--sky)",
    tips: [
      { h: "Describing the object instead of analysing it", body: "The justification is not a caption. Don't spend sentences explaining what the object is — the reader can see it. Use every sentence to make an epistemic claim about what it reveals." },
      { h: "Treating the prompt as a title, not a question", body: "Some students write 'This object relates to the prompt about knowledge and technology' and then never actually engage with the question. The prompt is a live question that your object must address." },
      { h: "Using the same knowledge question for all three objects", body: "Each object should raise a slightly different facet of the prompt. If your KQs are identical across objects, you haven't shown that three different perspectives are needed." },
      { h: "Not saving for supervisor review", body: "Your supervisor must sign off on your exhibition before submission. Share your draft early — they can flag whether your object choices and justifications are on track before you invest too much time." },
    ],
  },
  {
    title: "Understanding assessment and moderation",
    accent: "#e9d5ff",
    tips: [
      { h: "Your teacher marks first, then IB moderates", body: "The TOK exhibition is internally assessed — your teacher gives a mark out of 10. IB then selects a sample from each school and externally moderates. The moderator can adjust marks up or down if they disagree with the teacher's assessment." },
      { h: "Moderation looks for consistency, not perfection", body: "Moderators check whether your teacher's marks align with IB standards across the school's cohort. A single strong exhibition can be marked down if the rest of the school's marks were all inflated — so internal standardisation matters." },
      { h: "The rubric uses holistic judgement", body: "Unlike the EE or some IA reports, the TOK exhibition is assessed holistically against a single rubric from 0–10. There are no separate criteria being added up. The examiner makes one holistic judgement about whether your exhibition is Excellent, Good, Satisfactory, Basic, or Rudimentary." },
      { h: "Academic honesty: AI assistance must be disclosed", body: "IB's academic honesty policy requires students to disclose AI assistance. AI-generated justifications submitted verbatim without acknowledgement are a potential violation. Use AI output as a starting draft and rewrite substantially in your own voice — then disclose AI use to your supervisor." },
    ],
  },
];

export default function TipsPage() {
  return (
    <main className="page-main" style={{ maxWidth: "760px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Guide</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>TOK Exhibition Tips</h1>
        <p style={{ color: "#555", marginTop: "0.5rem", lineHeight: 1.6, maxWidth: "520px" }}>
          Practical advice for a strong exhibition. Written for students who have read the official guide and want to go deeper.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/tok-prompts" className="btn-ghost btn-ghost-hover" style={{ padding: "7px 16px" }}>
            Browse all 35 prompts →
          </Link>
          <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "7px 16px" }}>
            Build your exhibition
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {sections.map((section) => (
          <section key={section.title}>
            <div style={{ borderBottom: `3px solid ${section.accent}`, paddingBottom: "0.5rem", marginBottom: "1.25rem" }}>
              <h2 className="heading" style={{ fontSize: "18px", margin: 0 }}>{section.title}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {section.tips.map((tip) => (
                <div key={tip.h} className="card" style={{ padding: "1rem 1.25rem", borderLeft: `4px solid ${section.accent}` }}>
                  <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "0.4rem" }}>{tip.h}</p>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.65, margin: 0 }}>{tip.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: "3rem", padding: "1.5rem", background: "var(--yellow)", border: "2px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "4px 4px 0 0 var(--fg)" }}>
        <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Put this into practice</p>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "1rem" }}>
          Use Corespace to pick your prompt, get AI-generated knowledge questions, and refine your justifications with targeted feedback.
        </p>
        <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
          Start free →
        </Link>
      </div>
    </main>
  );
}
