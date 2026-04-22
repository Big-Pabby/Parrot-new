<template>
  <footer class="bg-black py-16 lg:py-20">
    <div class="max-w-[1400px] mx-auto px-8 lg:px-20">
      <!-- Top Row: Logo + Links -->
      <div class="flex flex-col lg:flex-row gap-12 lg:gap-36 mb-14">
        <!-- Logo + Social -->
        <div class="flex flex-col gap-8 flex-shrink-0">
          <img src="/images/parrot-logo-white.svg" alt="Parrot" class="h-14 w-auto" />
          <div class="flex items-center gap-5">
            <a href="#" aria-label="Facebook" class="hover:opacity-70 transition-opacity">
              <img src="/images/icon-facebook.svg" alt="Facebook" class="w-5 h-5 invert" />
            </a>
            <a href="#" aria-label="X / Twitter" class="hover:opacity-70 transition-opacity">
              <img src="/images/icon-twitter.svg" alt="X" class="w-5 h-5 invert" />
            </a>
            <a href="#" aria-label="LinkedIn" class="hover:opacity-70 transition-opacity">
              <img src="/images/icon-linkedin.svg" alt="LinkedIn" class="w-5 h-5 invert" />
            </a>
            <a href="#" aria-label="Instagram" class="hover:opacity-70 transition-opacity">
              <img src="/images/icon-instagram.svg" alt="Instagram" class="w-5 h-5 invert" />
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
          <!-- Customers -->
          <div class="flex flex-col gap-4">
            <h4 class="font-rubik text-[#ebebeb] text-xl font-bold">Customers</h4>
            <ul class="flex flex-col gap-3">
              <li v-for="link in customerLinks" :key="link">
                <a href="#" class="font-body text-white/70 text-sm hover:text-white transition-colors">{{ link }}</a>
              </li>
            </ul>
          </div>
          <!-- Business -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">Business</h4>
            <ul class="flex flex-col gap-3">
              <li v-for="link in businessLinks" :key="link">
                <a href="#" class="font-body text-white/70 text-sm hover:text-white transition-colors">{{ link }}</a>
              </li>
            </ul>
          </div>
          <!-- Company -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">Company</h4>
            <ul class="flex flex-col gap-3">
              <li v-for="link in companyLinks" :key="link">
                <a href="#" class="font-body text-white/70 text-sm hover:text-white transition-colors">{{ link }}</a>
              </li>
            </ul>
          </div>
          <!-- Legal -->
          <div class="flex flex-col gap-4">
            <h4 class="font-heading text-[#ebebeb] text-xl font-bold">Legal</h4>
            <ul class="flex flex-col gap-3">
              <li v-for="link in legalLinks" :key="link">
                <a href="#" class="font-body text-white/70 text-sm hover:text-white transition-colors">{{ link }}</a>
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
const customerLinks = ['Building Trust', 'How does Parrot work', 'Content moderation', 'Support', 'FAQ', 'Download App']
const businessLinks = ['Register', 'Claim my Business', 'Product', 'Pricing', 'Blog', 'Support']
const companyLinks = ['About us', 'Contact', 'Blog']
const legalLinks = ['Privacy Policies', 'Terms & Condition', 'Cookies Policy']
</script>
