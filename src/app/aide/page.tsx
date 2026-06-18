import ContentContainer from "@/components/layout/ContentContainer";
import HelpPage from "@/components/help/HelpPage";

export default function AidePage() {
  return (
    <main>
      <ContentContainer className="max-w-3xl">
        <HelpPage />
      </ContentContainer>
    </main>
  );
}
