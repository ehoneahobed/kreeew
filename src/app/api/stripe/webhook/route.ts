import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

import { sendPaymentFailureEmail } from "@/lib/email-templates/send-payment-failure-email"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as InvoiceWithSubscription
        await handlePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as InvoiceWithSubscription
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error("No userId found in subscription metadata")
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  let planName = "free"

  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    planName = "starter"
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    planName = "pro"
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      planName,
      subscriptionStatus: subscription.status,
    },
  })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error("No userId found in subscription metadata")
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      planName: "free",
      subscriptionStatus: "canceled",
    },
  })
}

async function handlePaymentSucceeded(invoice: InvoiceWithSubscription) {
  const subscriptionId = invoice.subscription
  if (subscriptionId && typeof subscriptionId === "string") {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await handleSubscriptionUpdate(subscription)
  }
}

async function handlePaymentFailed(invoice: InvoiceWithSubscription) {
  const subscriptionId = invoice.subscription
  if (subscriptionId && typeof subscriptionId === "string") {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata.userId

    if (userId) {
      try {
        // Get user details from database
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            name: true,
            planName: true,
          },
        })

        if (user?.email) {
          // Get subscription details for email
          const amount = subscription.items.data[0]?.price.unit_amount

          const planName = user.planName || "Unknown"
          const formattedAmount = amount
            ? `$${(amount / 100).toFixed(2)}`
            : "N/A"

          // Calculate next retry date (Stripe typically retries in 3-7 days)
          const nextRetryDate = new Date()
          nextRetryDate.setDate(nextRetryDate.getDate() + 3)
          const nextRetryDateString = nextRetryDate.toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )

          // Send payment failure email
          await sendPaymentFailureEmail({
            to: user.email,
            customerName: user.name || undefined,
            planName: planName.charAt(0).toUpperCase() + planName.slice(1),
            amount: formattedAmount,
            nextRetryDate: nextRetryDateString,
          })

          console.log(
            `Payment failure email sent to user ${userId} (${user.email})`
          )
        }
      } catch (error) {
        console.error("Error sending payment failure email:", error)
      }
    }
  }
}
