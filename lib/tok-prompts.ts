export interface TOKPrompt {
  title: string;
  description: string;
}

export type TOKCategoryId = "knowledge" | "reliability" | "ethics" | "communication" | "culture" | "change";

export const TOK_CATEGORIES: { id: TOKCategoryId; label: string; color: string; promptIds: number[] }[] = [
  { id: "knowledge",     label: "Knowledge & Justification",   color: "var(--yellow)", promptIds: [1, 4, 5, 19, 25, 32] },
  { id: "reliability",   label: "Reliability, Bias & Certainty", color: "var(--mint)",  promptIds: [3, 8, 12, 13, 18, 28, 31] },
  { id: "ethics",        label: "Ethics & Responsibility",      color: "var(--pink)",   promptIds: [7, 11, 16, 27, 29, 34, 35] },
  { id: "communication", label: "Communication & Context",      color: "var(--sky)",    promptIds: [6, 10, 22, 23, 24] },
  { id: "culture",       label: "Communities & Culture",        color: "#e9d5ff",        promptIds: [9, 14, 17, 21, 26] },
  { id: "change",        label: "Change & Imagination",         color: "#fed7aa",        promptIds: [2, 15, 20, 30, 33] },
];

export function getCategoryForPrompt(promptId: number): TOKCategoryId | null {
  for (const cat of TOK_CATEGORIES) {
    if (cat.promptIds.includes(promptId)) return cat.id;
  }
  return null;
}

export const TOK_PROMPTS: Record<number, TOKPrompt> = {
  1: {
    title: "What counts as knowledge?",
    description: "Challenges you to determine if some concepts (like opinions or feelings) can be understood as a form of \"knowledge\": a fundamental term in TOK. What determines whether the term applies in your situation? Do some pieces of information become knowledge only in special circumstances, or only to certain people?",
  },
  2: {
    title: "Are some types of knowledge more useful than others?",
    description: "Discuss both the criteria for being \"useful\" (for whom and for what?) and the applicability of the term to different forms of knowledge (e.g. within sciences and arts). You can also examine why we feel the need to label knowledge as \"useful\" at all.",
  },
  3: {
    title: "What features of knowledge have an impact on its reliability?",
    description: "First analyze what \"reliability\" means. Then explore the features that ensure it: is it more about the source of knowledge, the form in which it's presented, or something else entirely?",
  },
  4: {
    title: "On what grounds might we doubt a claim?",
    description: "Think about what prompts you to doubt the information you obtain. Do you compare it with your own knowledge? What makes you suspect that a claim is not based on facts?",
  },
  5: {
    title: "What counts as good evidence for a claim?",
    description: "How do we back up our statements? Do people tend to appeal to visual evidence (photos, documents), testimonies of witnesses, or the way a claim is structured? Analyze it.",
  },
  6: {
    title: "How does the way that we organize or classify knowledge affect what we know?",
    description: "Most knowledge from the outside world is classified in some way. Consider various forms of organization, particularly the effect of labels on our understanding of concepts or objects (e.g. recognition of social groups, classification of species).",
  },
  7: {
    title: "What are the implications of having, or not having, knowledge?",
    description: "Obtaining knowledge can have both positive and negative consequences depending on the situation and the knowledge pursued. A person can be both shunned or praised for possessing certain information, like the ability to influence others. What other examples come to mind?",
  },
  8: {
    title: "To what extent is certainty attainable?",
    description: "What does it mean to be certain? Once defined, explore both what increases your certainty about a claim and what can limit it. Do doubts always exclude certainty?",
  },
  9: {
    title: "Are some types of knowledge less open to interpretation than others?",
    description: "We often believe some concepts (like scientific claims) are more rigid and universal in meaning than others (like artworks or feelings). Consider what makes us believe this, and whether the distinction is valid at all.",
  },
  10: {
    title: "What challenges are raised by the dissemination and/or communication of knowledge?",
    description: "Spreading knowledge is useful, but does it impact its features? Analyze whether communication of knowledge can influence its reliability, certainty, or other traits.",
  },
  11: {
    title: "Can new knowledge change established values or beliefs?",
    description: "We sometimes believe newly discovered concepts should replace previously accepted views. But does it always need to be so? What criteria does new knowledge need to satisfy to challenge established beliefs? Do community values change with the expansion of knowledge?",
  },
  12: {
    title: "Is bias inevitable in the production of knowledge?",
    description: "Start with analyzing the word \"bias\", then discuss its sources. Are some ways of obtaining knowledge less (or more) prone to bias?",
  },
  13: {
    title: "How can we know that current knowledge is an improvement upon past knowledge?",
    description: "What does it mean for knowledge to \"improve\"? Consider what helps scientists, discoverers, and others determine whether new findings should be accepted and previous ones disproven.",
  },
  14: {
    title: "Does some knowledge belong only to particular communities of knowers?",
    description: "Can every person truly obtain all forms of knowledge, especially the most subjective ones, like opinions, feelings, or religious beliefs? Does empathizing with others truly let us gain the perception of that community?",
  },
  15: {
    title: "What constraints are there on the pursuit of knowledge?",
    description: "Our capability to obtain knowledge is limited by many factors, including psychological, ethical, and physical limits. How does being human impact our ability to pursue certain forms of knowledge?",
  },
  16: {
    title: "Should some knowledge not be sought on ethical grounds?",
    description: "Ethics are one of the most challenging parts of the TOK knowledge framework. What would prevent you from gaining certain information, such as respect for privacy or dignity? What are the consequences of seeking knowledge without regard for someone else's well-being?",
  },
  17: {
    title: "Why do we seek knowledge?",
    description: "Why do people aim to gain knowledge? Is it human nature, or is it the usefulness of certain information? Can we seek knowledge just for fun?",
  },
  18: {
    title: "Are some things unknowable?",
    description: "We'd like to think everything is within reach of our perception, yet concepts like love, truth, or the afterlife seem elusive. Are these temporary obstacles or unresolvable challenges?",
  },
  19: {
    title: "What counts as a good justification for a claim?",
    description: "List different tools for justifying a claim and try to rank them by usefulness or reliability. Do you apply different criteria to claims arising in different areas of knowledge?",
  },
  20: {
    title: "What is the relationship between personal experience and knowledge?",
    description: "Personal experience can be a source of knowledge, but it also shapes how we view and accept facts. Have you ever questioned the reliability of a claim based on your personal history with a situation, a description of a past event, or a political statement?",
  },
  21: {
    title: "What is the relationship between knowledge and culture?",
    description: "Shared knowledge forms a significant part of culture. Does the culture of a community influence how they accept or interpret knowledge? What shared beliefs or values in your society shape how you view the world?",
  },
  22: {
    title: "What role do experts play in influencing our consumption or acquisition of knowledge?",
    description: "Recall a time experts' opinions shaped what knowledge you accepted, especially when confronted with conflicting information. What sources of information do you consume? Who are the \"experts\" you and those around you trust most, and why?",
  },
  23: {
    title: "How important are material tools in the production or acquisition of knowledge?",
    description: "Knowledge is produced not only through words and texts but also through physical objects, which are limited by their physical properties (e.g. measurement uncertainty). Identify the tools used in different areas (scientists, historians, mathematicians) and discuss their impact on knowledge acquisition.",
  },
  24: {
    title: "How might the context in which knowledge is presented influence whether it is accepted or rejected?",
    description: "Should our acceptance of knowledge depend on its presentation? What contexts increase the chance of acceptance, such as types of texts, expert speeches, or advertisements?",
  },
  25: {
    title: "How can we distinguish between knowledge, belief and opinion?",
    description: "These three terms are often used interchangeably, but the label we choose can affect the reliability of our claims. In what contexts can an opinion become knowledge? What do you think about \"personal knowledge\"?",
  },
  26: {
    title: "Does our knowledge depend on our interactions with other knowers?",
    description: "Producing knowledge is often collaborative, from group projects to lab work. It also shapes how we understand and rely on knowledge. How do interactions with teachers, peers, or strangers change our perception of certain information?",
  },
  27: {
    title: "Does all knowledge impose ethical obligations on those who know it?",
    description: "Identify types of knowledge that raise ethical issues, then identify areas that produce the fewest. Why might knowers be unable, or alternatively obliged, to share certain information?",
  },
  28: {
    title: "To what extent is objectivity possible in the production or acquisition of knowledge?",
    description: "Define \"objectivity\". Then discuss in which areas of knowledge reaching objectivity poses the greatest challenge, and in which it's almost automatically assumed.",
  },
  29: {
    title: "Who owns knowledge?",
    description: "Does knowledge belong to all of us, or is it the property of certain people? It depends on the type. Explore which forms of knowledge might be owned by specific people: a great chance to discuss copyright.",
  },
  30: {
    title: "What role does imagination play in producing knowledge about the world?",
    description: "Some areas (like arts) are commonly associated with imagination. But what is its role in other areas, especially those requiring abstract thinking, like science or mathematics?",
  },
  31: {
    title: "How can we judge when evidence is adequate?",
    description: "Come up with criteria for evaluating evidence. Do you consider the scope of evidence, its source, and the form in which it's presented?",
  },
  32: {
    title: "What makes a good explanation?",
    description: "Explanations are only as good as their ability to break down and give meaning to the described concepts. How do you make an explanation coherent, easy to understand, and accurate?",
  },
  33: {
    title: "How is current knowledge shaped by its historical development?",
    description: "Historical pathways of developing knowledge influence further direction: future research areas, new art styles. Look for examples within all areas of knowledge.",
  },
  34: {
    title: "In what ways do our values affect our acquisition of knowledge?",
    description: "What kinds of values determine the forms of knowledge we choose to pursue? Do some values (like ethical ones) prevent us from exploring certain concepts? Consider values knowers might have: integrity, respect, curiosity.",
  },
  35: {
    title: "In what ways do values affect the production of knowledge?",
    description: "Similar to the previous question, but focus on the areas in which knowledge is created. What values do scientists or artists have? Does their work reflect these values?",
  },
};
