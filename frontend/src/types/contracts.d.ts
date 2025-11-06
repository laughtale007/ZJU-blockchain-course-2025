export interface Project {
  id: number;
  title: string;
  description: string;
  options: string[];
  endTime: number;
  ticketPrice: string;
  maxTickets: number;
  totalPrize: string;
  soldTickets: number;
  creator: string;
  status: number;
  winningOption: number;
}

export interface Ticket {
  id: number;
  projectId: number;
  optionIndex: number;
  purchasePrice: string;
  purchaseTime: number;
}

export interface Order {
  id: number;
  ticketId: number;
  projectId: number;
  seller: string;
  price: string;
  createTime: number;
  active: boolean;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  options: string[];
  endTime: string;
  ticketPrice: string;
  maxTickets: string;
  totalPrize: string;
  soldTickets: string;
  creator: string;
  status: string;
  winningOption: string;
}

export interface OrderData {
  ticketId: string;
  projectId: string;
  seller: string;
  price: string;
  createTime: string;
  active: boolean;
}