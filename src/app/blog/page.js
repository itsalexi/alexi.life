import { redirect } from "next/navigation";

// The folders on home are the index now: this opens the Writing folder there.
export default function Page() {
  redirect("/?folder=writing");
}
