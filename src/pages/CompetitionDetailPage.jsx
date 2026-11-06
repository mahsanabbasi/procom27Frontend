import { useParams } from "react-router-dom";

export default function CompetitionDetailPage() {
  const { categorySlug, compSlug } = useParams();

  return <h1>Competition: {categorySlug} / {compSlug}</h1>;
}
