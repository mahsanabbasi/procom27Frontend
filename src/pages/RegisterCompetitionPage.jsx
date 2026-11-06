import { useParams } from "react-router-dom";

export default function RegisterCompetitionPage() {
  const { competitionSlug } = useParams();

  return <h1>Register for {competitionSlug}</h1>;
}
