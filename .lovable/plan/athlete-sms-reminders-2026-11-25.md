# Athlete SMS reminders

## What athletes will see
- A secure sign-in flow so reminder settings belong to the right athlete.
- An SMS section in Profile with phone number, explicit consent, reminder time and time zone, and separate switches for activity logging, incomplete workouts, and at-risk streaks.
- Clear delivery status, a test-text action, and one-tap opt-out. Existing app tasks and badges stay unchanged.
- Encouraging messages, never medical alerts or shame-based streak warnings.

## Delivery and privacy
- Use Twilio for real SMS delivery through Lovable's managed connection flow.
- Store only authenticated athletes' reminder settings and delivery records in Lovable Cloud.
- A protected scheduled job evaluates each athlete's local day, quiet hours, task progress, calendar activity and current streak, then sends at most one reminder of each kind per day.
- Validate phone numbers and all server input, require explicit opt-in, and support STOP/opt-out handling.
- Keep credentials server-side and never expose phone numbers or delivery logs publicly.

## Technical work
1. Enable Lovable Cloud and add authenticated user profiles, SMS preferences and idempotent delivery records.
2. Connect Twilio and add server functions for preferences, test messages and opt-out, plus a secured scheduled endpoint.
3. Add the Profile SMS controls and authentication flow.
4. Add focused tests for reminder eligibility and streak-risk timing; verify build, tests and the UI. Live SMS verification depends on the Twilio connection and a verified recipient number.
