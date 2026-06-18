"use client";

import { useTenant } from "@/contexts/TenantContext";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "FAQ - Particuliers",
    items: [
      {
        question: "Qu'est-ce que la plateforme ?",
        answer:
          "La plateforme permet de trouver rapidement un professionnel près de chez soi pour réaliser un service ou une prestation locale.",
      },
      {
        question: "Comment trouver un professionnel ?",
        answer:
          "Recherchez un service (plombier, ménage, coiffeur, etc.) et la plateforme affiche les professionnels disponibles dans votre ville.",
      },
      {
        question: "Est-ce gratuit pour les particuliers ?",
        answer:
          "Oui, les particuliers peuvent utiliser la plateforme gratuitement pour rechercher et contacter des professionnels.",
      },
      {
        question: "Quels services peut-on trouver ?",
        answer:
          "Plomberie, électricité, serrurerie, ménage à domicile, coiffure, jardinage, coaching sportif et bien d'autres.",
      },
      {
        question: "Peut-on trouver un professionnel en urgence ?",
        answer:
          "Oui, certains professionnels peuvent être disponibles rapidement pour des interventions urgentes.",
      },
      {
        question: "Comment choisir un professionnel fiable ?",
        answer:
          "Consultez les profils, les services proposés, les avis clients et les photos.",
      },
    ],
  },
  {
    title: "FAQ - Professionnels",
    items: [
      {
        question: "Pourquoi s'inscrire en tant que professionnel ?",
        answer:
          "Gagnez en visibilité sur internet et recevez des demandes de clients dans votre ville.",
      },
      {
        question: "Comment créer un compte professionnel ?",
        answer:
          "Inscrivez-vous, complétez votre profil professionnel et publiez vos services pour être visible auprès des particuliers.",
      },
      {
        question: "Comment recevoir des clients ?",
        answer:
          "Vous apparaissez dans les résultats lorsque les particuliers recherchent un service dans votre ville.",
      },
      {
        question: "Comment améliorer son profil professionnel ?",
        answer:
          "Complétez votre profil, ajoutez des photos, décrivez vos services et obtenez des avis clients.",
      },
    ],
  },
];

export default function HelpPage() {
  const { supportEmail } = useTenant();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-black">Centre d&apos;aide</h1>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 text-lg font-semibold text-black">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border border-black/10 bg-white p-4"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-black">
                    {item.question}
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm text-black/70">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-black/10 bg-white p-6 text-center">
        <p className="text-sm text-black/70">
          Vous n&apos;avez pas trouvé la réponse à votre question ?
        </p>
        {supportEmail ? (
          <a
            href={`mailto:${supportEmail}`}
            className="mt-4 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
          >
            Contacter le support
          </a>
        ) : (
          <p className="mt-4 text-sm text-black/50">
            Le support n&apos;est pas disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
