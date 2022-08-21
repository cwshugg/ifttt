#!/bin/bash
# Shell script that pings an IFTTT webhook with appropriate data to alert me of
# oncoming birthdays.
#
#   Connor Shugg

# IFTTT globals
event=birthday_remind
key="$(cat ./webhook.key)"

# birthday globals
who="Bob"
month=1
day=1

# check for the proper command-line arguments
if [ $# -ge 3 ]; then
    who="$1"
    month=$2
    day=$3
fi

# ping IFTTT
curl -X POST \
     -d "{\"who\": \"${who}\", \"month\": ${month}, \"day\": ${day}}" \
     -H "Content-Type: application/json" \
     https://maker.ifttt.com/trigger/${event}/json/with/key/${key}

