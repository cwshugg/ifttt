# Webhook Email Trigger

This routine involves receiving a webhook request and forwarding the contents of
the request's HTTP message body into an email sent by you.

## How to Recreate

To recreate this, do the following:

1. Set up a **Webhook** "receive a web request with a JSON payload" trigger
2. Add a **gmail** "send an email" action, from your linked email address.
3. Add filter code contained within `webhook_email.js`

