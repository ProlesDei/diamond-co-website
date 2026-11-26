import type { CollectionConfig, GlobalConfig, Plugin } from 'payload'

import { Faqs } from './Faqs'
import { gallerySource } from './gallerySource'
import { Pieces } from './Pieces'
import { privateUploadStorage } from '../inquiry/storage'
import { SiteSettings } from './SiteSettings'
import { TestimonialProofs } from './TestimonialProofs'
import { Testimonials } from './Testimonials'

export const collections: CollectionConfig[] = [Pieces, Testimonials, TestimonialProofs, Faqs]
export const globals: GlobalConfig[] = [SiteSettings]
export const plugins: Plugin[] = [gallerySource, privateUploadStorage(TestimonialProofs.slug)]
