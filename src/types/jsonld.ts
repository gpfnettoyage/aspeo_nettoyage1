import { COMPANY } from '@/constants/company';

export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonLdValue = JsonPrimitive | JsonLdObject | JsonLdArray;
export type JsonLdArray = JsonLdValue[];

export type JsonLdObject = {
    [key: string]: JsonLdValue;
};

export type SchemaGraph = {
    '@context': 'https://schema.org';
    '@graph': JsonLdObject[];
};

export type SchemaBase = {
    '@context': 'https://schema.org';
    '@type': string;
    [key: string]: JsonLdValue;
};

// IDs pour les références croisées entre schémas (base = COMPANY.website)
const ORIGIN = COMPANY.website.replace(/\/$/, '');
export const SCHEMA_IDS = {
    BUSINESS: `${ORIGIN}/#business`,
    WEBSITE: `${ORIGIN}/#website`,
    LOGO: `${ORIGIN}/#logo`,
    ADDRESS: `${ORIGIN}/#address`,
} as const;

// Types pour les schémas structurés
export type PostalAddressSchema = {
    '@type': 'PostalAddress';
    '@id'?: string;
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressRegion: string;
    addressCountry: string;
};

export type GeoCoordinatesSchema = {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
};

export type OpeningHoursSpecificationSchema = {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
};

export type ImageObjectSchema = {
    '@type': 'ImageObject';
    '@id'?: string;
    url: string;
    width?: number;
    height?: number;
    caption?: string;
};

export type AggregateRatingSchema = {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
};

export type ReviewSchema = {
    '@type': 'Review';
    author: {
        '@type': 'Person';
        name: string;
    };
    datePublished: string;
    reviewBody: string;
    reviewRating: {
        '@type': 'Rating';
        ratingValue: number;
        bestRating: number;
        worstRating: number;
    };
};

export type LocalBusinessSchema = {
    '@type': 'LocalBusiness';
    '@id': string;
    name: string;
    legalName?: string;
    description?: string;
    url: string;
    telephone: string;
    email?: string;
    address: PostalAddressSchema;
    geo: GeoCoordinatesSchema;
    areaServed?: JsonLdValue;
    logo?: ImageObjectSchema | string;
    image?: string | string[];
    priceRange?: string;
    openingHoursSpecification?: OpeningHoursSpecificationSchema[];
    aggregateRating?: AggregateRatingSchema;
    review?: ReviewSchema[];
    sameAs?: string[];
};

export type WebSiteSchema = {
    '@type': 'WebSite';
    '@id': string;
    name: string;
    url: string;
    publisher?: { '@id': string };
};

export type ServiceSchema = {
    '@type': 'Service';
    '@id'?: string;
    name: string;
    description?: string;
    provider: { '@id': string } | JsonLdObject;
    areaServed?: JsonLdValue;
    image?: string | string[];
    url?: string;
    serviceType?: string;
    hasOfferCatalog?: JsonLdObject;
};
