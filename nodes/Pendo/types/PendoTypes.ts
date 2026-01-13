/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

export interface IPendoCredentials {
  integrationKey: string;
  region: 'US' | 'EU';
  subdomain?: string;
}

export interface IPendoApiResponse {
  results?: IDataObject[];
  startIndex?: number;
  lastIndex?: number;
  totalCount?: number;
  [key: string]: unknown;
}

export interface IPendoAggregationRequest {
  response: {
    mimeType: string;
  };
  request: {
    pipeline: IDataObject[];
    requestId?: string;
  };
}

export interface IPendoTimeSeries {
  period: 'dayRange' | 'hourRange' | 'minuteRange';
  first: string;
  count: number;
}

export interface IPendoSource {
  pageEvents?: IDataObject;
  featureEvents?: IDataObject;
  guideEvents?: IDataObject;
  trackEvents?: IDataObject;
  visitors?: IDataObject;
  accounts?: IDataObject;
  timeSeries?: IPendoTimeSeries;
}

export interface IPendoVisitor {
  visitorId: string;
  accountId?: string;
  metadata?: IDataObject;
  [key: string]: unknown;
}

export interface IPendoAccount {
  accountId: string;
  metadata?: IDataObject;
  [key: string]: unknown;
}

export interface IPendoGuide {
  id: string;
  name: string;
  state: 'draft' | 'staged' | 'public' | 'disabled';
  launchMethod: string;
  isMultiStep: boolean;
  steps?: IDataObject[];
  [key: string]: unknown;
}

export interface IPendoSegment {
  id: string;
  name: string;
  definition?: IDataObject;
  [key: string]: unknown;
}

export interface IPendoTrackEvent {
  id: string;
  name: string;
  appId?: string;
  definition?: IDataObject;
  [key: string]: unknown;
}

export interface IPendoFeedbackRequest {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface IPendoPaginationOptions {
  offset?: number;
  limit?: number;
}

export type PendoResource =
  | 'aggregation'
  | 'visitor'
  | 'account'
  | 'guide'
  | 'segment'
  | 'trackEvent'
  | 'feedback';

export type AggregationOperation =
  | 'runAggregation'
  | 'getPageEvents'
  | 'getFeatureEvents'
  | 'getGuideEvents'
  | 'getTrackEvents'
  | 'getVisitorActivity';

export type VisitorOperation = 'get' | 'getMany' | 'update' | 'delete';

export type AccountOperation = 'get' | 'getMany' | 'update' | 'delete';

export type GuideOperation = 'get' | 'getMany' | 'update' | 'getAnalytics';

export type SegmentOperation = 'get' | 'getMany' | 'create';

export type TrackEventOperation = 'create' | 'get' | 'getMany';

export type FeedbackOperation = 'create' | 'get' | 'getMany' | 'update' | 'getVotes';
