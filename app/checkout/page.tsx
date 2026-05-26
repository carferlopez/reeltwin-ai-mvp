import { redirect } from "next/navigation";
import { getSubscriptionLink, type PlanId } from "@/lib/pricing";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ plan?: PlanId }>;
}) {
  const params = await searchParams;
  const plan = params.plan === "studio" ? "studio" : "pro";
  redirect(getSubscriptionLink(plan));
}
