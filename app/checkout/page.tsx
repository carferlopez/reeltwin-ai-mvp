import { redirect } from "next/navigation";
import { getStripeLink, type PackageId } from "@/lib/pricing";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ pack?: PackageId }>;
}) {
  const params = await searchParams;
  const pack = params.pack === "showcase" ? "showcase" : "monologo";
  redirect(getStripeLink(pack));
}
