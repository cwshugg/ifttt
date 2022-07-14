// check the JSON payload for the correct fields
try
{
  let jdata = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload);
  Gmail.sendAnEmail.setTo(jdata["to"]);
  Gmail.sendAnEmail.setSubject(jdata["subject"]);
  Gmail.sendAnEmail.setBody(jdata["content"]);
}
catch (error)
{ Gmail.sendAnEmail.skip(); }

