import { Suspense } from "react";
import SnippetDetails from "./snippet-details";

export default function SnippetDetailsPage() {
  return <Suspense fallback={<p>Loading snippet...</p>}><SnippetDetails /></Suspense>;
}
