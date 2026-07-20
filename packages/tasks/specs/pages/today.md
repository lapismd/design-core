# Today page spec

Today aggregates tasks due today and makes lateness scannable before scheduled
work. Use ordered groups: **Overdue**, **Today**, then an optional collapsed
completed group. Each group has an accessible heading and a count where useful.

Overdue is communicated with text and a semantic danger token, never colour
alone. Completing an overdue task moves it to Done with a brief layout motion;
reduced motion performs the state change without travel.
