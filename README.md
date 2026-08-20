# Interview Coach Pro

Build a web app called "InterviewAce" — an AI mock interview coach that

helps job seekers practice interviews by speaking answers out loud and

getting AI feedback.

FUNCTIONALITY — three screens:

1. Role selector screen: three selectable cards for interview tracks

   (Tech/SDE, HR, Consulting). Each shows the role name and a one-line

   description. Selecting one starts the interview.

2. Interview screen: shows one question at a time (5 questions per

   role), a large mic button the user clicks to start/stop recording

   their spoken answer, using the browser's built-in SpeechRecognition

   API (Web Speech API) — no external service, this is free and built

   into Chrome. Show the live transcript as text while they speak.

   Automatically read each question aloud using the browser's

   speechSynthesis API when it appears. Handle errors gracefully:

   show a clear message if microphone permission is denied, if no

   speech is detected, or if the browser doesn't support speech

   recognition (recommend Chrome in that case). A "Next Question"

   button advances after each answer.

3. Results screen: after all questions, show an overall score as a

   circular gauge, a per-question score breakdown, and a list of

   improvement tips. Call an API endpoint (POST to /api/score) with

   the questions and transcribed answers, expecting back JSON in this

   shape: {"results":[{"content_score":number,"clarity_score":number,

   "confidence_score":number,"tip":"string"}],"overall_tips":["string"]}.

   Show a loading state while waiting. If the API call fails, fall back

   to a simple local scoring estimate so the screen never breaks.

   Stub the actual API route with placeholder logic for now — I'll

   wire in the real AI call myself afterward.

DESIGN DIRECTION — this matters as much as the functionality:

- Avoid the generic "AI SaaS" look: no purple-to-blue gradient

  backgrounds, no glowing neon cards, no robot/sparkle icons, no

  glassmorphism everywhere. I want this to feel more like a premium

  coaching or fintech product than a sci-fi AI demo.

- Pick ONE confident accent color (not a gradient) and use it

  sparingly and intentionally — for the primary action, the score

  gauge, and small highlights only. Everything else should be a

  restrained neutral palette (near-black text, soft off-white or

  near-black background, muted grays).

- Strong typographic hierarchy: one distinct, slightly characterful

  font for headings, a clean readable one for body text. Generous

  whitespace — don't cram elements together.

- Micro-interactions with purpose: the mic button should have a

  clear, calm pulsing state while recording (not a chaotic bouncy

  animation), transitions between questions should be smooth, and

  the score gauge should animate filling in on the results screen.

- Fully responsive — this needs to look good and be usable on mobile,

  since it may be demoed on a phone.

- Accessible: proper contrast ratios, visible focus states, aria

  labels on the mic button and interactive elements.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0de3c73f-45ef-4f4b-8acd-a70f43e3e201).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
