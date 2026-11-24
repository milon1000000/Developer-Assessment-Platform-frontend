import { redirect } from "next/navigation";

export default function CandidateProfileRedirectPage() {
  redirect("/candidate/settings?tab=profile");
}
