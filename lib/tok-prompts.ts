export interface TOKPrompt {
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export type TOKCategoryId = "knowledge" | "reliability" | "ethics" | "communication" | "culture" | "change";

export const TOK_CATEGORIES: { id: TOKCategoryId; label: string; color: string; promptIds: number[] }[] = [
  { id: "knowledge",     label: "Knowledge & Justification",     color: "var(--yellow)", promptIds: [1, 4, 5, 19, 25, 32] },
  { id: "reliability",   label: "Reliability, Bias & Certainty", color: "var(--mint)",   promptIds: [3, 8, 12, 13, 18, 28, 31] },
  { id: "ethics",        label: "Ethics & Responsibility",        color: "var(--pink)",   promptIds: [7, 11, 16, 27, 29, 34, 35] },
  { id: "communication", label: "Communication & Context",        color: "var(--sky)",    promptIds: [6, 10, 22, 23, 24] },
  { id: "culture",       label: "Communities & Culture",          color: "#e9d5ff",       promptIds: [9, 14, 17, 21, 26] },
  { id: "change",        label: "Change & Imagination",           color: "#fed7aa",       promptIds: [2, 15, 20, 30, 33] },
];

export function getCategoryForPrompt(promptId: number): TOKCategoryId | null {
  for (const cat of TOK_CATEGORIES) {
    if (cat.promptIds.includes(promptId)) return cat.id;
  }
  return null;
}

export const TOK_PROMPTS: Record<number, TOKPrompt> = {
  1: {
    difficulty: 4,
    title: "What counts as knowledge?",
    description: "The boundary between what is genuinely known and what is merely believed, assumed, or felt is often blurrier than it first appears. It might be drawn by strict evidence and logic in some fields, while in others it relies on intuition, testimony, or shared cultural memory. The question touches truth, justification, and recognition: whether knowledge is defined by being correct, by being supported, or by being accepted within a community. Where that line falls determines whose voices are trusted and what ideas are taken seriously.",
  },
  2: {
    difficulty: 2,
    title: "Are some types of knowledge more useful than others?",
    description: "Usefulness sounds like a simple measure until you ask: useful for what, and for whom? Knowledge that helps us survive, predict, create, persuade, or make meaning may all be \"useful\" in different ways, so usefulness is not a simple ranking. The tension often lies between practical results and forms of understanding that matter for less measurable reasons. Whether \"useful\" is even a stable standard, or whether it shifts depending on what we're trying to do, is the quieter question underneath.",
  },
  3: {
    difficulty: 2,
    title: "What features of knowledge have an impact on its reliability?",
    description: "Some claims feel rock-solid; others feel shaky, but the interesting question is what exactly produces that difference. Reliability can be shaped by evidence, method, consistency, repeatability, expertise, or the conditions in which knowledge was produced. Knowledge can also be fragile, susceptible to human error, bias, or the passage of time. The traits that make an idea dependable in one domain can render it questionable in another.",
  },
  4: {
    difficulty: 1,
    title: "On what grounds might we doubt a claim?",
    description: "Doubt often arises when new evidence contradicts established norms, when the methods behind a conclusion appear flawed, or when a claim suspiciously serves the interests of those presenting it. It can also come from something simpler: a clash with lived experience, or a conclusion that feels too neat. At the same time, too much doubt can paralyze judgment, so the prompt touches the balance between healthy caution and distrust. The grounds for doubt reveal the threshold at which trust breaks down.",
  },
  5: {
    difficulty: 1,
    title: "What counts as good evidence for a claim?",
    description: "Evidence is not automatically strong just because it exists. Good evidence often depends on relevance, quality, context, and the standards of the field or community using it: a statistical analysis might back a sociological trend convincingly, yet personal testimony can carry more weight in a courtroom or a historical account. Different claims may require different kinds of support, and evidence can persuade without necessarily settling a matter completely. The gap between having evidence and it being good evidence is where much of the real work happens.",
  },
  6: {
    difficulty: 3,
    title: "How does the way that we organize or classify knowledge affect what we know?",
    description: "Categories do not merely sort knowledge; they can shape it. The way ideas are grouped, named, separated, or ranked can highlight some patterns while hiding others, and dividing ideas into strict disciplines can deepen specialized understanding while creating barriers that prevent broader insights. A different taxonomy of the same material could produce genuinely different knowledge, which raises the question of how much structure we're finding in the world versus imposing on it. Classification is not neutral, but part of how reality becomes understandable in the first place.",
  },
  7: {
    difficulty: 2,
    title: "What are the implications of having, or not having, knowledge?",
    description: "Knowledge is rarely just something abstract; it often changes what people can do, decide, control, or imagine. Having knowledge can bring power, responsibility, freedom, or anxiety, while lacking it can create dependence, vulnerability, or even peace. The asymmetry between what it means to know something and what it means to not know it turns out to be surprisingly uneven. Whether ignorance is always a disadvantage depends heavily on the situation.",
  },
  8: {
    difficulty: 4,
    title: "To what extent is certainty attainable?",
    description: "Absolute certainty is a rare and perhaps mythical endpoint in the quest for understanding. Even mathematics, often held up as the domain of flawless proof, rests on axioms that were chosen rather than discovered. In some areas, certainty may seem close because methods are tightly controlled; in others, ambiguity appears built in. The deeper issue is whether certainty is a realistic goal of knowing at all, or whether most knowledge remains strong but provisional.",
  },
  9: {
    difficulty: 3,
    title: "Are some types of knowledge less open to interpretation than others?",
    description: "Not all knowledge invites the same level of disagreement. Some knowledge appears tightly constrained by rules, evidence, or method, while other kinds depend more openly on perspective, language, or context. Even so, the boundary is not neat, because interpretation can enter in unexpected places: even fields that prize precision involve choices about framing and what counts as a satisfying answer. Whether rigidity or flexibility depends more on what the knowledge is for than on the subject matter alone.",
  },
  10: {
    difficulty: 2,
    title: "What challenges are raised by the dissemination and/or communication of knowledge?",
    description: "Knowledge can change as it moves from one person, group, or medium to another. Language carries cultural baggage and subtle biases that alter meaning in transit, and the channels through which information flows can amplify sensationalism or suppress marginalized voices. Communication can widen access, but it can also simplify, distort, or strip ideas from their original context. The tension between accuracy and accessibility, and between openness and control, runs through the entire journey of a shared idea.",
  },
  11: {
    difficulty: 3,
    title: "Can new knowledge change established values or beliefs?",
    description: "New knowledge can unsettle traditions, reshape moral judgments, or force old beliefs to be defended in new ways. But values and beliefs are not always easily replaced: people, communities, and institutions resist, reinterpret, or absorb new information in ways that are as much social as they are rational. History offers cases where a discovery genuinely shifted what people thought was right, and cases where it didn't, despite the evidence. The friction between novel discoveries and established values is where this prompt lives.",
  },
  12: {
    difficulty: 2,
    title: "Is bias inevitable in the production of knowledge?",
    description: "The underlying issue is whether knowledge can ever be fully separated from the people and systems that produce it. Bias may arise from language, perspective, funding, culture, expectation, or method, even where neutrality is the goal. But the line between bias and legitimate standpoint is harder to draw than it first appears: some forms of situated perspective are generative rather than distorting. Whether bias is simply a flaw to reduce or an unavoidable condition that must be recognized and managed remains genuinely open.",
  },
  13: {
    difficulty: 3,
    title: "How can we know that current knowledge is an improvement upon past knowledge?",
    description: "Progress in understanding is usually judged by an increased ability to predict, explain, or resolve anomalies that baffled earlier generations. But measuring improvement requires a standard, and that standard is itself a product of current knowledge. Older paradigms sometimes hold wisdom or insight that modern approaches have quietly lost, and the narrative of constant improvement is complicated by the possibility that knowledge can change shape without necessarily moving closer to any absolute truth. Improvement as correction and improvement as changing priorities do not always point in the same direction.",
  },
  14: {
    difficulty: 4,
    title: "Does some knowledge belong only to particular communities of knowers?",
    description: "Some knowledge may depend on shared language, lived experience, tradition, training, or trust, making access genuinely difficult from the outside. Indigenous ecological knowledge, the tacit expertise of a craft tradition, closed ritual practices: these may resist translation without losing something essential. The idea of knowledge \"belonging\" to a group raises questions about authority, ownership, and the limits of universal access. The tension between a universal right to know and the need to protect cultural integrity does not resolve easily.",
  },
  15: {
    difficulty: 3,
    title: "What constraints are there on the pursuit of knowledge?",
    description: "The search for knowledge does not happen in empty space. It is shaped by ethical limits, practical barriers, political control, available tools, accepted methods, and the capacities of human knowers themselves. Some constraints protect people and standards; others restrict understanding in ways that are harder to justify. These different kinds of limits do not all work the same way, and they do not all carry the same weight.",
  },
  16: {
    difficulty: 2,
    title: "Should some knowledge not be sought on ethical grounds?",
    description: "The drive to discover can clash with the need to protect life, dignity, justice, or the environment. Some lines of inquiry may seem dangerous because of how knowledge is obtained, what it reveals, or what can be done with it afterward. The tension is not simply between knowledge and ignorance, but between different kinds of responsibility: and the question of who gets to draw those limits is itself part of the problem. Whether the value of knowing can outweigh the cost of finding out is rarely a clean calculation.",
  },
  17: {
    difficulty: 1,
    title: "Why do we seek knowledge?",
    description: "Knowledge may be pursued for survival, control, curiosity, identity, meaning, prestige, beauty, or moral duty, and these reasons do not always align. The obvious answer, because it's useful, doesn't cover everything; people pursue understanding in domains with no practical payoff, at great personal cost, and in defiance of social pressure. Whether knowledge-seeking is driven by something deeply human or something more contingent shapes how we understand what knowledge is for. The motives behind inquiry can also affect what kind of knowledge gets produced.",
  },
  18: {
    difficulty: 5,
    title: "Are some things unknowable?",
    description: "The limits of knowledge may come from the world itself, from human minds, or from the tools and concepts available at a given moment. Some things may seem unknowable because evidence is inaccessible, because language falls short, or because certainty is structurally impossible rather than merely distant. Confronting the permanently obscure forces a particular kind of humility: and raises the question of what it even means to acknowledge a limit on knowledge. Unknowable now is not always the same as unknowable forever.",
  },
  19: {
    difficulty: 3,
    title: "What counts as a good justification for a claim?",
    description: "Justification does a lot of heavy lifting in how we separate knowledge from lucky guesses, yet the standards for it shift enormously across contexts. A justification may involve reasons, methods, coherence, authority, experience, or proof, depending on the kind of claim being made: and it is often judged against standards that are themselves debated. A court of law, a physics paper, and a personal conviction all operate with different ideas of what counts as adequate support. The gap between having a reason and having a good reason is one of the central problems in understanding how knowledge works.",
  },
  20: {
    difficulty: 2,
    title: "What is the relationship between personal experience and knowledge?",
    description: "Lived experience can feel like direct access to reality, providing a visceral and immediate grasp of the world that abstract theories often fail to match. Yet experience is also partial, subjective, and shaped by interpretation, leaving knowledge built on it vulnerable to memory flaws and the difficulty of generalizing from a sample of one. Experience does not simply give knowledge: it often becomes knowledge through reflection, language, and recognition by others. The tension between the intimacy of first-hand knowing and the demands of shareable, verifiable knowledge runs through almost every domain.",
  },
  21: {
    difficulty: 2,
    title: "What is the relationship between knowledge and culture?",
    description: "Culture acts as the soil in which knowledge grows, shaping which questions are worth asking and which answers are acceptable. Language, traditions, and values weave a web that filters incoming information and colors how the world is interpreted: ideas that flourish in one cultural context can be incomprehensible or controversial in another. But knowledge also pushes back on culture, sometimes traveling across boundaries and changing things from the outside. Whether culture mainly limits knowledge, enables it, or does both at once is left genuinely open.",
  },
  22: {
    difficulty: 2,
    title: "What role do experts play in influencing our consumption or acquisition of knowledge?",
    description: "Experts often act as guides in areas where direct understanding is difficult, distilling vast amounts of information into accessible insights. Their authority can accelerate learning and provide a necessary anchor in fields requiring years of dedicated study. But reliance on experts introduces questions of trust, authority, and dependence: calibrating that trust is its own skill, and over-deference can stifle independent thinking or allow established dogmas to go unchallenged. The dynamic between the informed few and the broader public shapes how truth is recognized and adopted.",
  },
  23: {
    difficulty: 3,
    title: "How important are material tools in the production or acquisition of knowledge?",
    description: "Knowing is not only mental; it is often mediated by instruments, technologies, records, and physical systems. The telescope or the fMRI scanner did not just help us see more clearly: they opened entirely new categories of knowledge that could not have existed without them. But tools also shape what is visible and valued, imposing their own limitations and blind spots on the user. The question of where the instrument ends and the knowledge begins is less obvious than it looks.",
  },
  24: {
    difficulty: 3,
    title: "How might the context in which knowledge is presented influence whether it is accepted or rejected?",
    description: "The same claim can be received very differently depending on where, when, how, and by whom it is presented. Tone, framing, medium, audience expectations, and social trust can all affect acceptance without changing the content itself. Understanding why reception is context-dependent is a different problem from simply wishing it weren't. The prompt opens an important tension between the strength of an idea and the conditions that allow it to be heard.",
  },
  25: {
    difficulty: 4,
    title: "How can we distinguish between knowledge, belief and opinion?",
    description: "These three words are often used interchangeably, but they are supposed to carve out different territory. Knowledge usually carries an added expectation of stronger grounding or justification; beliefs can be sincere and even correct while resting on something less verifiable; opinions tend to be more fluid, a personal stance where multiple readings can reasonably coexist. The difficulty lies in the fact that the boundary is not always visible from the inside: what one person calls knowledge, another may see as belief. The categories shift as new evidence emerges or social norms evolve.",
  },
  26: {
    difficulty: 3,
    title: "Does our knowledge depend on our interactions with other knowers?",
    description: "The construction of meaning is rarely a solitary endeavor. Language, testimony, disagreement, collaboration, teaching, and shared standards all suggest that much of what we know is social from the beginning: even a solitary thinker relies on concepts and foundations established by generations before them. Yet individual judgment still plays a real role, which means knowledge may be both deeply personal and deeply collective at once. Whether genuinely solitary knowledge is even coherent as an idea is the harder question underneath.",
  },
  27: {
    difficulty: 5,
    title: "Does all knowledge impose ethical obligations on those who know it?",
    description: "Knowing something can change what a person is responsible for, but not every kind of knowledge seems to do so in the same way. Some knowledge appears to create duties to act, warn, protect, disclose, or restrain, while other knowledge may seem ethically neutral: and tying all understanding to moral duty can be paralyzing, transforming innocent curiosity into a heavy burden. The space between \"knowing something\" and \"being responsible for doing something about it\" turns out to be ethically rich and largely unresolved. Whether knowledge as possession and knowledge as burden are always separable is the open question here.",
  },
  28: {
    difficulty: 4,
    title: "To what extent is objectivity possible in the production or acquisition of knowledge?",
    description: "Objectivity may mean fairness, detachment, consistency, transparency, or freedom from bias, but these ideals are easier to define than to achieve. Methodologies like blind trials and statistical analysis strive to strip away personal distortion, yet every system is designed by individuals with inherent viewpoints, and every interpretation requires a subjective leap at some point. The question remains open between objectivity as a real possibility, an imperfect practice, or a guiding aspiration rather than a final state. Whether partial objectivity is achievable, and what it actually looks like, may be the more productive question.",
  },
  29: {
    difficulty: 2,
    title: "Who owns knowledge?",
    description: "Knowledge can be treated as personal, communal, cultural, commercial, or universal, and those models often clash. Patenting a lifesaving drug or copyrighting a piece of code rewards innovation but limits its benefits; indigenous communities face a different version of the same problem when ancestral wisdom is appropriated for commercial gain. Beneath the surface lies a tension between sharing knowledge as something that benefits all and protecting it as something tied to labor, identity, or justice. Treating truth as property raises questions that do not disappear just because the law has answered them.",
  },
  30: {
    difficulty: 4,
    title: "What role does imagination play in producing knowledge about the world?",
    description: "Imagination is often associated with invention or fiction, but it may also matter in serious attempts to understand reality. New knowledge can require imagining possibilities, patterns, explanations, or models before they can be tested or articulated: scientific hypotheses, historical reconstructions, and philosophical thought experiments all depend on picturing what is not directly observable. The tension lies in the fact that imagination can both open the path to insight and lead beyond what evidence can support. Whether it supplements rigorous inquiry or sits closer to the center of how knowledge gets made is the open question here.",
  },
  31: {
    difficulty: 2,
    title: "How can we judge when evidence is adequate?",
    description: "Adequacy is a threshold question: not whether evidence exists, but whether there is enough of the right kind for the claim being made. That threshold shifts depending on the stakes, the consequences of error, and the standards of a field or community: demanding absolute proof can lead to an endless spiral of doubt, while accepting too little risks serious error. The moment when we decide we have enough to act or conclude is rarely purely logical. Adequacy turns out to be partly technical and partly a matter of judgment.",
  },
  32: {
    difficulty: 1,
    title: "What makes a good explanation?",
    description: "A good explanation does more than give an answer; it makes something intelligible. It might be judged by clarity, coherence, simplicity, depth, predictive power, or how well it fits the available evidence: but these virtues do not always align, and an explanation can be accurate without being satisfying, or satisfying without being accurate. Different disciplines have very different standards, and those standards reflect assumptions about what kind of understanding actually matters. The tension between explanations that are elegant, accurate, and genuinely satisfying is rarely resolved all at once.",
  },
  33: {
    difficulty: 3,
    title: "How is current knowledge shaped by its historical development?",
    description: "Knowledge has a history, and that history leaves traces in the concepts, methods, assumptions, and boundaries we inherit. Current understanding may grow by correcting the past, but it is also shaped by paths already taken and possibilities already excluded: discarded theories often leave structural foundations that subtly influence contemporary thought in ways that are easy to miss. Recognizing this lineage reveals contingencies that look like necessities, and opens up alternatives that were closed off by circumstance. Current certainty is the latest chapter in a long, ongoing story.",
  },
  34: {
    difficulty: 3,
    title: "In what ways do our values affect our acquisition of knowledge?",
    description: "Values can shape attention, trust, openness, motivation, and resistance, influencing what feels worth learning and what feels credible. A culture that prizes economic growth will heavily fund technological research, perhaps at the expense of philosophical or ecological inquiry, while personal values shape which conclusions we are willing to accept. These convictions act as a filter, highlighting information that confirms existing beliefs while quietly setting aside what does not fit. The deeper tension is that values can both distort knowledge and help direct us toward what matters.",
  },
  35: {
    difficulty: 5,
    title: "In what ways do values affect the production of knowledge?",
    description: "Where the previous prompt focuses on the knower receiving knowledge, this one turns to the systems and choices involved in creating it. Values can shape what questions are asked, what methods are accepted, what risks are tolerated, what results are emphasized, and whose perspectives are centered. This makes knowledge production appear not as a neutral pipeline, but as an activity shaped by human priorities from the start. Whether value-laden knowledge can still be reliable, and under what conditions, is the open question at the center of this prompt.",
  },
};
