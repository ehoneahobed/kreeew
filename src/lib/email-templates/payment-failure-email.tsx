import * as React from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

interface PaymentFailureEmailProps {
  readonly customerName?: string
  readonly planName: string
  readonly amount: string
  readonly nextRetryDate?: string
  readonly updatePaymentUrl: string
  readonly manageSubscriptionUrl: string
}

export function PaymentFailureEmail({
  customerName,
  planName,
  amount,
  nextRetryDate,
  updatePaymentUrl,
  manageSubscriptionUrl,
}: PaymentFailureEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment failed for your QuickCalendar subscription</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto px-[12px] py-[20px]">
            <Section className="rounded-[8px] bg-white p-[24px] shadow-sm">
              <Heading className="mt-0 mb-[16px] text-[24px] font-bold text-gray-800">
                Payment Failed
              </Heading>

              <Text className="mb-[16px] text-[16px] text-gray-600">
                {customerName ? `Hi ${customerName},` : "Hi there,"}
              </Text>

              <Text className="mb-[16px] text-[16px] text-gray-600">
                We were unable to process the payment for your QuickCalendar{" "}
                {planName} plan subscription ({amount}/month).
              </Text>

              <Text className="mb-[24px] text-[16px] text-gray-600">
                This could happen for several reasons:
              </Text>

              <Text className="mb-[4px] ml-[16px] text-[16px] text-gray-600">
                • Your card has expired
              </Text>
              <Text className="mb-[4px] ml-[16px] text-[16px] text-gray-600">
                • Insufficient funds
              </Text>
              <Text className="mb-[24px] ml-[16px] text-[16px] text-gray-600">
                • Your bank declined the transaction
              </Text>

              <Text className="mb-[24px] text-[16px] text-gray-600">
                <strong>What happens next?</strong>
              </Text>

              {nextRetryDate && (
                <Text className="mb-[16px] text-[16px] text-gray-600">
                  We&apos;ll automatically retry the payment on {nextRetryDate}.
                  If the payment continues to fail, your subscription may be
                  canceled.
                </Text>
              )}

              <Text className="mb-[24px] text-[16px] text-gray-600">
                To avoid any service interruption, please update your payment
                method:
              </Text>

              <Button
                href={updatePaymentUrl}
                className="mb-[16px] box-border block rounded-[4px] bg-red-600 px-[20px] py-[12px] text-center font-medium text-white no-underline"
              >
                Update Payment Method
              </Button>

              <Text className="mb-[24px] text-[14px] text-gray-600">
                You can also manage your subscription and view billing details:
              </Text>

              <Button
                href={manageSubscriptionUrl}
                className="mb-[24px] box-border block rounded-[4px] bg-gray-600 px-[20px] py-[12px] text-center font-medium text-white no-underline"
              >
                Manage Subscription
              </Button>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                If you have any questions or need assistance, please don&apos;t
                hesitate to contact our support team.
              </Text>

              <Text className="text-[14px] text-gray-600">
                Thanks for using {process.env.NEXT_PUBLIC_APP_NAME}!
              </Text>
            </Section>

            <Section className="mt-[32px] text-center text-[12px] text-gray-500">
              <Text className="m-0">
                © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}
                . All rights reserved.
              </Text>
              <Text className="m-0 mt-[8px]">
                <Link
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/portal/settings`}
                  className="text-gray-500 underline"
                >
                  Manage email preferences
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PaymentFailureEmail
