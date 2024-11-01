export interface TrelloConfig {
  apiKey: string;
  apiToken: string;
  apiSecret: string;
  boardIds: Record<string, string>;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  shortUrl: string;
  idMembers: string[];
  idList: string;
  idLabels: string[];
  closed: boolean;
  due: string | null;
  dueComplete: boolean;
}

export interface TrelloMember {
  id: string;
  fullName: string;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface TrelloLabel {
  id: string;
  name: string;
}

export interface ProcessedCard {
  card_id: string;
  card_name: string;
  card_description: string;
  shortUrl: string;
  creation_date: Date;
  completed_date: Date | null;
  members: string;
  list_name: string;
  labels: string;
  is_archived: boolean;
}

export interface CommandArgs {
  board?: string;
  fromDate?: string;
  toDate?: string;
  labels?: string[];
  archived?: boolean;
}
