export interface AddressLabel {
  id: string;
  company_title: string;
  sender: string;
  receiver: string;
  created_at: string;
}

export interface AddressLabelFormData {
  companyTitle: string;
  sender: string;
  receiver: string;
}
