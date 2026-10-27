import ResultView from "@/components/calculator/ResultView";

export default function ResultsPage({ params }: { params: { id: string } }) {
  return <ResultView leadId={params.id} />;
}
