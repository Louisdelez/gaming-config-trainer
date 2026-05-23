import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Info as InfoIcon, BookOpen } from "lucide-react";
import { getExplanation } from "../data/explanations";

export default function Info() {
  const { slug } = useParams<{ slug: string }>();
  const explanation = slug ? getExplanation(slug) : null;

  if (!explanation) {
    return <Navigate to="/" replace />;
  }

  // The route to go "back" to
  const backTo = explanation.category === "game"
    ? `/games/${slug}`
    : `/hardware/${slug}`;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-[11px] uppercase font-bold transition-colors"
          style={{ letterSpacing: "1.4px" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>
        <span className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">
          {explanation.category === "game" ? "Aim Trainer" : "Hardware Test"}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1ed760] flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-1">À propos de</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{explanation.title}</h1>
          <p className={`text-sm mt-2 ${explanation.accent}`}>{explanation.short}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 max-w-3xl">
        {explanation.sections.map((s, i) => (
          <div key={i} className="bg-[#181818] rounded-xl p-5">
            <h2 className="text-[11px] uppercase tracking-[1.4px] font-bold text-[#1ed760] mb-3 flex items-center gap-2">
              <InfoIcon className="w-3.5 h-3.5" />
              {s.title}
            </h2>
            <div className="text-sm text-white whitespace-pre-line leading-relaxed">
              {renderBody(s.body)}
            </div>
          </div>
        ))}
      </div>

      {/* Back CTA at bottom */}
      <div className="mt-8 text-center">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
          style={{ letterSpacing: "1.4px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à {explanation.title}
        </Link>
      </div>
    </>
  );
}

/** Render body with simple markdown-link support: [text](url) */
function renderBody(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    parts.push(
      <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-[#1ed760] hover:underline">
        {m[1]}
      </a>
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}
