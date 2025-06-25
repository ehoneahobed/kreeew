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

function VerificationEmail({
  verificationUrl,
  unsubscribeUrl,
}: {
  verificationUrl: string
  unsubscribeUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto px-[12px] py-[20px]">
            <Section className="rounded-[8px] bg-white p-[24px] shadow-sm">
              <Heading className="mt-0 mb-[16px] text-[24px] font-bold text-gray-800">
                Verify your email address
              </Heading>

              <Text className="mb-[24px] text-[16px] text-gray-600">
                Thanks for signing up! Please verify your email address to
                complete your registration.
              </Text>

              <Button
                href={verificationUrl}
                className="box-border block rounded-[4px] bg-black px-[20px] py-[12px] text-center font-medium text-white no-underline"
              >
                Verify Email Address
              </Button>

              <Text className="mt-[24px] text-[14px] text-gray-600">
                If you didn&apos;t create an account, you can safely ignore this
                email.
              </Text>

              <Text className="mt-[16px] text-[14px] text-gray-600">
                If the button above doesn&apos;t work, copy and paste this link
                into your browser:
              </Text>

              <Text className="mt-[8px] text-[14px] break-all text-blue-600">
                <Link
                  href={verificationUrl}
                  className="text-blue-600 no-underline"
                >
                  {verificationUrl}
                </Link>
              </Text>
            </Section>

            <Section className="mt-[32px] text-center text-[12px] text-gray-500">
              <Text className="m-0">
                © {new Date().getFullYear()} &lt;Your Company Name&gt;. All
                rights reserved.
              </Text>
              <Text className="m-0 mt-[8px]">&lt;Your Company Address&gt;</Text>
              <Text className="m-0 mt-[8px]">
                <Link href={unsubscribeUrl} className="text-gray-500 underline">
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default VerificationEmail
