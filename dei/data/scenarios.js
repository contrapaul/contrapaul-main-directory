/* ============================================================
   DEI training page: committee scenario content (nine scenarios)
   ------------------------------------------------------------
   Two tabs: PYP (scenarios 1 to 4) and MS/HS (scenarios 5 to 9).
   This file is content, not machinery: tonight's staff review
   edits copy in here only, never the renderers in js/.

   Provenance (decisions, scenarios.md, 2026-10-15): the committee
   text is unedited AI output. Staff review it before it locks.
   House rules applied at transcription:
   - The committee used em dashes. The house rule is none in any
     file, so they became commas, full stops, or ellipses.
   - "1-10" reads as "1 to 10" on the page.
   - Scenario 6's garbled line keeps its asterisks and the
     (Fix text) note, exactly as Paul settled it.
   - Scenario 5's "I just stopped being hungry." is kept as
     written; staff review it tonight.
   - Scenario 9's "I don't think it is" gained a full stop (the
     source is missing one); flagged for the same review.
   - "[name]" stays a labelled placeholder (the renderer adds
     the .ph-tag where the flag is set).

   Chinese: a preliminary translation lands before tonight's
   meeting, the final one after the text locks. Until then every
   zh pair carries the 示例 placeholder, per the i18n rule.
   ============================================================ */
(function () {
  'use strict';

  var ZH = '示例：待翻译';
  function t(en) { return { en: en, zh: ZH }; }

  /* Speaker keys: t = teacher, s1 = student 1, s2 = student 2,
     g = group. The renderer renders the labels. */

  window.dei = window.dei || {};
  window.dei.scenarios = [
    /* ---------- Scenario 1: PYP - Unkind nickname ---------- */
    {
      id: 'sc1', tab: 'pyp', n: 1, total: 4,
      title: t('The unkind nickname'),
      method: t('Mediation script'),
      context: t('Peers keep calling a student a nickname they\'ve asked them to stop using.'),
      lines: [
        { who: 't', dir: t('to student 1, individually'),
          text: t('What\'s going on? And on a 1 to 10, how ready are you to talk this out with them?') },
        { who: 's1', text: t('A 6. I just want them to stop.') },
        { who: 't', dir: t('to student 2, individually. If it\'s in another language, ask plainly: "Translate it for me."'),
          text: t('What\'s the nickname, and what does it mean?') },
        { who: 's2', text: t('It\'s just a joke, it doesn\'t mean anything bad.') },
        { who: 't', dir: t('with both, to student 1'), text: t('Go ahead.') },
        { who: 's1', text: t('I feel disrespected. I\'ve asked you to stop and you keep doing it, and it\'s worse because I don\'t even know exactly what it means.') },
        { who: 't', dir: t('to student 2'), text: t('What did you hear?') },
        { who: 's2', text: t('That she doesn\'t like the name.') },
        { who: 't', text: t('It\'s more than that. I heard she felt disrespected because she asked you to stop, and it kept going. Say that back.') },
        { who: 's2', text: t('You feel disrespected because you asked me to stop and I didn\'t.') },
        { who: 't', dir: t('to student 1'), text: t('Is that correct?') },
        { who: 's1', text: t('Yeah.') },
        { who: 't', dir: t('to student 2'), text: t('Your turn.') },
        { who: 's2', text: t('I feel like it started as a friend thing, I didn\'t think it was a big deal.') },
        { who: 't', text: t('Here\'s the simple rule, though: when someone asks you to stop calling them a name, that\'s the moment you stop, joke or not.') },
        { who: 's2', text: t('Okay. I\'ll stop it. My bad.') },
        { who: 't', text: t('What\'s different going forward?') },
        { who: 's2', text: t('I use her actual name.') },
        { who: 't', text: t('Anything you want to say before we leave this?') },
        { who: 's2', text: t('I\'m sorry.') }
      ],
      readinessChip: 6,
      repeatBacks: [
        { who: 's2', flat: t('That she doesn\'t like the name.'),
          full: t('You feel disrespected because you asked me to stop and I didn\'t.') }
      ],
      rule: t('When someone asks you to stop calling you a name, that\'s the moment you stop, joke or not.'),
      debrief: t('The "when they ask you to stop, you stop" line is the whole lesson here.'),
      elements: ['player', 'rb0', 'debrief']
    },

    /* ---------- Scenario 2: PYP - Excluded at recess ---------- */
    {
      id: 'sc2', tab: 'pyp', n: 2, total: 4,
      title: t('Excluded at recess'),
      method: t('Mediation script'),
      context: t('A student comes in upset. A group of friends wouldn\'t let them play. The group says it\'s "not their fault."'),
      lines: [
        { who: 't', dir: t('to student 1, individually'),
          text: t('You seem really upset. What happened? And on a 1 to 10, how ready are you to talk with them?') },
        { who: 's1', text: t('Like a 5. They said they didn\'t want to play with me.') },
        { who: 't', dir: t('brings student 1 and one or two of the group, not a crowd. To student 1'),
          text: t('Tell them how that felt.') },
        { who: 's1', text: t('I felt left out. You\'re my friend and you told me to go away in front of everyone.') },
        { who: 't', dir: t('to student 2'), text: t('What did you hear?') },
        { who: 's2', text: t('I mean, it wasn\'t just me, everyone...') },
        { who: 't', text: t('I\'m going to pause you there. I didn\'t ask whose fault it is. I asked what you heard them say.') },
        { who: 's2', text: t('That she felt left out and embarrassed.') },
        { who: 't', dir: t('to student 1'), text: t('Yes. Did you feel heard?') },
        { who: 's1', text: t('Yeah.') },
        { who: 't', dir: t('to student 2'), text: t('Now your side. Explain using "I felt," not "we didn\'t."') },
        { who: 's2', text: t('I feel like we already had teams and it got awkward, and then it turned into a thing.') },
        { who: 't', dir: t('to student 1'), text: t('What\'d you hear?') },
        { who: 's1', text: t('That the game was already set up and it got weird, not that you hate me.') },
        { who: 't', text: t('So going forward, what do you do when the game\'s already going and someone wants in?') },
        { who: 's2', text: t('We can say "next round" instead of "go away."') },
        { who: 't', text: t('Anything to close this out?') },
        { who: 's2', text: t('You can play with us tomorrow. Sorry it came out mean.') }
      ],
      readinessChip: 5,
      /* The pause note hangs off the deflection line (index 5). */
      note: { after: 5, text: t('The teacher doesn\'t ask whose fault it is. Pull back to impact.') },
      repeatBacks: [
        { who: 's2', flat: t('I mean, it wasn\'t just me, everyone...'),
          full: t('That she felt left out and embarrassed.') },
        { who: 's1', flat: t('That the game was already set up and it got weird.'),
          full: t('That the game was already set up and it got weird, not that you hate me.') }
      ],
      rule: t('We can say "next round" instead of "go away."'),
      facilitation: t('One or two of the group, not a crowd. It is a facilitation decision the staff should copy.'),
      debrief: t('Watch how the mediator refuses to chase "whose fault" and keeps pulling back to impact.'),
      elements: ['player', 'note', 'rb0', 'rb1', 'debrief']
    },

    /* ---------- Scenario 3: PYP - Don't go play with [name] ---------- */
    {
      id: 'sc3', tab: 'pyp', n: 3, total: 4,
      title: t('Don\'t go play with [name]'),
      phName: true,
      method: t('Mediation script, the readiness check is the lesson'),
      context: t('A student overheard a peer telling others not to play with them.'),
      readyScale: {
        prompt: t('On a 1 to 10, how ready are they to talk about it? Tap any number.'),
        bands: [
          { max: 3, text: t('Give it time. Check back later.') },
          { max: 5, text: t('A little time. Come back when it\'s higher.') },
          { max: 10, text: t('Let\'s talk now.') }
        ],
        path: t('The script\'s path: a 4, later a 6.')
      },
      lines: [
        { who: 't', dir: t('to student 1, individually'),
          text: t('I saw your face. What did you hear? And on a 1 to 10, how ready are you to talk about it?') },
        { who: 's1', text: t('A 4. It really stung.') },
        { who: 't', text: t('That\'s okay. Let\'s give it a little time. I\'ll grab you in a bit.') },
        { who: 't', dir: t('later, student 1 is at a 6'), text: t('') },
        { who: 't', dir: t('both at table, to student 1'), text: t('Tell them what that was like.') },
        { who: 's1', text: t('I heard you tell everyone not to play with me. I felt like nobody wanted me around.') },
        { who: 't', dir: t('to student 2'), text: t('What did you hear?') },
        { who: 's2', text: t('That she\'s upset I said that.') },
        { who: 't', text: t('It\'s deeper than that. I heard her say she felt like nobody wanted her. Say that back.') },
        { who: 's2', text: t('You felt like no one wanted you there.') },
        { who: 't', dir: t('to student 1'), text: t('Does that sound right to you?') },
        { who: 's1', text: t('Yeah.') },
        { who: 't', dir: t('to student 2'), text: t('Now you can explain your side.') },
        { who: 's2', text: t('I feel like we had a fight last week and I was still mad.') },
        { who: 't', text: t('So the real issue is something from before, and this spilled into recess. Here\'s the thing, though. Telling a group not to play with someone shuts them out of everything at once. That doesn\'t seem fair. What can be done instead?') },
        { who: 's2', text: t('If I\'m mad at her, I deal with her, I don\'t turn people against her.') },
        { who: 't', text: t('Anything to close it?') },
        { who: 's2', text: t('I shouldn\'t have said that to everyone. Sorry.') }
      ],
      repeatBacks: [
        { who: 's2', flat: t('That she\'s upset I said that.'),
          full: t('You felt like no one wanted you there.') }
      ],
      rule: t('If you\'re mad at her, deal with her, don\'t turn people against her.'),
      /* The committee wrote no debrief note for this scenario;
         the renderer shows the labelled placeholder prompt. */
      debriefPh: true,
      debrief: t('Placeholder. The committee did not write a debrief note for this scenario. A facilitator prompt goes here when the text is reviewed.'),
      elements: ['ready', 'player', 'rb0', 'debrief']
    },

    /* ---------- Scenario 4: PYP - A boy should lead ---------- */
    {
      id: 'sc4', tab: 'pyp', n: 4, total: 4,
      title: t('A boy should lead'),
      method: t('Guided discussion, not mediation'),
      context: t('While picking a team leader, some students argue a boy should lead because "boys are better leaders."'),
      board: {
        prompt: t('What makes someone a good team leader?'),
        items: [t('Organized'), t('Listens'), t('Fair'), t('Keeps people on track')],
        turn: t('Which of those is something only a boy can do?'),
        answer: t('"...None of them."'),
        flipBack: t('Anyone can do this.')
      },
      boundary: t('Leadership is about skills and qualities, not gender. That part\'s not up for debate.'),
      solutions: [
        t('Nominate anyone and say why: what they\'d be good at.'),
        t('Say what job we\'re doing and who\'s actually good at organizing that.')
      ],
      contrast: t('The only PYP scenario with no second student.'),
      debrief: t('This scenario is a discussion to guide, not necessarily a conflict to mediate. Notice the mediator holds a firm boundary, "gender isn\'t a qualification", while letting students do the reasoning.'),
      elements: ['q0', 'q1', 'q2', 'q3', 'f0', 'f1', 'f2', 'f3', 'boundary', 'debrief']
    },

    /* ---------- Scenario 5: MS/HS - You're such a glutton ---------- */
    {
      id: 'sc5', tab: 'mshs', n: 1, total: 5,
      title: t('You\'re such a glutton, you\'re so fat'),
      method: t('Mediation script, name the harm first'),
      context: t('A student made a comment on another student\'s body in the cafeteria.'),
      harm: t('Name the harm first. A body shaming comment. The student stopped eating.'),
      /* The first beat plays out on the readiness branch screen:
         the in the moment line, the quiet 3, and the choice. */
      beat: {
        lines: [
          { who: 't', dir: t('to the group, in the moment'),
            text: t('Hang on. Commenting on someone\'s body or how much they eat isn\'t okay. That\'s the kind of thing that really sticks with a person, so we don\'t do it here.') },
          { who: 't', dir: t('privately, to student 1'),
            text: t('Are you okay? On a 1 to 10, how ready are you to talk with them?') },
          { who: 's1', dir: t('quiet'),
            text: t('I don\'t know. Maybe a 3. I just stopped being hungry.') }
        ],
        choice: t('That tells me it hit hard, and that\'s exactly why it\'s worth naming. We can wait a bit if you want, or take it slow together. Your call.'),
        options: [
          { label: t('Mediate now'),
            result: t('The script doesn\'t go this way. The student is at a 3, and pushing now would be exactly the move the method refuses.') },
          { label: t('Go slow together'), good: true,
            result: t('This matches the script. The student answers: "We can talk. Slow." The teacher honors the low score instead of pushing.') },
          { label: t('Wait a bit'),
            result: t('Available in the script, but the student just asked to talk. Waiting now would ignore the request in front of the room.') }
        ],
        resume: { who: 's1', text: t('We can talk. Slow.') }
      },
      lines: [
        { who: 't', dir: t('both, to student 1'), text: t('Tell them what that was like.') },
        { who: 's1', text: t('I felt embarrassed about eating. I just wanted more food and you made it feel like something\'s wrong with me.') },
        { who: 't', dir: t('to student 2'), text: t('What did you hear?') },
        { who: 's2', text: t('That she got upset over a joke.') },
        { who: 't', text: t('No. It\'s deeper than that. I heard her say it made her feel ashamed of eating, so she stopped. Say that back.') },
        { who: 's2', text: t('You felt ashamed and you stopped eating because of what I said.') },
        { who: 't', dir: t('to student 1'), text: t('Would you say that is accurate?') },
        { who: 's1', text: t('Yeah.') },
        { who: 't', dir: t('to student 2'), text: t('Now you can explain your side.') },
        { who: 's2', text: t('I thought it was a funny thing to say. I didn\'t think it\'d actually get to her.') },
        { who: 't', text: t('Here\'s the part to remember. Comments about someone\'s body or eating can stick for a really long time. Longer than you\'d guess. What can we do differently going forward?') },
        { who: 's2', text: t('I keep comments about people\'s bodies to myself.') },
        { who: 't', text: t('Anything to close it out?') },
        { who: 's2', text: t('I didn\'t mean to make you feel bad. I\'m sorry. Let\'s finish lunch.') }
      ],
      repeatBacks: [
        { who: 's2', flat: t('That she got upset over a joke.'),
          full: t('You felt ashamed and you stopped eating because of what I said.') }
      ],
      rule: t('I keep comments about people\'s bodies to myself.'),
      note2: t('Comments about someone\'s body or eating can stick for a really long time. Longer than you\'d guess.'),
      debrief: t('The student stopped eating. The mediator honors the low readiness score and names why this kind of comment carries weight.'),
      elements: ['choice', 'player', 'rb0', 'debrief']
    },

    /* ---------- Scenario 6: MS/HS - Hitler salute ---------- */
    {
      id: 'sc6', tab: 'mshs', n: 2, total: 5,
      title: t('The Hitler salute ("I don\'t know what it means")'),
      method: t('Education and boundary'),
      context: t('A student does the Hitler salute in class.'),
      harm: t('Not a two sided conflict. Name the harm first, then teach. There is no student 2. The target is a whole community.'),
      lines: [
        { who: 't', dir: t('calm, firm, to the students'),
          text: t('Stop. Put your hands down. What you just did is called a Nazi salute. It stands for the murder of millions of people. Jewish people, and many others. That\'s not something we do here, even as a joke, and that\'s not up for debate.') },
        { who: 's1', text: t('I swear I didn\'t know what it meant.') },
        { who: 't', fix: true,
          text: t('I believe that you might not have. That\'s exactly why we\'re going to talk about it. So now you do know. *Not knowing why we teach it.* (Fix text) It\'s not a reason to laugh it off.') },
        { who: 't', dir: t('to the group'),
          text: t('Here\'s what I need you to understand. Some symbols carry real weight because real people were hurt by them. When you do that and laugh, anyone watching who lost family to that history feels it like a punch. You may not have meant that, but that\'s the impact.') },
        { who: 's1', text: t('We were just messing around.') },
        { who: 't',
          text: t('I hear that there was no hateful intent. And the salute still causes harm no matter the intent, which is why it stops now and doesn\'t come back. Going forward, what do you do if you see a symbol or gesture and you don\'t know what it means?') },
        { who: 's1', text: t('Ask an adult instead of copying it.') },
        { who: 't', text: t('Exactly. I\'m also going to make sure you learn a bit more about where this comes from, because this one matters.') }
      ],
      choice: {
        prompt: t('A student does a symbol or gesture they don\'t know the meaning of. What do they do?'),
        options: [
          { label: t('Copy it, it\'s funny'),
            result: t('It lands like a punch on anyone who lost family to that history.') },
          { label: t('Laugh it off'),
            result: t('Same impact. The gesture still carries the history.') },
          { label: t('Ask an adult first'), good: true,
            result: t('The move in the script. It leads to learning where it comes from.') }
        ]
      },
      debrief: t('This scenario is about education and boundary, not reconciliation. Notice the mediator accepts "I didn\'t know" without letting it excuse the harm, and carries the teaching themselves.'),
      elements: ['player', 'choice', 'debrief']
    },

    /* ---------- Scenario 7: MS/HS - Racist remarks ---------- */
    {
      id: 'sc7', tab: 'mshs', n: 3, total: 5,
      title: t('Racist remarks'),
      method: t('Teaching and task'),
      context: t('A student assigned Japan for a research task makes a sweeping negative stereotype about the nation and its people. No Japanese students are present.'),
      harm: t('No Japanese students in the room. That\'s the point.'),
      lines: [
        { who: 't',
          text: t('Let\'s stop there. You just said something about all Japanese people, and it wasn\'t kind. I want to unpack it, because it matters even though no one here is Japanese.') },
        { who: 's1', text: t('I mean, there\'s no Japanese kids here, so who cares?') },
        { who: 't',
          text: t('That\'s actually the exact thing I want to touch on. Who we are is what we say when the person it\'s about isn\'t in the room. If it\'s not something you\'d say to a Japanese classmate\'s face, that tells you something.') },
        { who: 's1', text: t('It was just a joke about the country.') },
        { who: 't',
          text: t('You made a claim about a whole nation and millions of people. Is that a fact you could source, or a stereotype?') },
        { who: 's1', text: t('...A stereotype, I guess.') },
        { who: 't',
          text: t('Right. And in this class, part of your job is telling the difference. Two things going forward. One, stereotyping a whole country isn\'t okay here, present or not. Two, your task is to find out what\'s actually true about Japan and bring me three real things you learned. Sometimes the country you "got stuck with" turns out to be the most interesting one.') }
      ],
      fact: {
        claim: t('A sweeping negative claim about a whole nation and its people.'),
        options: [t('A fact I could source'), t('A stereotype')],
        goodIndex: 1,
        reveal: t('That\'s a stereotype. Telling the difference is part of your job in this class.')
      },
      forward: t('The forward move folds into the academic task, not discipline: find out what\'s actually true about Japan, and bring three real things you learned.'),
      debrief: t('How do you address harm when there\'s no victim in the room to advocate for? Notice the mediator makes the absent group the point, and folds it into the academic task rather than turning it into pure discipline.'),
      elements: ['player', 'fact', 'debrief']
    },

    /* ---------- Scenario 8: MS/HS - Truth or dare ---------- */
    {
      id: 'sc8', tab: 'mshs', n: 4, total: 5,
      title: t('Truth or dare: "Would you kiss [name]?"'),
      phName: true,
      method: t('Redirect'),
      context: t('A group is playing truth or dare. One student is asked "would you kiss [name]?". You intervene before they answer. The named student may or may not be present.'),
      tone: t('Light, not alarmed. You\'re redirecting, not punishing.'),
      lines: [
        { who: 't', dir: t('light, not alarmed. You\'re redirecting, not punishing.'),
          text: t('Stop. Hang on a sec. I heard the dare. I\'m going to jump in before anyone answers.') },
        { who: 's1', text: t('It\'s just truth or dare, we\'re not making trouble.') },
        { who: 't',
          text: t('The game\'s fine. I\'m not shutting it down. Here\'s my one issue. The dare put the other person into it without them here to have any say. Answering it either way, yes or no, ends up being about their body and their feelings, and they didn\'t sign up for that.') },
        { who: 's1', text: t('We weren\'t being mean though.') },
        { who: 't',
          text: t('I believe you weren\'t trying to. But think about it impacting them. If they heard it, they\'d probably be really embarrassed. And if they didn\'t hear it, now there\'s a story going around about who\'d kiss who and that always finds its way back to the person. Neither one\'s fair to them.') },
        { who: 's2', dir: t('relieved'), text: t('Yeah, I didn\'t really want to answer that.') },
        { who: 't',
          text: t('That\'s the other thing. You got put on the spot too. So, here\'s the easy fix. Keep playing, keep it about you all. Dares, silly stuff, questions about yourselves. Just leave other people who aren\'t in the game out of it. Deal?') },
        { who: 'g', text: t('Deal.') }
      ],
      dares: [
        { text: t('Would you do a backflip?'), verdict: 'keep',
          reason: t('About the people playing. The dare stays inside the game.') },
        { text: t('What\'s the worst thing you\'ve ever done?'), verdict: 'keep',
          reason: t('Still about the person who was asked. Their own story, their choice.') },
        { text: t('Would you kiss [name]?'), verdict: 'cut', phName: true,
          reason: t('Pulls in someone who isn\'t in the game, about their body and their feelings.') },
        { text: t('Would you text [name]?'), verdict: 'cut', phName: true,
          reason: t('Pulls in someone who isn\'t in the game, and starts a story that will find its way back to them.') }
      ],
      rule: t('Keep it about the people playing.'),
      debrief: t('This one "looks like fun", so the instinct is to walk past it, but that can still do harm. Notice the mediator preserves the game and gives a clean, usable rule: "keep it about the people playing."'),
      elements: ['player', 'd0', 'd1', 'd2', 'd3', 'debrief']
    },

    /* ---------- Scenario 9: MS/HS - "You're so gay" ---------- */
    {
      id: 'sc9', tab: 'mshs', n: 5, total: 5,
      title: t('"You\'re so gay" (as an insult)'),
      method: t('Mediation script, name the harm first'),
      context: t('One student calls another student "gay" meant as an insult in front of the class.'),
      harm: t('Uses an identity as an insult. It harms the target and every LGBTQ+ student in earshot.'),
      /* The in the moment class line plays as a static callout on
         screen 2, with the readiness chip and the note. */
      classLine: { who: 't', dir: t('to the class, in the moment'),
        text: t('Let\'s pause. Using "gay" as an insult isn\'t okay here. It tells people that who someone is, is something to laugh at. That\'s harmful, and it\'s not up for debate.') },
      readinessChip: 5,
      momentNote: t('You don\'t owe anyone an explanation around the insult.'),
      lines: [
        { who: 't', dir: t('with both, to student 1'), text: t('Go ahead.') },
        { who: 's1', text: t('I felt humiliated. Everyone laughed, and it was like being "gay" is the worst thing you could call someone. I don\'t think it is.') },
        { who: 't', dir: t('to student 2'), text: t('What did you hear?') },
        { who: 's2', text: t('That he got embarrassed.') },
        { who: 't', text: t('More than just embarrassed. I heard him say it made him feel like who a person is could be used as an insult. Say that back.') },
        { who: 's2', text: t('You felt like I was making being gay a bad thing to be.') },
        { who: 't', dir: t('to student 1'), text: t('Is that accurate?') },
        { who: 's1', text: t('Yeah.') },
        { who: 't', dir: t('to student 2'), text: t('Your turn.') },
        { who: 's2', text: t('I feel like everyone says it, I didn\'t really think about it.') },
        { who: 't',
          text: t('That\'s honest, and here\'s the piece I\'ll name. Even when a word gets tossed around a lot, using someone\'s identity as a put-down tells every kid in that room they\'d be a punchline too. What can we do differently?') },
        { who: 's2', text: t('I stop using it like that.') },
        { who: 't', text: t('Anything to close it out?') },
        { who: 's2', text: t('That wasn\'t fair to you. I\'ll cut it out.') }
      ],
      repeatBacks: [
        { who: 's2', flat: t('That he got embarrassed.'),
          full: t('You felt like I was making being gay a bad thing to be.') }
      ],
      rule: t('I stop using it like that.'),
      note2: t('Even when a word gets tossed around a lot, using someone\'s identity as a put-down tells every kid in the room they\'d be a punchline too.'),
      debrief: t('The harm reaches beyond the two students. The mediator addresses the room and repairs with the target.'),
      elements: ['player', 'rb0', 'debrief']
    }
  ];
})();
