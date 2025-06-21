import * as React from 'react';
import { render } from '@react-email/render';
import VerificationEmail from './verification-email';

export type EmailTheme = {
    brandColor?: string;
    buttonText?: string;
    buttonBackground?: string;
    buttonBorder?: string;
};

export const renderVerificationEmail = async (url: string, host: string) => {
    return render(React.createElement(VerificationEmail, { url, host }), {
        pretty: true,
    });
};
