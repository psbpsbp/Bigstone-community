import { redirect } from "next/navigation"

export default function CreateExamplePage() {
  // Redirect since examples are not user-created
  redirect("/examples")
}
