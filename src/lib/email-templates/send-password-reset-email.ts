import { render } from "@react-email/render";
import { PasswordResetEmail } from "./password-reset-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.SENDER_EMAIL_ADDRESS!;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    const emailHtml = await render(
        PasswordResetEmail({
            resetLink,
        }),
    );

    try {
        await resend.emails.send({
            from,
            to: email,
            subject: "Reset your password",
            html: emailHtml,
        });
    } catch (error) {
        console.error(error);
        throw new Error("Failed to send password reset email.");
    }
}; 