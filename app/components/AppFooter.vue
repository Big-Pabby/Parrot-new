<template>
  <footer class="bg-black py-16 lg:py-20">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20">
      <!-- Top Row: Logo + Links -->
      <div class="flex flex-col lg:flex-row gap-12 lg:gap-36 mb-14">
        <!-- Logo + Social -->
        <div class="flex flex-col gap-8 flex-shrink-0">
          <NuxtLink to="/" aria-label="Parrot Home">
            <img
              src="/images/parrot-logo-white.svg"
              alt="Parrot"
              class="h-14 w-auto"
            />
          </NuxtLink>
          <div class="flex items-center gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              class="hover:opacity-70 transition-opacity"
            >
              <img
                src="/images/icon-facebook.svg"
                alt="Facebook"
                class="w-5 h-5 invert"
              />
            </a>
            <a
              href="https://twitter.com/use_parrot/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              class="hover:opacity-70 transition-opacity"
            >
              <img
                src="/images/icon-twitter.svg"
                alt="X"
                class="w-5 h-5 invert"
              />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class="hover:opacity-70 transition-opacity"
            >
              <img
                src="/images/icon-linkedin.svg"
                alt="LinkedIn"
                class="w-5 h-5 invert"
              />
            </a>
            <a
              href="https://www.instagram.com/use_parrot/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="hover:opacity-70 transition-opacity"
            >
              <img
                src="/images/icon-instagram.svg"
                alt="Instagram"
                class="w-5 h-5 invert"
              />
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
          <!-- Customers -->
          <div class="flex flex-col gap-4">
            <h4 class="font-rubik text-[#ebebeb] text-xl font-bold">
              Customers
            </h4>
            <ul class="flex flex-col gap-3">
              <li v-for="(route, link) in customerLinks" :key="link">
                <NuxtLink
                  :to="route"
                  class="font-body text-white/70 text-sm hover:text-white transition-colors"
                  >{{ link }}</NuxtLink
                >
              </li>
            </ul>
          </div>
          <!-- Business -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">
              Business
            </h4>
            <ul class="flex flex-col gap-3">
              <li v-for="(route, link) in businessLinks" :key="link">
                <NuxtLink
                  :to="route"
                  class="font-body text-white/70 text-sm hover:text-white transition-colors"
                  >{{ link }}</NuxtLink
                >
              </li>
            </ul>
          </div>
          <!-- Company -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">
              Company
            </h4>
            <ul class="flex flex-col gap-3">
              <li v-for="(route, link) in companyLinks" :key="link">
                <NuxtLink
                  :to="route"
                  class="font-body text-white/70 text-sm hover:text-white transition-colors"
                  >{{ link }}</NuxtLink
                >
              </li>
            </ul>
          </div>
          <!-- Legal -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">Legal</h4>
            <ul class="flex flex-col gap-3">
              <li v-for="(route, link) in legalLinks" :key="link">
                <NuxtLink
                  :to="route"
                  class="font-body text-white/70 text-sm hover:text-white transition-colors"
                  >{{ link }}</NuxtLink
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-[#6b6ba6] mb-6" />

      <!-- Copyright -->
      <p class="font-rubik text-[#ebebeb] text-base font-medium text-center">
        © Copyright 2023 All Rights Reserved
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const customerLinks: Record<string, string> = {
  "Building Trust": "/",
  "How does Parrot work": "/how-it-works",
  "Content moderation": "/content-moderation",
  Support: "/support",
  FAQ: "/faq",
  "Download App": "/",
};

const businessLinks: Record<string, string> = {
  Register: "/register",
  "Claim my Business": "/business/claim",
  Product: "/product",
  Pricing: "/pricing",
  Blog: "/blog",
  Support: "/support",
};

const companyLinks: Record<string, string> = {
  "About us": "/about",
  Contact: "/contact",
  Blog: "/blog",
};

const legalLinks: Record<string, string> = {
  "Privacy Policies": "/privacy-policy",
  "Terms & Condition": "/terms-of-use",
  "Cookies Policy": "/cookies-policy",
};
</script>
