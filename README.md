# From self-tracking to personalised support

A mobile-first web prototype for the HelloSelf AI Engineer take-home task.

The prototype explores one missed handoff in the member app: moving from self-guided goal tracking to finding human support. It keeps the member's own wording intact, makes numerical progress meaningful through dated notes, and offers an optional, low-commitment route to explore therapist support shaped by member-confirmed preferences. The same journey replaces the abrupt call to get in touch from an empty Sessions screen.

## Run locally

No installation, account, API key, build step, or external service is required.

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

Alternatively, open `index.html` directly in a browser.

## Suggested walkthrough

1. Open **Progress → Plan**.
2. Select **View & track progress** on the clearly labelled fictional goal.
3. Select different dated points to reveal the note attached to each score.
4. Add a backdated score and note. Future dates are deliberately rejected.
5. Return to Progress and select **Add a new Goal**.
6. Enter a goal, record its baseline and add optional context.
7. Choose whether to take the low-commitment matching quiz.
8. Confirm support needs, preferred working style, availability, and whether the goal may be shared.
9. Compare fictional, explainable therapist matches and request an introduction.
10. Visit **Sessions** to see the same quiz offered as a secondary entry point without opening a booking calendar.

## Implementation

- Semantic HTML, responsive CSS and vanilla JavaScript
- No framework or runtime dependency
- Browser `localStorage` for prototype persistence
- Independent dated histories for multiple goals
- Keyboard-accessible chart points and labelled form controls
- Mocked therapist profiles and deterministic results
- No network requests or transmission of member-entered information


## Data and reset

Prototype data is stored only in the current browser's local storage so goals, tracking entries, quiz answers, and choices survive navigation and refreshes. Nothing is transmitted to a server.

To reset the demonstration, open the browser developer console while viewing the prototype and run:

```js
localStorage.removeItem('helloself-goal-support-prototype-v1');
location.reload();
```

## Product narrative

### The moment I chose and why

When I first explored the app, the **Sessions** screen directed me towards getting in touch to book a session. That felt abrupt: before the app had learned anything about why I was there, I was already being moved towards a relatively high-commitment decision. I did not need a calendar first; I needed confidence that the support would feel relevant to me.

I then simulated creating and tracking a goal in **Progress → Plan**. The app explained that research supports self-tracking as a way to help people reach their goals, but the interaction felt slightly self-contained: I entered a goal, gave it a numerical score and received a graph. I was left unsure what had influenced the number, how the record would help me later, and what I could do if I wanted support with that goal. It felt close to maintaining a list on paper rather than being actively supported between sessions.

Those two observations pointed to the same missed moment: the handoff between self-guided reflection and finding human support. The strongest place for that bridge felt like the point immediately after a member records a goal and baseline. At that moment, the app has a member-defined intention and can offer a relevant next step without making assumptions or demanding commitment.

### Key decisions and trade-offs

I made the goal a richer and more useful thread through the member's experience through four focused decisions:

- **Give each score context.** A member can attach an optional note and the date of the experience to every score, including recording something retrospectively when they did not have time in the moment.
- **Make the plot useful for reflection.** Selecting a point reveals the note written for that date, turning the graph into a history of what changed rather than a line of unexplained numbers.
- **Offer a personalised next step without pressure.** After setting a baseline, the member can optionally take a short matching quiz. They confirm the support area, preferred working style and availability, control whether the goal is shared, and see fictional therapist options with an explanation for each suggestion. The quiz does not book or commit them to therapy; it offers an action they can choose based on their goal.
- **Make therapist discovery gentler from Sessions.** I replaced the abrupt route from an empty **Sessions** screen towards getting in touch with an explanation-first journey. Members can understand how matching works, take the same exploratory quiz, see why therapists were suggested, and learn that rematching is possible if the relationship does not feel right. Reusing the quiz keeps personalisation consistent while avoiding two separate matching journeys.

One broader lesson I have taken from working around clinical AI during my PhD is that its most meaningful breakthroughs are likely to come from responsible personalisation. In HelloSelf's context, a member should feel from the beginning that the product is learning what matters to them—their reasoning, motivation and preferences—even before therapy starts. The matching quiz is a deliberately small step in that direction.

I used plain HTML, CSS and JavaScript with local browser persistence. This keeps the prototype runnable without installation, API keys or a backend, and focuses the implementation on the interaction being tested. Therapist data and matching results are intentionally mocked. I left out authentication, production data storage, clinical eligibility and crisis pathways, live therapist availability, payments, booking and a real matching algorithm.

I also preserved free-text goals rather than asking AI to rewrite or clinically interpret them. A goal may carry member-defined or clinician-agreed meaning. Personalisation therefore comes from the member's own dated context and explicit, structured preferences—not from hidden psychological inference.

### How I would measure success

This intervention is primarily about helping new members take the difficult first step into therapy rather than improving long-term retention. Someone may download the app while feeling uncertain, reluctant or anxious about speaking to a therapist; asking them to get in touch immediately may therefore be too large a first action. The quiz introduces a gentler, exploratory step before a booking decision.

I would measure the journey from app download or account creation through quiz start, quiz completion, therapist-profile view, introduction request, first-session booking and first-session attendance. The primary commercial outcome would be the proportion of new members who book a first session, together with the time taken to reach that decision. I would compare this pathway with the existing **Get in touch** experience, ideally through a staged experiment, to learn whether personalisation helps more hesitant members progress.

The member outcome matters just as much as conversion. I would measure confidence in choosing a therapist, perceived relevance of the suggested options, clarity about what happens next, and member-rated fit after the first session. For goal tracking, I would also monitor return-to-goal and update rates, the proportion of scores given useful context, and whether members report a better understanding of what influenced change.

I would monitor guardrails alongside conversion: abandonment, cancellations and no-shows, goal-sharing opt-outs, early rematching, mismatch reports, and whether members describe the invitation as helpful rather than pressuring.

### What I would do next

**Improve the quiz.** I would test the flow with a small number of members and therapists, concentrating on whether notes improve recall and whether the support invitation arrives at the right moment. If the evidence supported it, I would make the quiz personalisation more clinically meaningful by co-designing questions and eligibility rules with clinicians, matching only against verified therapist attributes, evaluating bias and match quality, and making each explanation respond transparently to the member's confirmed answers. I would also add detailed therapist profiles and an easy rematching path.

**Reconsider the welcome experience.** The first experience should not necessarily begin with booking a session. Someone might have downloaded the app following a friend's suggestion or after seeing an advert and may still be exploring. A gentler welcome could ask **“What would feel most useful today?”** and offer routes such as reflecting, setting or revisiting a goal, exploring support, or viewing existing sessions. I did not rebuild the welcome experience because it would expand the prototype beyond the chosen moment.

**Contextualise Check-in.** The **Check-in** button invited me to begin without explaining why it might be useful then, what it would build on, or how it related to my recent activity. After opening it, I was told the conversation would take around 10–15 minutes and was presented with an empty message field. I would make the invitation more contextual—for example, **“Would you like to check in on your goal?”** Companion appears to be a strong part of the app and could be introduced more clearly than through an anonymous button. I did not redesign the conversation because that was outside scope.

**Explore speech analysis.** As a longer-term research direction, I would explore opt-in speech analysis for affective and engagement signals. HelloSelf may already have this capability internally; if so, a carefully designed interface could give members an understandable view of selected signals such as changes in lexical choices, speech rate, pauses or prosody alongside their reflections. Speech analysis is an area in which I have relevant technical experience, and my lab also works in this area. Pre-trained models could accelerate exploration, but they would not establish clinical validity. I would use speech only as a consented, within-person signal that might enrich reflection or clinician review—never as a standalone diagnosis or definitive reading of emotion.

Before production use, each direction would require accessibility, privacy, security and clinical-safety review, including safe routes for people whose needs are outside the service.

### One thing AI tooling got wrong

During exploration, AI suggested interpreting and decomposing the member's free-text goal automatically. I rejected that suggestion because the goal may carry member-defined or clinician-agreed meaning. I instead focused on the moments that felt unsupported when I used the app; the matching-quiz idea came from my own judgement. AI helped me explore alternatives and implement the prototype quickly, but it does not make clinical decisions inside it.
