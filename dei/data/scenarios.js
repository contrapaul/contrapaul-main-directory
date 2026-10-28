/* ============================================================
   DEI training page: scenario data
   ------------------------------------------------------------
   The committee's nine scenarios, word for word from
   scenarios.md (the source of truth). test/verbatim.test.mjs
   fails if any wording here drifts from that file. To change a
   line, change scenarios.md first, then this file.

   Display rules (Paul, 2026-10-21; see test/parse-scenarios.mjs):
   titles drop "Scenario N: GROUP - ", the context drops its
   label, harm notes drop the leading "*", debriefs drop their
   outer brackets and "Debrief note:" label, group questions drop
   their numbers, and spoken words drop their outer quote marks.

   questions fill the Debrief box under the conversation as a deck
   of cards (2026-10-28). debrief, the committee's note, is kept
   but not shown on the page (Paul, 2026-10-28). Change questions
   in scenarios.md first, then here.

   Each line is one speaker's turn: who (speaker key: t teacher,
   s1 student 1, s2 student 2, s student, g group), label (as
   written), and parts in order:
     { dir }  a bracketed stage direction, shown as a small
              centred note in the chat
     { say }  one chat message. A long turn is split into several
              say parts at sentence breaks; split or join them
              freely, as long as the words and their order stay
              the same (the verbatim test joins them back up).
   Optional on a say part:
     ms: 4000   how long the message stays before the next one
              (otherwise worked out from its length)

   Text is { en, zh }. zh is added when the translation lands;
   until then the page falls back to English.
   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  function t(en) { return { en: en }; }

  window.dei = window.dei || {};
  window.dei.scenarios = [
    {
      id: 'sc1', tab: 'pyp',
      title: t("Nickname"),
      context: t("Peers keep calling a student a nickname they've asked them to stop using."),
      debrief: t("the \"when they ask you to stop, you stop\" line is the whole lesson here."),
      questions: [
        t("Can you lean on school policy to support your discussion about nicknames?"),
        t("Are there signs that a student may not like a nickname others have given them, even if they respond to it?"),
        t("What would you do differently or add to this scenario?")
      ],
      lines: [
        { who: 't', label: t("Teacher"), parts: [
            { dir: t("(to student #1, individually)") },
            { say: t("What's going on? And on a 1–10, how ready are you to talk this out with them?") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("A 6. I just want them to stop.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to student #2, individually)") },
            { say: t("What's the nickname, and what does it mean?") },
            { dir: t("(If it's in another language, ask plainly: \"Translate it for me.\")") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("It's just a joke, it doesn't mean anything bad.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(with both, to student #1)") }, { say: t("Go ahead.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [
            { say: t("I feel disrespected.") },
            { say: t("I've asked you to stop and you keep doing it, and it's worse because I don't even know exactly what it means.") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("What did you hear?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That she doesn't like the name.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("It’s more than that. I heard she felt disrespected because she asked you to stop, and it kept going. Say that back.") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("You feel disrespected because you asked me to stop and I didn't.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("Is that correct?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Yeah.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("Your turn.") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I feel like it started as a friend thing, I didn't think it was a big deal.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Here's the simple rule, though: when someone asks you to stop calling them a name, that's the moment you stop, joke or not") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("Okay. I'll stop it. My bad.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("What's different going forward?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I use her actual name.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("Anything you want to say before we leave this?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I’m sorry") }] }
      ]
    },
    {
      id: 'sc2', tab: 'pyp',
      title: t("Excluded"),
      context: t("A student comes in upset because a group of friends wouldn't let them play. The group says it's \"not their fault.\""),
      debrief: t("watch how the mediator refuses to chase \"whose fault\" and keeps pulling back to impact."),
      questions: [
        t("Why do we think the teacher avoided discussing blame?"),
        t("How might teachers build an inclusive environment while balancing student social dynamics?"),
        t("Does this approach feel realistic for your grade level?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to student #1, individually)") },
            { say: t("You seem really upset, tell me what zone you're in right now?") },
            { say: t("We can wait until you're ready to talk about it.") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("I'm in the blue zone, I can talk about it.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("They said they didn't want to play with me.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(brings student #1 and one or two of the group, not a crowd. To student #1)") },
            { say: t("Tell them how that felt.") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [
            { say: t("I felt left out. You're my friend and you told me to go away in front of everyone.") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to Student #2)") }, { say: t("What did you hear?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I mean, it wasn't just me, everyone said...") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("I'm going to pause you there. I didn't ask whose fault it is. I asked what you heard them say.") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That she felt left out and embarrassed.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("Yes. Did you feel heard?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Yeah.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to student #2)") },
            { say: t("Now your side. Explain using 'I felt,' not 'we didn't.'") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [
            { say: t("I feel like we already had teams and it got awkward, and then it turned into a thing.") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("What'd you hear?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("That the game was already set up and it got weird, not that you hate me.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("So going forward, what do you do when the game's already going and someone wants in?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("We can say 'next round' instead of 'go away.'") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("Anything to close this out?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("You can play with us tomorrow. Sorry it came out mean.") }] }
      ]
    },
    {
      id: 'sc3', tab: 'pyp',
      title: t("\"Don't Play With Them\""),
      context: t("A student overheard a peer telling others not to play with them."),
      debrief: t("PLACEHOLDER, to be added by the team."),
      questions: [
        t("A student says they are only a 4 out of 10. What do you do?"),
        t("The first say-back misses the feeling. How do you help the student say it fully?"),
        t("The real problem started last week. How do you name that without excusing what happened?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to student #1, individually)") },
            { say: t("I saw your face. What did you hear? And on a 1–10, how ready are you to talk about it?") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("A 4. It really stung.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("That's okay. Let's give it a little time. I'll grab you in a bit.") },
            { dir: t("(Later, Student #1 is at a 6.)") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(both at table, to student #1)") }, { say: t("Tell them what that was like.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [
            { say: t("I heard you tell everyone not to play with me. I felt like nobody wanted me around.") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("What did you hear?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That she's upset I said that.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("It’s deeper than that. I heard her say she felt like nobody wanted her. Say that back.") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("You felt like no one wanted you there.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("Does that sound right to you?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Yeah.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(Use a Phoenix apology if it feels appropriate)") }, { say: t("Now you can explain your side.") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I feel like we had a fight last week and I was still mad.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("So the real issue is something from before, and this spilled into recess. Here's the thing, though.") },
            { say: t("Telling a group not to play with someone shuts them out of everything at once.") },
            { say: t("That doesn’t seem fair. What can be done instead?") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("If I'm mad at her, I deal with her, I don't turn people against her.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("Anything to close it?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I shouldn't have said that to everyone. Sorry.") }] }
      ]
    },
    {
      id: 'sc4', tab: 'pyp',
      title: t("\"Boys should lead\""),
      context: t("While picking a team leader, some students argue a boy should lead because \"boys are better leaders.\""),
      debrief: t("This scenario is a discussion to guide, not necessarily a conflict to mediate. Notice the mediator holds a firm boundary 'gender isn't a qualification' while letting students do the reasoning."),
      questions: [
        t("Students say a boy should lead. How do you pause the vote without shutting them down?"),
        t("How do you hold the line that gender isn't a qualification while letting students do the reasoning?"),
        t("What could students use instead to choose a leader?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Let's pause the vote for a second. I want to pick up on something.") },
            { say: t("A few of you said a boy should lead because boys make better leaders.") },
            { say: t("Let's actually think about that out loud. What makes someone a good team leader?") }
          ] },
        { who: 's1', label: t("STUDENT#1"), parts: [{ say: t("Someone organized and listens.") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("Someone who keeps the group on track and is fair.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(writing them up)") },
            { say: t("Good. Organized, listens, fair, keeps people on track. Now here's my question.") },
            { say: t("Which of those is something only a boy can do?") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ dir: t("(pause)") }, { say: t("...None of them.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Right.") },
            { say: t("So when we say 'a boy should lead because boys are better,' we're skipping straight past all the things that actually make a leader and deciding based on gender instead.") },
            { say: t("Is that fair to the girls who might have every one of those qualities?") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("No. Some of the best group organizers in here are girls.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("So here's the standard I want us to hold: leadership is about skills and qualities, not gender.") },
            { say: t("That part's not up for debate. But how we pick, that's yours.") },
            { say: t("How could you choose a leader based on those qualities we listed, instead of on who's a boy or a girl?") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("We could say what job we're doing and who's actually good at organizing that.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Or nominate anyone and say what they'd be good at.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("That's a much stronger way to choose, and it's fair to everyone. Let's run it that way.") },
            { say: t("Nominate someone and give a reason based on the qualities on the board.") }
          ] }
      ]
    },
    {
      id: 'sc5', tab: 'mshs',
      title: t("\"You're So Fat\""),
      context: t("A student made a comment about another student’s body in the cafeteria."),
      debrief: t("the student stopped eating. The mediator honors the low readiness score and names why this kind of comment carries weight."),
      questions: [
        t("The other student says it was just a joke. How do you show why it matters?"),
        t("What if the students wants to let it go and not talk about it? How do you name the harm to the group while also respecting the student wishes?")
        t("What might you do differently in this situation?"),
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to the group in the moment)") },
            { say: t("Hang on. Commenting about someone's body or how much they eat isn't okay.") },
            { say: t("That's the kind of thing that really sticks with a person, so we don't do it here.") },
            { dir: t("(Privately, to student #1)") },
            { say: t("Are you okay? On a 1–10, how ready are you to talk with them?") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ dir: t("(quiet)") }, { say: t("I don't know. Maybe a 3. I just stopped being hungry.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("That tells me it bothered you , and that's why it's important to talk about.") },
            { say: t("We can wait a bit to talk if you want, it's your call.") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("We can talk.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(both, to student #1)") }, { say: t("Tell them what that was like.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [
            { say: t("I felt embarrassed about eating. I just wanted more food and you made it feel like something's wrong with me.") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("What did you hear?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That she got upset over a joke.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("No. It’s deeper than that. I heard her say it made her feel ashamed of eating, so she stopped. Say that back.") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("You felt ashamed and you stopped eating because of what I said.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("Would you say that is accurate?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Yeah.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("Now you can explain your side.") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I thought it was a funny thing to say. I didn't think it'd actually get to her.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Here's the part to remember.") },
            { say: t("Comments about someone's body or eating can stick for a really long time.") },
            { say: t("What can we do differently going forward?") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I keep comments about people's bodies to myself.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("Anything to close it out?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I didn't mean to make you feel bad. I’m sorry. Let’s finish lunch.") }] }
      ]
    },
    {
      id: 'sc6', tab: 'mshs',
      title: t("The Salute"),
      context: t("Student does a 'heil hitler' salute in class."),
      debrief: t("This scenario is about education + boundary, not reconciliation. Notice the mediator accepts \"I didn't know\" without letting it excuse the harm, and carries the teaching themselves."),
      questions: [
        t("A student says they didn't know what the gesture meant. What do you say?"),
        t("How can we address behaviours that are unacceptable but don't target specific students?"),
        t("What you do differently or add on to this scenario?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(calm, firm, to the students)") },
            { say: t("Stop. Put your hands down. What you just did is called a Nazi salute.") },
            { say: t("Why did you do that?") },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("It's just a joke") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("What do you think that gesture means?") },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("I don't know, it's just something people do") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("I believe that you might not fully know what it means, so that's why we're going to talk about it.") },
          ] },
               { say: t("The Nazis killed millions of people for no reason other than they were Jewish, or gay, or disabled, or Polish, or Chinese, or Romani, and on and on.") }
          ] },
            { say: t("Symbols have meaning. When someone makes makes that salute it communicates that they share those values, and agree with what the Nazis did.") },
            { say: t("I don't think you actually believe people should be killed for being different, but that's the message you send when you do that salute.") }
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("We were just messing around.") }] },
  
          ] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("I hear you, but this isn't something people see as 'just messing around'.") },
            { say: t("Someone who doesn't know you and sees it will probably not make the same assumptions I did.") },
       { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("I'll be more careful before I do something like that again.") }] },
          ] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("I'm also going to make sure you learn a bit more about where this comes from") }
          ] }
      ]
    },
    {
      id: 'sc7', tab: 'mshs',
      title: t("Racism"),
      context: t("A student assigned Japan for a research task makes a sweeping negative sterotype about the nation and its people. No Japanese students are present."),
      debrief: t("How do you address harm when there's no victim in the room to advocate for? Notice the mediator makes the absent group the point, and folds it into the academic task rather than turning it into pure discipline."),
      questions: [
        t("A student says it doesn't matter because no one from that country is in the room. What do you say?"),
        t("How do you help a student tell a fact from a stereotype?"),
        t("How can you fold this into the class task instead of treating it only as discipline?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Let's stop there. You just said something about all Japanese people, and it wasn't kind.") },
            { say: t("I want to unpack it, because it matters even though no one here is Japanese.") }
          ] },
        { who: 's', label: t("STUDENT"), parts: [{ say: t("I mean, there's no Japanese kids here, so who cares?") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("That's actually the exact thing I want to touch on.") },
            { say: t("Who we are is what we say when the person it's about isn't in the room.") },
            { say: t("If it's not something you'd say to a Japanese classmate's face, that tells you something.") }
          ] },
        { who: 's', label: t("STUDENT"), parts: [{ say: t("It was just a joke about the country.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("You made a claim about a whole nation and millions of people.") },
            { say: t("Is that a fact you could source, or a stereotype?") }
          ] },
        { who: 's', label: t("STUDENT"), parts: [{ say: t("...A stereotype, I guess.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("Right. And in this class, part of your job is telling the difference. Two things going forward.") },
            { say: t("One, stereotyping a whole country isn't okay here, present or not.") },
            { say: t("Two, your task is to find out what's actually true about Japan and bring me three real things you learned.") },
            { say: t("Sometimes the country you 'got stuck with' turns out to be the most interesting one.") }
          ] }
      ]
    },
    {
      id: 'sc9', tab: 'mshs',
      title: t("\"You're So Gay\""),
      context: t("One student calls another student “gay” meant as an insult in front of the class."),
      debrief: t("the harm reaches beyond the two students. The mediator addresses the room and repairs with the target."),
      questions: [
        t("Student 2 says: \"That he got embarrassed.\" What would you say next?"),
        t("How do you address the whole class, not just the two students?"),
        t("A student says everyone uses the word. What do you say?")
      ],
      lines: [
        { who: 't', label: t("TEACHER"), parts: [
            { dir: t("(to the class, in the moment)") },
            { say: t("Let's pause. Using 'gay' as an insult isn't okay here.") },
            { say: t("It tells people that who someone is, is something to laugh at.") },
            { say: t("That's harmful, and it's not up for debate.") },
            { dir: t("(Then privately, to Student #1)") },
            { say: t("How ready are you to talk with them, 1–10? And you don't owe anyone an explanation around the insult.") }
          ] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Maybe a 5.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(both, to student #1)") }, { say: t("Go ahead.") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [
            { say: t("I felt humiliated.") },
            { say: t("Everyone laughed, and it was like being 'gay' is the worst thing you could call someone. I don’t think it is") }
          ] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("What did you hear?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That he got embarrassed.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("More than just embarrassed.") },
            { say: t("I heard him say it made him feel like who a person is could be used as an insult. Say that back.") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("You felt like I was making being gay a bad thing to be.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #1)") }, { say: t("Is that accurate?") }] },
        { who: 's1', label: t("STUDENT #1"), parts: [{ say: t("Yeah.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ dir: t("(to student #2)") }, { say: t("Your turn.") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I feel like everyone says it, I didn't really think about it.") }] },
        { who: 't', label: t("TEACHER"), parts: [
            { say: t("That's honest, and here's the piece I'll name.") },
            { say: t("Even when a word gets tossed around a lot, using someone's identity as a put-down tells every kid in that room they'd be a punchline too.") },
            { say: t("What can we do differently?") }
          ] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("I stop using it like that.") }] },
        { who: 't', label: t("TEACHER"), parts: [{ say: t("Anything to close it out?") }] },
        { who: 's2', label: t("STUDENT #2"), parts: [{ say: t("That wasn't fair to you, and I'll cut it out.") }] }
      ]
    }
  ];
})();
