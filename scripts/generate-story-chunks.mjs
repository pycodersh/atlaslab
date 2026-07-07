/**
 * Generates saveCandidates for all 500 story paragraphs.
 * Run: node scripts/generate-story-chunks.mjs
 * Output: data/story-chunks.ts
 */

import fs from 'fs'

// ─────────────────────────────────────────────────────────────────────────────
// Chunk dictionary: ordered by priority (highest first within same type)
// Each entry: { text, type }
// Matching is case-insensitive; offsets are recorded in original case.
// ─────────────────────────────────────────────────────────────────────────────

const PHRASAL_VERBS = [
  // 3-word phrasal verbs (match before 2-word)
  'looking forward to', 'looked forward to', 'look forward to',
  'looking up to', 'looked up to', 'look up to',
  'looking down on', 'looked down on', 'look down on',
  'coming up with', 'came up with', 'come up with',
  'putting up with', 'put up with',
  'getting rid of', 'got rid of', 'get rid of',
  'taking care of', 'took care of', 'take care of',
  'running out of', 'ran out of', 'run out of',
  'keeping up with', 'kept up with', 'keep up with',
  'catching up with', 'caught up with', 'catch up with',
  'making up for', 'made up for', 'make up for',
  'giving up on', 'gave up on', 'give up on',
  'holding on to', 'held on to', 'hold on to',
  'living up to', 'lived up to', 'live up to',
  'standing up for', 'stood up for', 'stand up for',
  'going along with', 'went along with', 'go along with',
  'getting along with', 'got along with', 'get along with',
  'ended up with', 'ends up with', 'end up with',
  'dealing with', 'dealt with', 'deal with',
  // 2-word phrasal verbs — base + past + -ing
  'giving up', 'gave up', 'given up', 'give up',
  'picking up', 'picked up', 'pick up',
  'putting on', 'put on',
  'taking off', 'took off', 'take off',
  'turning on', 'turned on', 'turn on',
  'turning off', 'turned off', 'turn off',
  'turning up', 'turned up', 'turn up',
  'turning down', 'turned down', 'turn down',
  'looking up', 'looked up', 'look up',
  'looking back', 'looked back', 'look back',
  'looking around', 'looked around', 'look around',
  'finding out', 'found out', 'find out',
  'figuring out', 'figured out', 'figure out',
  'working out', 'worked out', 'work out',
  'coming out', 'came out', 'come out',
  'going out', 'went out', 'go out',
  'getting out', 'got out', 'get out',
  'sitting down', 'sat down', 'sit down',
  'standing up', 'stood up', 'stand up',
  'showing up', 'showed up', 'show up',
  'waking up', 'woke up', 'wake up',
  'getting up', 'got up', 'get up',
  'setting up', 'set up',
  'setting off', 'set off',
  'moving on', 'moved on', 'move on',
  'moving out', 'moved out', 'move out',
  'moving in', 'moved in', 'move in',
  'going back', 'went back', 'go back',
  'coming back', 'came back', 'come back',
  'getting back', 'got back', 'get back',
  'stepping back', 'stepped back', 'step back',
  'holding back', 'held back', 'hold back',
  'going on', 'went on', 'go on',
  'carrying on', 'carried on', 'carry on',
  'keeping on', 'kept on', 'keep on',
  'running into', 'ran into', 'run into',
  'bumping into', 'bumped into', 'bump into',
  'taking on', 'took on', 'take on',
  'taking out', 'took out', 'take out',
  'taking over', 'took over', 'take over',
  'taking place', 'took place', 'take place',
  'making sense', 'made sense', 'make sense',
  'making sure', 'made sure', 'make sure',
  'feeling like', 'felt like', 'feel like',
  'seeming like', 'seemed like', 'seem like',
  'looking like', 'looked like', 'look like',
  'sounding like', 'sounded like', 'sound like',
  'getting used to', 'got used to', 'get used to',
  'used to',
  'trying out', 'tried out', 'try out',
  'trying on', 'tried on', 'try on',
  'starting over', 'started over', 'start over',
  'ending up', 'ended up', 'end up',
  'growing up', 'grew up', 'grow up',
  'slowing down', 'slowed down', 'slow down',
  'calming down', 'calmed down', 'calm down',
  'breaking down', 'broke down', 'break down',
  'breaking up', 'broke up', 'break up',
  'building up', 'built up', 'build up',
  'reaching out', 'reached out', 'reach out',
  'working on', 'worked on', 'work on',
  'checking in', 'checked in', 'check in',
  'checking out', 'checked out', 'check out',
  'signing up', 'signed up', 'sign up',
  'falling asleep', 'fell asleep', 'fall asleep',
  'falling apart', 'fell apart', 'fall apart',
  'falling behind', 'fell behind', 'fall behind',
  'falling in love', 'fell in love', 'fall in love',
  'bringing up', 'brought up', 'bring up',
  'bringing back', 'brought back', 'bring back',
  'cutting off', 'cut off',
  'leaving out', 'left out', 'leave out',
  'leaving behind', 'left behind', 'leave behind',
  'putting off', 'put off',
  'putting down', 'put down',
  'putting away', 'put away',
  'thinking about', 'thought about', 'think about',
  'caring about', 'cared about', 'care about',
  'worrying about', 'worried about', 'worry about',
  'talking about', 'talked about', 'talk about',
  'hearing about', 'heard about', 'hear about',
  'learning about', 'learned about', 'learn about',
  'going through', 'went through', 'go through',
  'getting through', 'got through', 'get through',
  'looking through', 'looked through', 'look through',
  'walking through', 'walked through', 'walk through',
  'waiting for', 'waited for', 'wait for',
  'asking for', 'asked for', 'ask for',
  'looking for', 'looked for', 'look for',
  'hoping for', 'hoped for', 'hope for',
  'listening to', 'listened to', 'listen to',
  'talking to', 'talked to', 'talk to',
  'belonging to', 'belonged to', 'belong to',
  'leading to', 'led to', 'lead to',
  'depending on', 'depended on', 'depend on',
  'focusing on', 'focused on', 'focus on',
  'counting on', 'counted on', 'count on',
  'relying on', 'relied on', 'rely on',
  'agreeing with', 'agreed with', 'agree with',
  'helping with', 'helped with', 'help with',
  'starting with', 'started with', 'start with',
  'beginning with', 'began with', 'begin with',
  'staying in', 'stayed in', 'stay in',
  'staying up', 'stayed up', 'stay up',
  'staying out', 'stayed out', 'stay out',
  'circling back', 'circled back', 'circle back',
  'splitting into', 'split into',
  'catching up', 'caught up', 'catch up',
  'hanging out', 'hung out', 'hang out',
  'hanging on', 'hung on', 'hang on',
  'pouring out', 'poured out', 'pour out',
  'passing by', 'passed by', 'pass by',
  'passing on', 'passed on', 'pass on',
  'pointing to', 'pointed to', 'point to',
  'pointing out', 'pointed out', 'point out',
  'come with', 'came with', 'comes with',
  'going with', 'went with', 'go with',
  'sticking with', 'stuck with', 'stick with',
  'fitting in', 'fit in', 'fitted in',
  'fitting perfectly', 'fits perfectly', 'fit perfectly',
  'clicking with', 'clicked with', 'click with',
  'drifting toward', 'drifted toward', 'drift toward',
  'pulling up', 'pulled up', 'pull up',
  'paying off', 'paid off', 'pay off',
  'closing in', 'closed in', 'close in',
  'opening up', 'opened up', 'open up',
  'clearing up', 'cleared up', 'clear up',
  'summing up', 'summed up', 'sum up',
  'wrapping up', 'wrapped up', 'wrap up',
  'catching on', 'caught on', 'catch on',
  // additional phrasal verbs from uncovered analysis
  'coming down with', 'came down with', 'come down with',
  'watch out for', 'watch out',
  'pulling over', 'pulled over', 'pull over',
  'warming up', 'warmed up', 'warm up',
  'stretching out', 'stretched out', 'stretch out',
  'saving up for', 'saved up for', 'save up for',
  'saving up', 'saved up', 'save up',
  'acting up', 'acted up', 'act up',
  'logging in', 'logged in', 'log in',
  'putting through', 'put through',
  'following up on', 'followed up on', 'follow up on',
  'following up', 'followed up', 'follow up',
  'backing up', 'backed up', 'back up',
  'lighting up', 'lit up', 'light up',
  'touching base', 'touched base', 'touch base',
  'falling apart', 'fell apart', 'fall apart',
  'swamped with',
  'dealing with', 'dealt with', 'deal with',
  'blown out of proportion',
  'putting you through', 'put you through',
  'apologizing for', 'apologized for', 'apologize for',
  'rolling up', 'rolled up', 'roll up',
  'backing out', 'backed out', 'back out',
  'digging in', 'dug in', 'dig in',
  'putting behind us', 'put behind us', 'put this behind',
  'having over', 'had over',
  'getting going', 'got going', 'get going',
  'calling it', 'call it',
  'comparing notes', 'compare notes',
  'taking the lead', 'took the lead', 'take the lead',
  'connecting to', 'connected to', 'connect to',
  'arriving in', 'arrived in', 'arrive in',
  'peeling potatoes', 'peeled potatoes',
]

const PREP_PHRASES = [
  'as soon as', 'as long as', 'as much as', 'as well as', 'as far as',
  'as a result', 'as a matter of fact', 'as if', 'as though',
  'at the end of', 'at the beginning of', 'at the same time', 'at first',
  'at last', 'at least', 'at most', 'at once', 'at all',
  'in front of', 'in spite of', 'in the middle of', 'in addition to',
  'in order to', 'in case of', 'in fact', 'in general', 'in the end',
  'in the morning', 'in the afternoon', 'in the evening', 'in the night',
  'in the past', 'in the future', 'in the meantime', 'in a way',
  'for the first time', 'for a while', 'for a long time', 'for now',
  'for example', 'for instance', 'for sure', 'for good', 'for once',
  'for a whole', 'for a reason', 'for some reason',
  'on the way', 'on the other hand', 'on time', 'on purpose',
  'one by one', 'day by day', 'step by step', 'little by little',
  'more and more', 'less and less',
  'from now on', 'from time to time',
  'once in a while',
  'all of a sudden', 'all the time', 'all at once',
  'right away', 'right now', 'right here', 'right there',
  'no matter what', 'no matter how',
  'a lot of', 'a little bit', 'a few times',
  'so far', 'so much', 'so many',
  'even though', 'even if', 'even when',
  'instead of', 'because of', 'thanks to', 'due to',
  'on my own', 'on your own', 'on his own', 'on her own', 'on its own',
  'by myself', 'by yourself', 'by himself', 'by herself',
  'at the moment', 'at this point', 'at that point',
  'to be honest', 'to be fair', 'to be clear',
  'after all', 'above all', 'after a while',
  'next to', 'close to', 'far from', 'apart from',
  'by the window', 'by the door', 'by the end',
  'for a moment', 'for a second', 'for a minute',
  'in a moment', 'in a few minutes', 'in a hurry',
  'at the table', 'at the counter', 'at the door',
  'no wonder', 'no problem', 'no doubt',
  'on the phone', 'on the street', 'on the floor', 'on the wall',
  'out of nowhere', 'out of the way', 'out of habit',
  'in the back', 'in the front', 'in the corner', 'in the middle',
  'over and over', 'again and again',
  'back and forth',
  'all at once', 'all the same',
  'just in case', 'just in time',
  'at a time', 'one at a time',
  'a long time', 'a short time', 'a little time',
  'the best part', 'the hard part', 'the easy part',
  'the right thing', 'the wrong thing',
  'in silence', 'in peace', 'in trouble',
  'by end of day', 'by the end of the day', 'end of day',
  'by total accident', 'by accident', 'by chance',
  'out loud', 'out of nowhere',
  'in the back', 'in the back of',
  'back to back', 'back-to-back',
  'two business days',
  'within thirty days',
  'either way',
  'long story short',
  'on the other hand',
  'in the wrong size',
  'within a minute',
  'on the same page',
  'in the right direction',
  'at the corner',
  'just around the corner',
  'under pressure',
  'calm under pressure',
  'behind on',
  'behind on my',
  'out of proportion',
  'one of those days',
  'on me tonight', 'on me',
  'over each other',
  'with no luck',
  'by tonight',
  'by noon',
  'by Friday',
  'by Thursday',
  'I\'ll put you through',
  'I apologize for the wait',
  'within fifteen minutes', 'within five minutes', 'within ten minutes',
  'within a few days', 'within a week',
  'due on Friday', 'due on Thursday', 'due on Monday',
  'in about twenty minutes', 'in about ten minutes', 'in about two hours',
  'in three days', 'in two days',
  'for a quick break',
  'after five',
  'around five',
  'one terminal over',
]

const COLLOCATIONS = [
  // make + noun
  'made a decision', 'make a decision', 'make a choice', 'made a choice',
  'make a difference', 'made a difference',
  'make a mistake', 'made a mistake',
  'make a plan', 'made a plan', 'make a promise', 'made a promise',
  'make progress', 'made progress',
  'make friends', 'made friends',
  'make time', 'made time', 'make sure', 'made sure',
  // take + noun
  'took a break', 'take a break',
  'took a step', 'take a step',
  'took a walk', 'take a walk',
  'took a look', 'take a look',
  'took a chance', 'take a chance',
  'took a deep breath', 'take a deep breath',
  'took time', 'take time', 'took action', 'take action',
  'took notes', 'take notes', 'took care', 'take care', 'took turns', 'take turns',
  // have + noun
  'had a conversation', 'have a conversation',
  'had a chance', 'have a chance',
  'had a look', 'have a look',
  'had fun', 'have fun', 'had time', 'have time',
  'had a feeling', 'have a feeling',
  'had a problem', 'have a problem',
  'had a habit', 'have a habit',
  'had a big presentation', 'have a big presentation',
  // get + adj
  'got better', 'get better', 'got worse', 'get worse',
  'got tired', 'get tired', 'got excited', 'get excited',
  'got ready', 'get ready', 'got nervous', 'get nervous',
  'got angry', 'get angry', 'got lost', 'get lost',
  'got home', 'get home', 'got started', 'get started',
  // keep + noun/adj
  'keep going', 'kept going', 'keep trying', 'kept trying',
  'keep quiet', 'kept quiet', 'keep in touch', 'kept in touch',
  'keep a journal', 'kept a journal',
  'keep a promise', 'kept a promise',
  'keep calm', 'kept calm',
  // do + noun
  'did research', 'do research',
  // feel + adj
  'felt better', 'feel better', 'felt worse', 'feel worse',
  'felt comfortable', 'feel comfortable',
  'felt confident', 'feel confident',
  'felt nervous', 'feel nervous',
  'felt happy', 'feel happy', 'felt tired', 'feel tired',
  'felt proud', 'feel proud', 'felt relieved', 'feel relieved',
  'felt calm', 'feel calm', 'felt safe', 'feel safe',
  // stay + adj
  'stayed positive', 'stay positive',
  'stayed focused', 'stay focused',
  'stayed calm', 'stay calm',
  'stayed quiet', 'stay quiet',
  'stayed warm', 'stay warm',
  // common adj+noun
  'hard work', 'good job', 'small steps', 'fresh start', 'deep breath',
  'strong feeling', 'quiet moment', 'right time', 'long time',
  'new start', 'good friend', 'best friend', 'old friend',
  'busy day', 'every day', 'every time', 'every night',
  'small kindness', 'simple task', 'warm smile', 'short break',
  'new place', 'new job', 'new beginning',
  // want / need / try + to
  'wanted to', 'want to', 'wants to',
  'needed to', 'need to', 'needs to',
  'tried to', 'try to', 'tries to',
  'decided to', 'decide to',
  'started to', 'start to',
  'began to', 'begin to',
  'managed to', 'manage to',
  'seemed to', 'seem to',
  'happened to', 'happen to',
  'tended to', 'tend to',
  'supposed to',
  'used to',
  'meant to',
  'had to', 'have to', 'has to',
  'ought to',
  // worth + -ing
  'worth trying', 'worth doing', 'worth it',
  // additional collocations
  'happy to help', 'happy to',
  'easy to', 'hard to', 'good to',
  'hard part', 'easy part',
  'right answer', 'right place', 'right person',
  'funny face', 'made a funny face',
  'new faces', 'new streets', 'new mornings',
  'walked me through', 'walk me through',
  'out loud', 'said out loud',
  'fits perfectly', 'fit perfectly',
  'energy shift', 'feel the energy',
  'pull up a chair', 'pulled up a chair',
  'a whole week', 'a whole month', 'a whole year',
  'total accident',
  'house special',
  'fitting room',
  'free returns',
  'new tracking',
  'happy to help',
  'that worked', 'that works',
  'said that worked',
  // more collocations from uncovered analysis
  'do the dishes', 'did the dishes',
  'brush your teeth', 'brushed your teeth',
  'do the laundry',
  'experience in', 'have experience',
  'majoring in', 'major in',
  'catch up on', 'caught up on',
  'drive me crazy', 'drives me crazy', 'drove me crazy',
  'drive you crazy',
  'miss it', 'missed it',
  'hit the spot',
  'keep the change', 'kept the change',
  'come to mind', 'came to mind',
  'take a breath', 'took a breath',
  'calm under pressure', 'stay calm under pressure',
  'take it easy',
  'give me a boost', 'gave me a boost',
  'real boost', 'real confidence',
  'I\'ll let you know', 'let you know',
  'clear everything up', 'clear it up',
  'log in to', 'logged in to',
  'apologize for the wait',
]

const CHUNKS = [
  // I + modal / aux
  "I'd like to", "I'd love to", "I'd rather", "I'd been",
  "I'm going to", "I'm trying to", "I'm thinking about", "I'm looking forward to",
  "I'm not sure", "I'm pretty sure", "I'm so glad", "I'm so excited",
  "I'm afraid", "I'm sorry", "I'm happy to", "I'm glad to",
  "I'm curious", "I'm easy", "I'm allergic to",
  "I can't wait", "I can't believe", "I don't think", "I don't know",
  "I don't want to", "I don't have to",
  "I want to", "I wanted to", "I need to", "I needed to",
  "I hope to", "I hoped to", "I plan to", "I planned to",
  "I used to", "I was wondering", "I was thinking",
  "I couldn't help", "I couldn't believe",
  "I could feel", "I could see", "I could hear",
  "I guess", "I assume", "I suppose",
  "I'll take it", "I'll catch you later", "I'll have",
  "I'll be", "I'll make", "I'll try",
  "I've been", "I've had", "I've never",
  "I've practiced", "I've decided",
  // It + be / seem
  "It seems like", "It felt like", "It feels like", "It looks like", "It sounded like",
  "It's been a long time", "It's been a while",
  "It was getting", "It was the best", "It was the first",
  "It turns out", "It turned out",
  "It depends on", "It's up to you", "It's up to me",
  "It's like we'd", "It's like",
  // That's + ...
  "That's why", "That's because", "That's when", "That's how",
  "That's the thing", "That's what", "That's all",
  // Discourse markers
  "even so", "even then", "instead",
  "after that", "before that", "since then",
  "not only", "not just", "not yet",
  "at least", "at last", "at the time",
  "in the end", "in the meantime",
  "either way", "either", "whether",
  "now that", "so that",
  "long story short",
  "just so you know",
  "for what it's worth",
  "by the way",
  "no wonder",
  // be + adj + prep
  "interested in", "excited about", "worried about",
  "proud of", "afraid of", "tired of",
  "good at", "bad at", "ready for",
  "happy with", "pleased with", "satisfied with",
  "surprised by", "impressed by",
  "used to", "supposed to",
  "allergic to", "curious about",
  // common fixed
  "no wonder", "no problem", "no doubt",
  "the same", "the only", "the first time",
  "for a moment", "after a while", "all of a sudden",
  "by the time", "every time", "one day",
  "just to", "just in", "just for",
  "can't help", "can't wait", "can't believe",
  "don't have to", "doesn't have to",
  // Question starters
  "Can I", "Could I", "May I",
  "Can we", "Could we", "Shall we",
  "Can you", "Could you", "Would you",
  "Do you have", "Do you know", "Do you want",
  "Have you ever", "Have you tried",
  "Why don't we", "Why don't you",
  "What do you recommend", "What do you think",
  "How long does", "How much is", "How many",
  "Does this come with", "Does it come with",
  "Would it be", "Would you like",
  // Suggestion / request patterns
  "Let me", "Let's say", "Let's go", "Let's try", "Let's circle back",
  "Let me help", "Let me know", "Let me check", "Let me think",
  "Let me show", "Let me look",
  // Sounds like / looks like
  "Sounds like", "Sounds good", "Sounds perfect",
  "Looks like", "Looks good", "Looks great",
  // I'll / I've patterns
  "I'll have the draft", "I'll have it", "I'll get",
  // common connectors + fixed
  "now that", "given that", "considering that",
  "saying it out loud", "said it out loud",
  "out loud",
  "by end of day",
  "back to back",
  "it's up to you",
  "it's up to me",
  "long story short",
  "just so you know",
  "some people just",
  "some Sundays",
  "do nothing",
  "the full version",
  "the whole thing",
  "what could go wrong",
  "save us later",
  "feel the energy",
  "the energy shift",
  "caught me up",
  "caught up",
  "up to date",
  "at an understatement",
  "that was an understatement",
  "an understatement",
  // question / request patterns from uncovered
  "I'm here to",
  "Is it safe to",
  "Is it too late to",
  "Is this seat taken",
  "It's your turn",
  "I can't stand",
  "I won't be able to",
  "I'm swamped with",
  "I'm confident that",
  "I'm behind on",
  "I'm writing to",
  "I'm lost",
  "I'm majoring in",
  "I'm sore from",
  "I'm saving up",
  "I'm swamped",
  "Is there a good place",
  "Do you deliver",
  "Do you take cards",
  "Is it far",
  "Am I allowed to",
  "When do we",
  "It's been ages",
  "In my opinion",
  "I hear you",
  "I see it differently",
  "I'm confident",
  "find a way to", "found a way to",
  "it drives me", "that drives me",
  "how much do I owe",
  "come back with",
  "let's find a way",
  "there's something wrong",
  "there's an update",
  "there's a small",
  "just my luck",
  "one of those days",
  "it shows",
  "it showed",
  "I backed it up",
  "I have experience",
  "I apologize for",
  "keep up the great work",
  "by tonight",
  "keep you posted",
  "I'll keep you posted",
  "sorry for the late reply",
  "please find",
  "just a quick note",
  "that really hit",
  "it's not letting me",
  "how much do I",
  "I'm afraid I",
  "I won't be",
  "my bad",
  "suit yourself",
  // more chunks from second uncovered analysis
  "It might be better to",
  "What time does",
  "What's the weather like",
  "I think I'm at the wrong",
  "I have a reservation",
  "Is breakfast included",
  "I can't connect to",
  "Is the internet down",
  "Is there anything else I can do",
  "Is there anything else",
  "As you can see",
  "Let's call it",
  "Who's taking the lead",
  "I should get going",
  "It'll be okay",
  "I didn't realize",
  "Why don't I",
  "I'm with",
  "Not necessarily",
  "It must be",
  "What goes into",
  "it needs a bit more",
  "it needs more",
  "a bit more",
  "I'm free",
  "count me in",
  "let's put this behind us",
  "put this behind us",
  "let's actually",
  "we have a deal",
  "don't be so hard on yourself",
  "hard on yourself",
  "I'm here for you",
  "I owe you an apology",
  "thanks for your patience",
  "you did a great job",
  "great job on",
  "way to go",
  "you crushed it",
  "lost track of time",
  "slipped away from me",
  "she'd be glad to",
  "I'll be glad to",
  "glad to help",
  "off your plate",
  "take the calls",
  "splitting it",
  "made everything easier",
  "It's freezing",
  "it's freezing",
  "a total mess",
  "It should arrive",
  "it should arrive",
  "helps me relax",
  "help me relax",
  "helps me",
  "sales are up",
  "up this quarter",
  "without any fuss",
  "nothing else to say",
  "the heat drained",
  "didn't realize it",
  "I didn't realize it was",
  "it was so late",
  "time had slipped",
]

// Fixed expressions and idioms
const FIXED_EXPRESSIONS = [
  // greetings / farewells
  "long story short",
  "just so you know",
  "for what it's worth",
  "either way",
  "no matter what",
  "by the way",
  "in other words",
  "to be honest",
  "to tell the truth",
  "not to mention",
  "believe it or not",
  "sooner or later",
  "once in a while",
  "all of a sudden",
  "out of the blue",
  "at the end of the day",
  "the best of both worlds",
  "it's up to you",
  "the more the merrier",
  "now or never",
  "take it or leave it",
  "better safe than sorry",
  "that's an understatement",
  "it's a long story",
  "long story short",
  "I'll catch you later",
  "catch you later",
  "see you later",
  "take care",
  "never mind",
  "never say never",
  "make the most of",
  "have a say in",
  "have a word with",
  "keep an eye on",
  "on the same page",
  "give it a try", "give it a shot",
  "just around the corner",
  "behind the scenes",
  "go hand in hand",
  "the other way around",
  "at your own pace",
  "hit the road",
  "so far so good",
  "first things first",
  "last but not least",
  "well worth it",
  "easier said than done",
  "once and for all",
  "come to think of it",
  "for the record",
  "on second thought",
  "think twice about",
  "out of the question",
  "make up one's mind",
  "change one's mind",
  "that's the point",
  "that's not the point",
  "miss the point",
  "get the point",
  "fair enough",
  "goes without saying",
  "it makes sense",
  "that makes sense",
  "doesn't make sense",
  "makes no sense",
  "the whole point",
  "have a point",
  "have a good point",
  "have a point there",
  // new fixed expressions from uncovered analysis
  "touch base with",
  "touch base",
  "one of those days",
  "keep the change",
  "dinner's on me",
  "on me tonight",
  "my bad",
  "suit yourself",
  "keep up the great work",
  "just my luck",
  "of course",
  "hit the spot",
  "is this seat taken",
  "blown out of proportion",
  "keep you posted",
  "I'll keep you posted",
  "sorry for the late reply",
  "please find the",
  "just a quick note",
  "watch out for",
  "watch out",
  "I'm lost",
  "is everything okay",
  "I hear you",
  "I see it differently",
  "in my opinion",
  "it's been ages",
  "ages since",
  "a real boost",
  "a quick break",
  "a slow lap",
  "out of proportion",
  "drive me crazy",
  "drives me crazy",
  "there's nothing else",
  "there's nothing",
  "nothing else to do",
  "rolling up his sleeves",
  "do the dishes",
  "I won't be able to make it",
  "I won't be able to",
  "make it tonight",
  "try again next week",
  "that's not letting",
  "it's not letting",
  "acting up again",
  "give it the classic",
  "classic restart",
  "apologize for the wait",
  "I apologize for",
  "sorry for the wait",
  "is there a good place",
  "I have experience in",
  "staying calm under pressure",
  "calm under pressure",
  "I'm confident that I can",
  "hit the targets",
  "I'm behind on",
  "I'm swamped with",
  "swamped with",
  // more fixed expressions
  "beat the rush",
  "off your plate",
  "count me in",
  "don't be so hard on yourself",
  "hard on yourself",
  "I'm here for you",
  "here for you",
  "you did a great job",
  "way to go",
  "great job",
  "you crushed it",
  "lost track of time",
  "we have a deal",
  "thanks for your patience",
  "I owe you an apology",
  "is there anything else",
  "anything else I can do",
  "total mess",
  "not necessarily",
  "let's actually compare",
  "I'm with you on",
  "a total mess",
  "that sounds great",
  "let's not turn this into",
  "let's put this behind",
  "you crushed it",
  "you nailed it",
  "nailed it",
  "let's do it again",
  "do it again soon",
  "it was lovely",
  "this was lovely",
  "count me in",
  "I'll keep you posted",
  "let me grab",
  "let me help you",
  "glad to",
  "I'll be glad to",
  "make plans for",
  "make actual plans",
  "pick a date",
  "losing track",
  "lost track",
  "I'm free anytime",
  "free anytime",
]

// ─────────────────────────────────────────────────────────────────────────────
// Matching engine
// ─────────────────────────────────────────────────────────────────────────────

function findCandidates(sentence) {
  const lower = sentence.toLowerCase()
  const results = []

  function search(list, type) {
    for (const phrase of list) {
      const pl = phrase.toLowerCase()
      let idx = 0
      while (true) {
        const pos = lower.indexOf(pl, idx)
        if (pos === -1) break
        // Ensure word boundary at start
        const before = pos === 0 ? '' : lower[pos - 1]
        const after = pos + pl.length >= lower.length ? '' : lower[pos + pl.length]
        const startOk = pos === 0 || !/[a-z0-9']/i.test(before)
        const endOk = pos + pl.length >= lower.length || !/[a-z0-9]/i.test(after)
        if (startOk && endOk) {
          results.push({ text: sentence.slice(pos, pos + pl.length), type, start: pos, end: pos + pl.length })
        }
        idx = pos + 1
      }
    }
  }

  search(PHRASAL_VERBS, 'phrasalVerb')
  search(PREP_PHRASES, 'prepPhrase')
  search(COLLOCATIONS, 'collocation')
  search(CHUNKS, 'chunk')
  search(FIXED_EXPRESSIONS, 'fixedExpression')

  // Deduplicate: for overlapping matches, keep highest-priority
  const priority = { phrasalVerb: 5, idiom: 4, fixedExpression: 3, collocation: 2, chunk: 1, prepPhrase: 1 }
  results.sort((a, b) => {
    const pd = (priority[b.type] || 0) - (priority[a.type] || 0)
    if (pd !== 0) return pd
    return (b.end - b.start) - (a.end - a.start)  // longer first
  })

  const kept = []
  for (const r of results) {
    // Skip if already covered by a higher-priority match of same type
    const overlaps = kept.some(k => r.start < k.end && r.end > k.start && k.type === r.type)
    if (!overlaps) kept.push(r)
  }

  return kept.sort((a, b) => a.start - b.start)
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract sentences from magazine-stories.ts
// ─────────────────────────────────────────────────────────────────────────────

const src = fs.readFileSync('./data/magazine-stories.ts', 'utf8')

// Parse whole file: match id then find nearest english within 800 chars
const idRe = /id:\s*'(p\d+-\d+)'/g
let m
const paragraphs = []
while ((m = idRe.exec(src)) !== null) {
  const id = m[1]
  const after = src.slice(m.index, m.index + 800)
  // double-quoted: english: "..."
  const dqM = after.match(/english:\s*"([^]*?)",\s*[\n\s]*korean/)
  // single-quoted: english: '...'
  const sqM = after.match(/english:\s*'([^]*?)',\s*[\n\s]*korean/)
  const raw = dqM ? dqM[1] : sqM ? sqM[1] : null
  if (raw) {
    const english = raw
      .replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ').trim()
    paragraphs.push({ id, english })
  }
}

console.log(`Found ${paragraphs.length} paragraphs`)

// ─────────────────────────────────────────────────────────────────────────────
// Generate candidates
// ─────────────────────────────────────────────────────────────────────────────

const errors = []
const results = {}

for (const { id, english } of paragraphs) {
  const candidates = findCandidates(english)

  // Validate offsets
  const invalid = candidates.filter(c => english.slice(c.start, c.end).toLowerCase() !== c.text.toLowerCase())
  if (invalid.length > 0) {
    errors.push({ id, invalid })
  }

  if (candidates.length > 0) {
    results[id] = candidates
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

const totalParagraphs = paragraphs.length
const coveredParagraphs = Object.keys(results).length
const uncovered = paragraphs.filter(p => !results[p.id]).map(p => p.id)

console.log(`\n=== RESULTS ===`)
console.log(`Total paragraphs: ${totalParagraphs}`)
console.log(`With chunks: ${coveredParagraphs}`)
console.log(`Without chunks: ${uncovered.length}`)
if (uncovered.length > 0) {
  console.log(`\nNo-chunk paragraph IDs: ${uncovered.join(', ')}`)
}
if (errors.length > 0) {
  console.log(`\nOffset errors:`)
  errors.forEach(e => console.log(`  ${e.id}:`, e.invalid))
}

// Generate TypeScript file
let out = `import type { SaveCandidate } from '@/data/pattern-examples-full'

/**
 * Story paragraph saveCandidates — auto-generated by scripts/generate-story-chunks.mjs
 * ${coveredParagraphs} / ${totalParagraphs} paragraphs have chunk data.
 */
export const storyChunks: Record<string, SaveCandidate[]> = {
`

for (const [id, candidates] of Object.entries(results)) {
  out += `  '${id}': [\n`
  for (const c of candidates) {
    out += `    { text: ${JSON.stringify(c.text)}, type: '${c.type}', start: ${c.start}, end: ${c.end} },\n`
  }
  out += `  ],\n`
}

out += `}\n`

fs.writeFileSync('./data/story-chunks.ts', out)
console.log(`\nWrote data/story-chunks.ts`)

// Write report
const report = {
  totalParagraphs,
  coveredParagraphs,
  uncoveredParagraphs: uncovered.length,
  uncoveredIds: uncovered,
  offsetErrors: errors,
}
fs.writeFileSync('./scripts/chunk-report.json', JSON.stringify(report, null, 2))
console.log(`Wrote scripts/chunk-report.json`)
