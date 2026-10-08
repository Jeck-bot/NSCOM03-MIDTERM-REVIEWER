# NSCOM03 Midterm Reviewer

An offline, interactive study kit for the **NSCOM03 (Data Communications) midterm, Modules 1–4 (L01–L04)**. It runs in your browser with no install, no internet and no accounts.

> **Unofficial student-made study aid.** It is not affiliated with or endorsed by the course or the instructor. The lecture slides are **not** included. Use your own copies, as described in [Setup](#setup). Always check against the slides; where the kit and the slides disagree, the slides and your instructor win.

## What's inside
| Tab | What it does |
|---|---|
| **Cram** | Catch up fast: the 17 must-knows of the course, then each lecture's key concepts, terms and traps, then all formulas at the bottom. |
| **Topics** (left sidebar) | Each lecture as a slide-by-slide walkthrough: what the slide says, what it means, why it matters, and a recap per part. A **Summary** view is also available. A **Terms & FAQ** panel on the right shows the definition of any dotted term you point at. |
| **Cheat sheet** | Every formula as a real, color-coded equation with its symbols, when to use it and a slide example, plus the key facts per lecture. The **Recall drill** is the same sheet with blanks to fill in. |
| **Practice** | Endless fresh problems with hints and worked solutions, including drawing line codes and waves with the mouse or a pen. |
| **Visual lab** | Interactive visuals: line codes, scrambling, PCM, delta modulation, Nyquist vs Shannon, sine waves, constellations. |
| **Flashcards** | Spaced-repetition cards for terms and formulas. |
| **Mock exams** | Forms A and B, online or on paper, with answer keys, plus random practice exams. |
| **Diagnostic** | 20 questions that rank the topics from weakest to strongest. |

**Colors follow the unit everywhere:**
- bit rate (bps): blue
- baud rate: orange
- Hz / bandwidth: green
- levels / bits per element: violet
- power / SNR / dB: magenta
- seconds: amber

So you can follow each quantity from the formula into the numbers.

**Ready-made PDFs** (cheat sheet, reviewer, mock exams with keys, drills, essay practice) are in [`StudyKit/pdf/`](StudyKit/pdf).

## Setup
1. **Get the kit.**
   - On this page: **Code → Download ZIP**, then unzip it.
   - Or with git: `git clone https://github.com/Jeck-bot/NSCOM03-MIDTERM-REVIEWER.git`
2. **Open `StudyKit/index.html`** in Chrome or Edge (double-click it). That's it: everything works offline, and your progress is saved in your browser.
3. **Optional: link your own slides.** Each topic page has an **"Open the slides"** button. For it to work, copy the four lecture PDFs from the course (the files your instructor shared) into the `Resources/` folder with exactly these names:

   ```
   NSCOM03-MIDTERM-REVIEWER/
   ├── Resources/
   │   ├── NSCOM03-01 Review of Physical and Data Link Layer.pdf                       (18 slides)
   │   ├── NSCOM03-02 Physical Communication Layer.pdf                                 (39 slides)
   │   ├── NSCOM03-03 Physical Communication Layer - Digital Transmission.pdf          (96 slides)
   │   └── NSCOM03-04 Physical Communication Layer - Digital to Analog Transmission.pdf (31 slides)
   └── StudyKit/
       └── index.html
   ```

   - **Rename your files to match exactly** if yours are named differently.
   - **Slide references** throughout the kit (e.g. `L03 p23`) are page numbers in these PDFs. If your copy has a different number of slides, the references may be off by a few pages.
   - **Never commit or share the slides:** `.gitignore` keeps every file in `Resources/` (except its README) out of git.

## Tips
- **Exam format:**
  - no calculator
  - only one or two problem-solving items
  - mostly concepts, line encodings drawn by hand, and essays answered by drawing and/or explaining
- **Short on time?** Start with **Cram**, then draw the line codes in **Practice**, then do **Mock exam A** on paper.
- **On a phone or narrow window,** the Terms & FAQ panel opens from the floating button.
- **If OneDrive syncs the folder,** right-click it → *Always keep on this device* so it opens offline.

## Status
- **Done:** the full kit (topics with summaries, practice, mocks, flashcards, visual lab, cheat sheet, cram).
- **Slide-by-slide walkthroughs:**
  - Complete for L02 slides 1–19 and L03 slides 1–61 (line coding, block coding, scrambling).
  - Partial for L02 slides 20–39, L03 slides 62–96 and L04.
  - Not yet written for L01.
  - Slides without a walkthrough show a "being written" card that links to the Summary view, which covers every lecture.
- **Animated worked examples:** line-code drawing and baud rate so far; the other worked examples show step-by-step solutions.

## For developers
**Stack:** plain HTML/CSS/JavaScript (no build step, no dependencies), opened from `file://`.
- **Tests:** `cd StudyKit && bash tools/test.sh` (needs Node.js 18+).
  - One walkthrough test currently fails on purpose: L03 slides 62–96 is unfinished, and the test reports the missing slides.
- **Browser self-test:** `bash tools/selftest.sh` (headless Chrome).
- **Regenerate PDFs:** `bash tools/pdf.sh`.
- **Authoring contracts** for content, generators, walkthroughs, animations and the cram sheet are in [`StudyKit/docs/AUTHORING.md`](StudyKit/docs/AUTHORING.md).
