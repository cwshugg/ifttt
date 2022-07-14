const webhook_api_key = "YOUR_WEBHOOK_KEY_GOES_HERE";
const webhook_event_name = "reminder_webhook";

// =========================== Helper Functions ============================ //
// Invoked to set a response text message when the user just sends the prefix.
function set_sms_response_message(message: string)
{
  AndroidMessages.sendAMessage.setText("🖥️ " + message)
}

// Adjusts for the fact I live on the east coast of the US.
function adjust_datetime_to_timezone(dt: Date)
{ dt.setTime(dt.getTime() - hours_to_msecs(4)); }

// Converts a number of days to milliseconds.
function days_to_msecs(days: number)
{ return days * 24 * 3600 * 1000; }

// Converts a number of hours to milliseconds.
function hours_to_msecs(hours: number)
{ return hours * 3600 * 1000; }

// Converts a number of minutes to milliseconds.
function minutes_to_msecs(minutes: number)
{ return minutes * 60 * 1000; }

// Converts milliseconds to minutes.
function msecs_to_minutes(msecs: number)
{ return (msecs / 1000) / 60; }

// Attempts to parse an integer out of a string expected to contain all digits
// followed by a single prefix (provided). Returns NaN on failure to convert
// or the converted positive integer on success.
function parse_suffixed_integer(arg: string, pfx: string)
{
  // make sure the prefix is the last part of the string
  if (arg.indexOf(pfx) != arg.length - 1)
  { return NaN; }

  // attempt to parse as an integer
  let result = parseInt(arg.substring(0, arg.length - 1));
  if (isNaN(result))
  { return NaN; }

  return result;
}

// Invokes 'parse_suffixed_integer' to parse out day-strings.
function parse_days(arg: string)
{ return parse_suffixed_integer(arg, "d"); }

// Invokes 'parse_suffixed_integer' to parse out hour-strings.
function parse_hours(arg: string)
{ return parse_suffixed_integer(arg, "h"); }

// Invokes 'parse_suffixed_integer' to parse out minute-strings.
function parse_minutes(arg: string)
{ return parse_suffixed_integer(arg, "m"); }

// Takes in the first string argument (after the prefix) and attempts to parse
// it to understand when the user wants the reminder to be.
function get_delay_time(arg: string)
{
  // trim, then split the argument into several strings
  arg = arg.toLowerCase().trim();
  let args = arg.split(" ");

  // get the current date/time and subject to account for being on the
  // east coast (it's UTC by default)
  let when = new Date();
  when.setTime(when.getTime() /*- hours_to_msecs(5)*/);

  // iterate, trim each argument, and check it
  for (let i = 0; i < args.length; i++)
  {
    args[i] = args[i].trim();
    
    // ------------------- Parsing Time Appends ------------------- //
    // attempt to parse as day-string
    let days = parse_days(args[i]);
    if (!isNaN(days))
    {
      when.setTime(when.getTime() + days_to_msecs(days));
      continue;
    }

    // attempt to parse as an hour-string
    let hours = parse_hours(args[i]);
    if (!isNaN(hours))
    {
      when.setTime(when.getTime() + hours_to_msecs(hours));
      continue;
    }

    // attempt to parse as a minute-string
    let mins = parse_minutes(args[i]);
    if (!isNaN(mins))
    {
      when.setTime(when.getTime() + minutes_to_msecs(mins));
      continue;
    }

    // --------------------- Parsing Weekdays --------------------- //
    let day = -1;
    if (args[i] === "sun" || args[i] === "sunday")
    { day = 0; }
    else if (args[i] === "mon" || args[i] === "monday")
    { day = 1; }
    else if (args[i] === "tues" || args[i] === "tuesday")
    { day = 2; }
    else if (args[i] === "wed" || args[i] === "wednesday")
    { day = 3; }
    else if (args[i] === "thurs" || args[i] === "thursday")
    { day = 4; }
    else if (args[i] === "fri" || args[i] === "friday")
    { day = 5; }
    else if (args[i] === "sat" || args[i] === "saturday")
    { day = 6; }

    // if we found a weekday, increment and continue
    if (day > -1)
    {
      let cday = when.getDay();
      let day_diff = day - cday;
      if (day_diff > 0)
      { when.setTime(when.getTime() + days_to_msecs(day_diff)); }
      else
      { when.setTime(when.getTime() + days_to_msecs(7 + day_diff)); }
      continue;
    }
  
  }

  return when;
}

// =========================== Main Runner Code ============================ //
let msg = AndroidMessages.receivedAMessage.Text;
let prefix = "!r";
let delimeter = ".";

// before anything else, make sure the prefix is present
// (this accepts uppercase OR lowercase)
if (msg.indexOf(prefix) != 0 && msg.indexOf(prefix.toUpperCase()))
{
  AndroidMessages.sendAMessage.skip();
  MakerWebhooks.makeWebRequest.skip();
}

// now, we'll attempt to dissect the message
msg = msg.substring(prefix.length).trim();  // skip past the prefix
let pieces = msg.split(" ");                // split by whitespace (or commas);
// if there's nothing past the prefix, we'll just send a help message
if (pieces.length == 0 || pieces[0] == "")
{
  // send a response indicating how to format an auto-budget message
  set_sms_response_message(
    "Please send another message containing information about the reminder in this format:\n\n" +
    "!r WHEN " + delimeter + " MESSAGE\n\n" +
    "Where 'WHEN' can be any of the following:\n" +
    " - Max-and-match increments, such as: '3d' (3 days), '2h' (2 hours), '5m' (5 minutes)\n" +
    " - Day of the week\n" +
    "If 'WHEN' isn't specified, the reminder will default to one hour from time-of-sending."
  );
}
else
{
  let response_msg = "Reminder acknowledged.";
  let success = true;
  // find the location of our delimeter (".") and use that to separate out the
  // 'WHEN' from the 'MESSAGE'
  let delim_idx = msg.indexOf(delimeter);
  let reminder_msg = msg;
  
  // if we couldn't find the delimeter, the sender must not have specified a
  // 'WHEN'. So we'll default to one hour (60 minutes). Otherwise, we'll extract
  // the 'WHEN' string and try to parse it
  let when = new Date();
  when.setTime(when.getTime() + hours_to_msecs(1));
  if (delim_idx > -1)
  {
    // determine if there's a reminder message after the delimeter. If there's
    // not we'll complain
    if (delim_idx == msg.length - 1)
    {
      response_msg = "No reminder message given.";
      MakerWebhooks.makeWebRequest.skip();
    }
    else
    {
      reminder_msg = msg.substring(delim_idx + 1).trim();

      // extract the WHEN and parse it
      let when_string = msg.substring(0, delim_idx).trim();
      when = get_delay_time(when_string);
    }
  }

  // get the current time and adjust both to account for my timezone
  let current = new Date();
  adjust_datetime_to_timezone(current);
  adjust_datetime_to_timezone(when);
  response_msg += "\nTriggering at:  " + when.toLocaleString() + ".";

  // if the user only entered "cancel", we'll instead send to a URL that
  // will cancel all outstanding reminders
  if (msg.toLowerCase() === "cancel")
  {
    response_msg = "All reminders cancelled.";
    MakerWebhooks.makeWebRequest.setUrl(
      "https://lab.grapeot.me/ifttt/cancel?" +
      "event=" + webhook_event_name + "&" +
      "key=" + webhook_api_key
    );
  }
  else
  {
    // compute the amount of time for the delay and set th webhooks URL
    // and message body
    let delay = Math.round(Math.max(msecs_to_minutes(when.getTime() - current.getTime()), 1));

    // set the webhooks URL and message body
    MakerWebhooks.makeWebRequest.setUrl(
      "https://lab.grapeot.me/ifttt/delay?" +
      "event=" + webhook_event_name + "&" +
      "t=" + delay + "&" +
      "key=" + webhook_api_key
    )
    MakerWebhooks.makeWebRequest.setBody(
      "Value1=<<<" + AndroidMessages.receivedAMessage.FromNumber + ">>>&" +
      "Value2=<<<" + reminder_msg + ">>>"
    );
  }

  // send a response acknowledging the correct syntax
  set_sms_response_message(response_msg);
}

