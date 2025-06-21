export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <div className="prose prose-lg text-gray-700">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, participate in any interactive features of our services, fill out a form, request customer support, or otherwise communicate with us.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">2. How We Use Information</h2>
                    <p>
                        We may use the information we collect to:
                    </p>
                    <ul>
                        <li>Provide, maintain, and improve our services;</li>
                        <li>Process transactions and send you related information, including confirmations and invoices;</li>
                        <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
                        <li>Respond to your comments, questions, and requests, and provide customer service;</li>
                        <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by us and others, and provide news and information we think will be of interest to you;</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">3. Sharing of Information</h2>
                    <p>
                        We may share information about you as follows or as otherwise described in this Privacy Policy:
                    </p>
                    <ul>
                        <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf;</li>
                        <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process;</li>
                        <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others;</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">4. Your Choices</h2>
                    <p>
                        You may update, correct or delete information about you at any time by logging into your online account. If you wish to delete or deactivate your account, please email us but note that we may retain certain information as required by law or for legitimate business purposes.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us.
                    </p>
                </div>
            </div>
        </div>
    );
} 