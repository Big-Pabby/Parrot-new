<script setup lang="ts">
useHead({
  title: 'How It Works — Parrot',
  meta: [
    {
      name: 'description',
      content:
        'Learn how Parrot works for customers, UGC creators, pro reviewers, and businesses.',
    },
  ],
})

interface Step {
  title: string
  description: string
}

interface AudienceSection {
  number: string
  label: string
  headline: string
  steps: Step[]
  quote: string
  ctaText: string
  ctaHref: string
}

const sections: AudienceSection[] = [
  {
    number: '01',
    label: 'FOR CUSTOMERS',
    headline: 'The community you check before you spend.',
    image: '/images/customers.png',
    steps: [
      {
        title: 'Join in seconds',
        description: 'Create your free account with your name and email.',
      },
      {
        title: 'Search before you spend',
        description:
          'Found a business on Instagram and not sure about them? Search for them on Parrot. See verified customer reviews, watch creator videos, and read Pro Reviewer verdicts.',
      },
      {
        title: 'Ask the community',
        description:
          'Post any question and get honest answers from people who have actually bought from that business or used the product.',
      },
      {
        title: 'Share your experience',
        description:
          'Share your experience after you buy. Video, voice note, photo, or text. Your review lives permanently on that business profile.',
      },
      ],
    quote:
      '"I searched for a vendor before buying. Saw 43 reviews, watched two videos, and ordered without a single doubt. This is how buying should always feel."',
    ctaText: 'Join for free',
    ctaHref: 'https://onelink.to/nwmnzy',
  },
  {
    number: '02',
    label: 'FOR UGC CREATORS',
    headline: 'Start posting commerce content where people are in buying mode.',
    image: '/images/ugc-creator.png',
    steps: [
      {
        title: 'Set up your creator profile',
        description:
          'Create your Parrot account as a UGC Creator. Your profile is your portfolio. Every content you post builds your reputation.',
      },
      {
        title: 'Post your honest takes',
        description:
          'Try a product, visit a business, test a service — then share your experience in video, photo, or text. No scripts. No pressure to be kind.',
      },
      {
        title: 'Build a following',
        description:
          'Your followers on Parrot are not passive viewers. They are active buyers who follow you because your taste and honesty help them make better spending decisions.',
      },
      {
        title: 'Get hired by businesses',
        description:
          'Get hired by brands who want you to create content for them — because your audience is exactly who they need to reach.',
      },
    ],
    quote:
      '"Parrot is the only platform where people specifically come to find honest commerce content before spending. Every view your content gets on Parrot is from someone who needed exactly what you created."',
    ctaText: 'Join as a Creator',
    ctaHref: 'https://onelink.to/nwmnzy',
  },
  {
    number: '03',
    label: 'FOR PRO REVIEWERS',
    headline:
      'Parrot is the only platform where your audience comes specifically to read reviews and make spending decisions.',
    image: '/images/reviewers.png',
    steps: [
      {
        title: 'Sign Up as a Pro Reviewer',
        description:
          'Pro Reviewers are verified by Parrot. The badge tells the community your reviews meet a higher standard — and they come to your profile knowing they can trust what you publish.',
      },
      {
        title: 'Investigate properly',
        description:
          'Order the product. Visit the location. Test the service over time. Go as deep as the review demands.',
      },
      {
        title: 'Publish your verdict',
        description:
          'Write the kind of review that leaves no questions unanswered. It lives permanently on the business profile, exactly where buyers look before they spend.',
      },
      {
        title: 'Get hired to review products and services',
        description:
          'Businesses on Parrot can see your badge, your published reviews, and your reputation. When they want an honest, thorough review of their product or service, they hire you.',
      },
    ],
    quote:
      '"Parrot is where Nigerians come to check businesses before buying. Publishing your reviews here puts them directly in front of active buyers at the exact moment they are making a decision."',
    ctaText: 'Apply as a Pro Reviewer',
    ctaHref: 'https://onelink.to/nwmnzy',
  },
  {
    number: '04',
    label: 'FOR BUSINESSES',
    headline: 'Customers are already talking about you on Parrot.',
    image: '/images/business.png',
    steps: [
      {
        title: 'Create your verified business profile',
        description:
          'Set up on Parrot and go through verification. Your profile carries a trust badge that tells potential customers you are credible.',
      },
      {
        title: 'Collect reviews the way customers actually want to leave them',
        description:
          'Easily collect reviews as video, voice note, photo, or text. No forms. No friction. No chasing customers for reviews.',
      },
      {
        title: 'Respond publicly and build trust at scale',
        description:
          'Reply to every review — the good, and not so good. Every response is visible to every future customer reading your profile. Showing that you listen and care is one of the most powerful things a business can do.',
      },
      {
        title: 'Turn reviews into intelligence to drive revenue',
        description:
          'Get insight into customer sentiment, revenue growth, product performance, what competitors are doing, and what is quietly driving customers away.',
      },
    ],
    quote:
      'Parrot is a social platform built specifically for commerce — where customers discover, discuss, and decide together. Being on Parrot does not just build your rating. It puts you inside the conversation that drives buying decisions.',
    ctaText: 'List your business',
    ctaHref: 'https://onelink.to/nwmnzy',
  },
]
</script>

<template>
  <div>
    <AppNavbar />

    <main>
      <!-- ─── Hero header: cream bg ─────────────────────────────── -->
      <div class="bg-cream pt-32 pb-14 lg:pb-20">
        <div class="max-w-[1400px] mx-auto px-8 pt-16 lg:px-20 flex justify-end">
          <h1
            class="font-heading text-5xl lg:text-[64px] xl:text-[72px] font-bold text-black leading-tight text-right"
          >
            How It Works
          </h1>
        </div>
      </div>

      <!-- Wave: cream → lavender -->
      <WaveSeparator from-color="#fff4d2" to-color="#c1c2ff" />

      <template v-for="(section, index) in sections" :key="section.number">
        <!-- Dynamic background based on index (even: lavender, odd: cream) -->
        <div :class="index % 2 === 0 ? 'bg-lavender' : 'bg-cream'">
          <HowItWorksAudienceSection
            :number="section.number"
            :label="section.label"
            :headline="section.headline"
            :steps="section.steps"
            :quote="section.quote"
            :ctaText="section.ctaText"
            :ctaHref="section.ctaHref"
            :image="section.image"
          />
        </div>

        <!-- Wave separator if not the last section -->
        <WaveSeparator
          v-if="index < sections.length - 1"
          :from-color="index % 2 === 0 ? '#c1c2ff' : '#fff4d2'"
          :to-color="index % 2 === 0 ? '#fff4d2' : '#c1c2ff'"
        />
      </template>
    </main>

    <AppFooter />
  </div>
</template>
