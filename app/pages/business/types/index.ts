export interface BusinessCategory {
  _id: string;
  name: string;
  imageUrl: string;
  metrics: string[];
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSubCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  categoryIds: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayHours {
  open: string;
  close: string;
  isOpen24Hours: boolean;
  _id: string;
}

export interface BusinessHours {
  daysOfWeek: {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
  };
  modeOfOperation: string;
  specialDates: Array<{
    hours: {
      open: string;
      close: string;
      isOpen24Hours: boolean;
    };
    date: string;
    _id: string;
  }>;
  offerDelivery: boolean;
  checked: boolean;
  status: string;
}

export interface MediaFile {
  _id: string;
  thumbnailUrl: string;
  playbackUrl: string;
  mediaStatus: string;
  uploadSessionId: string;
  eTag: string;
  serverSideEncryption: string;
  versionId: string;
  key: string;
  location: string;
  bucket: string;
  mimeType: string;
  storageType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BusinessMedia {
  _id: string;
  businessId: string;
  businessGallery: MediaFile[];
  businessBanner: MediaFile;
  businessLogo: MediaFile;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SocialMediaLinks {
  tiktok: string;
  instagram: string;
  twitter: string;
  telegram: string;
  facebook: string;
  whatsapp: string;
  website: string;
}

export interface SocialOAuth {
  facebook: {
    platformUserId: string;
    username: string;
  };
  instagram: {
    platformUserId: string;
    username: string;
  };
  twitter: {
    platformUserId: string;
    username: string;
  };
  tiktok: {
    openId: string;
    username: string;
  };
}

export interface ProductsAndSocials {
  socialMediaLinks: SocialMediaLinks;
  socialOAuth: SocialOAuth;
  _id: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnershipVerification {
  ownerFullName: string;
  verificationType: string;
}

export interface BusinessVerification {
  businessType: string;
  registration: string;
  companyType: string;
  cac: string;
  verificationType: string;
  utilityBill: null;
}

export interface BusinessMetricScore {
  [key: string]: number | string;
}

export interface Analytics {
  businessMetricScore: BusinessMetricScore;
}

export interface Business {
  _id: string;
  businessName: string;
  officialName: string;
  parrotScore: number;
  metricScore: number;
  businessEmail: string;
  businessPhoneNumber: string;
  businessDescription: string;
  businessProductAndService: string[];
  address: string;
  city: string;
  country: string;
  state: string;
  businessCategory: BusinessCategory[];
  businessSubCategory: BusinessSubCategory[];
  contactPerson: string;
  titleOfContactPerson: string;
  phoneNumbersOfContactPerson: string[];
  theme: string;
  claimed: boolean;
  businessPhoneNumberVerified: boolean;
  businessEmailVerified: boolean;
  addressVerified: boolean;
  documentVerified: boolean;
  branchesInOtherLocations: boolean;
  username: string;
  visitCount: number;
  id: string;
  hours: BusinessHours;
  media: BusinessMedia;
  productsAndSocials: ProductsAndSocials;
  ownershipVerification: OwnershipVerification;
  businessVerification: BusinessVerification;
  analytics: Analytics;
}

export interface BusinessOffer {
  [key: string]: unknown;
}

