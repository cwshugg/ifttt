#!/bin/bash
# Script to launch a no-hangup background reminder daemon process.

# see if a remind service is already running
if [ ! -z "$(pgrep remind)" ]; then
    echo "The remind daemon is already running. Please kill it first."
    exit
fi

# run 'remind' in '-z'/daemon mode, in the background
# (we run with 'nohup' so it doesn't get killed when the
# terminal exits)
nohup remind -z ~/.reminders &

