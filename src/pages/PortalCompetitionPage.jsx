import { useParams } from "react-router-dom";

export default function PortalCompetitionPage() {
  const { id } = useParams();

  return <h1>Portal Competition: {id}</h1>;
}
