import { redirect } from "next/navigation";

// The folders on home are the index now: this opens the Work folder there.
export default function Page() {
  redirect("/?folder=work");
}
