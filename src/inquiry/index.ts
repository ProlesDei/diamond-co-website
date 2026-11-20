import type { CollectionConfig, GlobalConfig, Plugin } from 'payload'

import { Inquiries } from './collections/Inquiries'
import { InquirySettings } from './collections/InquirySettings'
import { InquiryUploads } from './collections/InquiryUploads'
import { inquiryUploadStorage } from './storage'

export const collections: CollectionConfig[] = [Inquiries, InquiryUploads]
export const globals: GlobalConfig[] = [InquirySettings]
export const plugins: Plugin[] = [inquiryUploadStorage]
