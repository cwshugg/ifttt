let num = MakerWebhooks.event.Value1;
let msg = MakerWebhooks.event.Value2;

// set the phone number and text to the given values from the webhook
AndroidMessages.sendAMessage.setPhoneNumber(num);
AndroidMessages.sendAMessage.setText("⏰ " + msg);

