export type CompanyAddress = {
  street: string;
  zipCode: string;
  city: string;
  department: string;
  departmentCode: string;
  full: string;
  region: string;
  country: string;
};

export type CompanySocials = {
  facebook: string;
  instagram: string;
  linkedin: string;
  tiktok?: string;
  x?: string;
  googleBusiness: string;
};

export type CompanyHours = {
  week: string;
  friday: string;
  weekend: string;
  weekMorningOpen: string;
  weekMorningClose: string;
  weekAfternoonOpen: string;
  weekAfternoonClose: string;
  fridayOpen: string;
  fridayClose: string;
};

export type CompanyLegal = {
  name: string;
  form: string;
  capital: string;
  rcs: string;
  siret: string;
  tva: string;
  publicationDirector: string;
};

export type CompanyGeo = {
  latitude: number;
  longitude: number;
};

export type AdministrativeArea = {
  '@type': 'AdministrativeArea';
  name: string;
  sameAs?: string;
};

export type GeoCoordinates = {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
};

export type GeoCircle = {
  '@type': 'GeoCircle';
  geoMidpoint: GeoCoordinates;
  geoRadius: number;
};

export type CompanyAreaServed = AdministrativeArea | GeoCircle;

export type CompanyData = {
  name: string;
  fullName: string;
  address: CompanyAddress;
  phone: string;
  phoneValue: string;
  email: string;
  website: string;
  socials: CompanySocials;
  hours: CompanyHours;
  legal: CompanyLegal;
  geo: CompanyGeo;
  areaServed: CompanyAreaServed[];
};
