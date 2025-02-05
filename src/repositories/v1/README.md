# Repositories

This directory contains code for repositories provided by this app.


## EVENT SCHEDULES


Event: Stores basic details for both one-time and recurring events.
EventInstance: Tracks each occurrence of an event, whether it's a one-time event or part of a recurring schedule.
RecurringSchedule: Defines the frequency and duration of recurring events.
Relationships:
An Event can have many EventInstances.
A recurring Event can have one RecurringSchedule.


One-Time Event: Create an event and a single EventInstance entry for its date.
Recurring Event: Create an event and define the recurrence using RecurringSchedule. Automatically generate EventInstance entries based on the schedule.
