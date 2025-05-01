import * as React from 'react';
import { render } from '@react-email/render';
import VerificationEmail from './verification-email';

export const renderVerificationEmail = (url: string, host: string) => {
  return render(React.createElement(VerificationEmail, { url, host }), {
    pretty: true,
  });
};
