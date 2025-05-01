import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  url: string;
  host: string;
}

export const VerificationEmail = ({
  url,
  host,
}: VerificationEmailProps) => {
  const previewText = `Sign in to ${host}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={text}>Click the magic link below to sign in to your account:</Text>
            <Button
              style={{
                ...button,
                padding: '12px 20px',
              }}
              href={url}
            >
              Sign in to {host}
            </Button>
            <Text style={footer}>
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const section = {
  padding: '0 48px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  color: '#525f7f',
  textAlign: 'left' as const,
  lineHeight: '24px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '16px',
};

export default VerificationEmail;
