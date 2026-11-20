import type { CollectionConfig, GlobalConfig, Plugin } from 'payload'

import { Faqs } from './Faqs'
import { gallerySource } from './gallerySource'
import { Pieces } from './Pieces'
import { SiteSettings } from './SiteSettings'
import { Testimonials } from './Testimonials'

export const collections: CollectionConfig[] = [Pieces, Testimonials, Faqs]
export const globals: GlobalConfig[] = [SiteSettings]
export const plugins: Plugin[] = [gallerySource]
