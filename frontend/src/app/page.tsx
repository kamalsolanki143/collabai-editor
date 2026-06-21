import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to the default document editor
  redirect("/editor/default");
}
