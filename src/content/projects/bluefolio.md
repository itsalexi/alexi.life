---
slug: bluefolio
title: Bluefolio
tagline: >-
  A verified, portfolio-first career network for the Ateneo community. Every
  Atenean gets one link, with the work behind it.
techStack:
  - nextjs
  - tailwind
  - convex
  - typescript
  - vercel
  - playwright
  - vitest
liveUrl: 'https://bluefolio.app'
githubUrl: null
image: /images/projects/bluefolio-featured.webp?v=20261003c
featured: true
order: 1
# the detail page's hero (the home thumbnail keeps `image`)
heroImage: /images/projects/bluefolio-landing.webp
---

## The gist

Bluefolio gives every Atenean one link: `bluefolio.app/@yourname`.

On that page: selected work with covers and the story behind each piece, experience, education, orgs and leadership, awards, and skills. Students and faculty are verified the moment they sign in with their Ateneo Google account. Alumni verify by uploading proof they studied at Ateneo, which an admin reviews.

It launched publicly on October 3, 2026. Mine is at [bluefolio.app/@alexi](https://bluefolio.app/@alexi).

Bluefolio is not affiliated with Ateneo de Manila University.

## Why I built it

Most of what students are proud of never makes it onto a résumé.

The org project that actually shipped. The event you ran. The app with real users. The design work. A résumé has one line for each of those, if that. And when someone says "send me your portfolio," what they usually get is a Drive folder, a few links, and a long message explaining what each one is.

I wanted the answer to "send me your portfolio" to be one link, and I wanted the people on it to be who they say they are.

## Verification

Verification is the whole point, so it had to be both easy and hard to fake.

- **Students and faculty:** instant. Signing in with a `student.ateneo.edu` or `ateneo.edu` Google account is the proof. There's no "which describes you?" screen; the domain already answered it.
- **Alumni:** no school email, so they sign in with any Google account and upload a diploma, alumni ID, or transcript. An admin reviews it. They can build their profile while it's pending; it goes live once approved. The uploaded document is served only to admins through an authenticated endpoint and is deleted once a decision is made.
- **Students who graduate** keep their verified status when they switch to alumni, so they never need the document path.

Once you're verified, your name locks to the one on your account or document. You can fix capitalization, drop a middle name, or lose the diacritics. You can't become someone else.

![Bluefolio landing page](/images/projects/bluefolio-landing.webp)

## Portfolio first, jobs later

There's a full employer side built: verified employers, job posts that always show pay, no fees to applicants, an applicant pipeline, talent search, and teams with an org switcher.

At launch, all of it is hidden behind an admin switch.

An empty job board makes a site look dead. So Bluefolio launches as a portfolio tool, and the board turns on when there are real listings to put on it. Everything underneath is already there; only the switch is off.

![A Bluefolio profile](/images/projects/bluefolio-profile.webp)

## How it's built

Next.js 16 on the App Router, Tailwind CSS 4, and Convex for the database, backend functions, file storage, and crons. Auth is Convex Auth with Google only; the account's domain is checked server-side at sign-in. Hosted on Vercel, with Vercel Web Analytics.

Some of the parts I spent the most time on:

- **A real design system.** Tokens from the design handoff are ported verbatim into CSS variables and exposed through Tailwind. No hard-coded colours or sizes outside the tokens.
- **Visual parity tests.** Playwright renders each screen and the matching design artboard at the same size, desktop and mobile, light and dark, and saves them side by side. Differences get fixed before a screen is done.
- **An image cropper with live preview** for covers and photos, so what you see while cropping is what the page shows.
- **Link previews per profile.** Every public profile gets its own generated share image: logo, name with the verified check, course, headline, and work thumbnails. Unpublished or private profiles get a plain brand card, never the person's details.
- **A security pass before launch.** Security headers on every route, a content security policy that's enforced for the rules nothing can trip over and report-only for the rest, and authorization checked in Convex on every function rather than in the UI.

![The image cropper](/images/projects/bluefolio-cropper.webp)

## What I learned

This is the biggest thing I've shipped, and the part that took longest wasn't a feature. It was deciding what not to show.

The job board is the most "complete product" part of Bluefolio, and it's the part nobody sees on day one. Holding it back felt wrong until I imagined opening the site as a student and finding zero listings. Launching smaller than what's built is a choice I'd make again.

The other lesson is that verification shapes everything downstream. Once names are locked and accounts are real, every other feature can trust its inputs. That's worth the friction of an admin queue.

![The admin verification queue](/images/projects/bluefolio-admin.webp)

Bluefolio is live at [bluefolio.app](https://bluefolio.app).
