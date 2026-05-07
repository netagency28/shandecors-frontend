import StaticContentPage from './StaticContentPage';

export default function PrivacyPolicyPage() {
  const fallback = `
    <h2>Privacy Policy</h2>
    <p>Last updated: January 2025</p>
    <p>Shan Decor ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy describes how we collect, use, and share information when you use our website and services.</p>

    <h3>1. Information We Collect</h3>
    <ul>
      <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
      <li><strong>Order Information:</strong> Shipping address, phone number, and payment details when you place an order.</li>
      <li><strong>Usage Data:</strong> Pages visited, products viewed, and browsing behaviour on our site.</li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <ul>
      <li>To process and fulfil your orders.</li>
      <li>To send order confirmations and shipping updates via email.</li>
      <li>To respond to your customer service enquiries.</li>
      <li>To improve our website and services.</li>
    </ul>

    <h3>3. Sharing of Information</h3>
    <p>We share your information with the following third-party service providers strictly to fulfil our services:</p>
    <ul>
      <li><strong>Supabase:</strong> Database and authentication services.</li>
      <li><strong>Cashfree Payments:</strong> Payment processing. Your payment data is handled directly by Cashfree and is subject to their privacy policy.</li>
      <li><strong>Resend:</strong> Transactional email delivery.</li>
    </ul>
    <p>We do not sell, trade, or otherwise transfer your personally identifiable information to third parties for marketing purposes.</p>

    <h3>4. Data Retention</h3>
    <p>We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.</p>

    <h3>5. Your Rights</h3>
    <p>Under applicable Indian law (IT Act 2000 and IT Rules 2011), you have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you.</li>
      <li>Correct inaccurate personal data.</li>
      <li>Request deletion of your personal data.</li>
      <li>Withdraw consent for data processing at any time.</li>
    </ul>

    <h3>6. Cookies</h3>
    <p>We use cookies and similar technologies to maintain session state and improve your experience. You can disable cookies in your browser settings, though this may affect site functionality.</p>

    <h3>7. Security</h3>
    <p>We implement industry-standard security measures including HTTPS encryption, secure authentication via Supabase, and limited access controls to protect your personal data.</p>

    <h3>8. Grievance Officer</h3>
    <p>For any privacy-related concerns or complaints, please contact our Grievance Officer:</p>
    <p><strong>Email:</strong> support@shandecor.in<br/>We will respond to your grievance within 30 days as required under the Consumer Protection (E-Commerce) Rules 2020.</p>

    <h3>9. Changes to This Policy</h3>
    <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
  `;

  return <StaticContentPage slug="privacy" fallbackContent={fallback} />;
}
