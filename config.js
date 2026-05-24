/* =========================================================================
   WGHC site configuration
   Edit these values to point at your real payment provider, etc.
   ========================================================================= */
window.WGHC_CONFIG = {

  /* ---- PAYMENT URLS ----
     Sign up at one of these and paste the resulting checkout/payment-link URL.
     Recommended providers:
       • Donorbox       https://donorbox.org           (best for nonprofits)
       • Stripe Payment Links  https://dashboard.stripe.com/payment-links
       • PayPal Donate  https://www.paypal.com/donate/buttons

     After signing up:
       1. Create a "Membership Dues" item priced at e.g. $25/year
       2. Copy the resulting public payment URL
       3. Paste it below (replace the placeholder)
       4. In the payment provider's settings, set the "redirect after payment"
          URL to:  https://YOUR-DOMAIN/thanks.html
  */
  paymentUrls: {
    // Used by the "Pay annual dues" / membership tier buttons
    individual:  "https://example.com/pay/individual",     // e.g. $25/year
    household:   "https://example.com/pay/household",      // e.g. $40/year
    donate:      "https://example.com/donate"              // optional general donation
  },

  /* ---- CONTACT INFO ----
     Used in form footers and the contact page.
  */
  contact: {
    email:        "hello@wghc.example.org",
    trailsEmail:  "trails@wghc.example.org",
    mailing:      "P.O. Box 0815, Madison, WI 53701"
  },

  /* ---- GOOGLE CALENDAR ID ----
     The calendar must be set to public.
     URL-encode the '@' as '%40'.
  */
  calendarId: "wisconsingohikingclub%40gmail.com",
  calendarTz: "America%2FChicago"
};
