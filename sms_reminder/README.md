# SMS Reminder

I created this applet to let me easily set reminders by texting myself.
It's made up of two applets:

## Applet 1 - Message Sifter

The first applet sifts through every SMS message I received to search for the
correctly prefix (`!r`). It expects a message similar to this:

```
!r 4h. Do laundry today
```

The message must begin with a `!r` or `!R` and must be followed by shorthand
notation of a duration of time from the present. A few examples:

* `!r 4h.` - 4 hours from now
* `!r 30m.` - 30 minutes from now
* `!r 3d 12h.` - 3 days and 12 hours from now
* `!r 1d -4h.` - 1 day from now, *minus* four hours.

A period must separate the timing notation and the content of the reminder. If
the message sifter finds a suitable SMS message and parses everything
successfully, it makes a web request to the third-party
![IFTTT trigger delay service](https://lab.grapeot.me/ifttt/delay).
This third party service waits the computed amount of time, then pings my second
applet.

### How to Recreate

To recreate this applet, do the following:

1. Set up a **Android SMS** "any new SMS received" trigger
2. Add a **Android SMS** "send an SMS" action
3. Add a **Webhook** "make a web request" action
4. Add filter code contained within `reminder_sms.js`

## Applet 2 - Reminder Webhook

This is the second applet that receives the delayed webhook request submitted to
the third-party IFTTT trigger delay service. It receives information specifying
which number to message, and what the content of the reminder is to send back.

### How to Recreate

To recreate this applet, do the following:

1. Set up a **Webhook** "receive a web request" trigger. Make sure the name of
   the request matches the name you set in the filter code for the first applet.
2. Add a **Android SMS** "send an SMS" action
3. Add filter code contained within `reminder_webhook.js`

