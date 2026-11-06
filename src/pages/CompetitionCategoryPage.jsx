import { useParams } from "react-router-dom";

export default function CompetitionCategoryPage() {
  const { categorySlug } = useParams();

  return <h1>Competition Category: {categorySlug}</h1>;
}
