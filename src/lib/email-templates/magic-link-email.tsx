import * as React from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

const MagicLinkEmail = ({
  loginLink,
  expiryTime,
}: {
  loginLink: string
  expiryTime: string
}) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Your App"
  const appAddress =
    process.env.NEXT_PUBLIC_APP_ADDRESS || "123 Main St, Anytown, USA"
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Your magic link to sign in to {appName}</Preview>
        <Body className="bg-[#f6f9fc] py-[40px] font-sans">
          <Container className="mx-auto w-[465px] rounded-[8px] bg-white p-[20px]">
            <Section className="mt-[32px]">
              <Heading className="text-center text-[24px] font-bold text-[#333]">
                Sign in to {appName}
              </Heading>

              <Text className="text-[16px] leading-[24px] text-[#555]">
                Hello,
              </Text>

              <Text className="text-[16px] leading-[24px] text-[#555]">
                Click the button below to securely sign in to your {appName}{" "}
                account. This link will expire in {expiryTime}.
              </Text>

              <Section className="mt-[32px] mb-[32px] text-center">
                <Button
                  className="box-border rounded-[8px] bg-[#0070f3] px-[20px] py-[12px] text-center text-[16px] font-medium text-white no-underline"
                  href={loginLink}
                >
                  Sign in to {appName}
                </Button>
              </Section>

              <Text className="text-[14px] leading-[24px] text-[#666]">
                If you didn&apos;t request this link, you can safely ignore this
                email.
              </Text>

              <Text className="text-[14px] leading-[24px] text-[#666]">
                If the button above doesn&apos;t work, paste this link into your
                browser:
              </Text>

              <Text className="text-[14px] leading-[24px] break-all text-[#666]">
                {loginLink}
              </Text>
            </Section>

            <Section className="mt-[32px] border-t border-solid border-[#e6ebf1] pt-[32px] text-center">
              <Text className="text-[12px] leading-[24px] text-[#8898aa]">
                &copy; {new Date().getFullYear()} {appName}. All rights
                reserved.
              </Text>
              <Text className="m-0 text-[12px] leading-[24px] text-[#8898aa]">
                {appAddress}
              </Text>
              <Text className="text-[12px] leading-[24px] text-[#8898aa]">
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`}
                  className="text-[#8898aa]"
                >
                  Unsubscribe
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default MagicLinkEmail
