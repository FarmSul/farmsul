import { redirect } from "next/navigation";
import { getCachedUser, isPlatformAdmin } from "@/lib/supabase/admin";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LandingContent } from "@/components/marketing/landing-content";

export default async function Home() {
  const user = await getCachedUser();

  if (user) {
    redirect((await isPlatformAdmin()) ? "/admin" : "/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <LandingContent />
      <SiteFooter />
    </>
  );
}
