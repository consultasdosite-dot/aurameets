import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) {
    throw new Error(
      "A variável STRIPE_SECRET_KEY não está configurada no servidor.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, property) {
    const client = getStripeClient();

    const value = Reflect.get(
      client,
      property,
      client,
    );

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});