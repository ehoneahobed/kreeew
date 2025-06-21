import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
    resetLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PasswordResetEmail = ({
    resetLink = `${baseUrl}/auth/reset-password?token=some-token`,
}: PasswordResetEmailProps) => (
    <Html>
        <Head />
        <Preview>Reset your password</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/static/logo.png`}
                    width="40"
                    height="33"
                    alt="Auth Boilerplate"
                />
                <Heading style={heading}>Reset your password</Heading>
                <Section>
                    <Text style={text}>
                        Someone recently requested a password change for your
                        Auth Boilerplate account. If this was you, you can set
                        a new password here:
                    </Text>
                    <Button style={button} href={resetLink}>
                        Reset password
                    </Button>
                    <Text style={text}>
                        If you don&apos;t want to change your password or
                        didn&apos;t request this, just ignore and delete this
                        message.
                    </Text>
                    <Text style={text}>
                        To keep your account secure, please don&apos;t forward
                        this email to anyone.
                    </Text>
                </Section>
                <Hr style={hr} />
                <Link
                    href="https://github.com/Lord-of-the-files/authjs-repo"
                    style={reportLink}
                >
                    Auth Boilerplate
                </Link>
            </Container>
        </Body>
    </Html>
);

export default PasswordResetEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #eee",
    borderRadius: "5px",
    boxShadow: "0 5px 10px rgba(20,50,70,.2)",
    marginTop: "20px",
    width: "360px",
    margin: "0 auto",
    padding: "68px 0 130px",
};

const logo = {
    margin: "0 auto",
};

const heading = {
    fontSize: "32px",
    fontWeight: "300",
    color: "#404040",
    lineHeight: "1.3",
    padding: "0 40px",
};

const button = {
    backgroundColor: "#2563eb",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 20px",
    margin: "20px 40px",
};

const text = {
    color: "#404040",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
    padding: "0 40px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const reportLink = {
    fontSize: "12px",
    color: "#b4becc",
}; 