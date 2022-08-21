const emails = "youremail@domain.com";

// Hepler function: sets parameters to be sent off to users.
function set_response(who: string, msg: string)
{
  // gmail settings
  Gmail.sendAnEmail.setSubject("🎂 Approaching Birthday: " + who);
  Gmail.sendAnEmail.setBody(msg);
  Gmail.sendAnEmail.setTo(emails);

  // sms settings
  AndroidMessages.sendAMessage.setText("🎂 " + msg);
}

// Helper function: invokes all 'skip()' functions for all actions.
function skip_response()
{
  Gmail.sendAnEmail.skip();
  AndroidMessages.sendAMessage.skip();
}

// make sure the correct data was given
const jdata = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload);
if (jdata["who"] && jdata["month"] && jdata["day"])
{
  // turn the month and day into a date in the future
  const month = jdata["month"];
  const day = jdata["day"];
  const now = new Date();
  let date = new Date(now.getFullYear(), month - 1, day);
  // if the birthday, this year, has already passed, compute it using
  // the next calendar year
  if (date.getTime() < now.getTime())
  { date = new Date(now.getFullYear() + 1, month - 1, day); }
  
  // next we'll create a message to send to the user, starting with the
  // birthday boy/girl's name (adding 's or ' to the end of it, depending
  // on how it's spelled)
  const who = jdata["who"];
  let msg = who;
  if (who.endsWith("s"))
  { msg += "' "; }
  else
  { msg += "'s "; }
  msg += "birthday is ";

  // next, calculate how far away the birthday is from today's date,
  // then write it into the message
  const diff_seconds = (date.getTime() - now.getTime()) / 1000.0;
  const diff_days = diff_seconds / 86400;
  if (diff_days < 1.0)
  { msg += "today!"; }
  else
  { msg += "in " + parseInt("" + diff_days, 10) + " days"; }

  // spell out the birthday and add it to the end of the message
  const month_names = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  msg += ", on (" + month_names[month - 1] + " " + day + ", " + date.getFullYear() + ")";

  // set the response message
  set_response(who, msg);
}
else
{ skip_response(); }
