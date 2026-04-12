export interface PCComponent {
  id: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  specs: string[];
  size?: string;
  lowestPriceSite?: string;
  purchaseUrl?: string;
  compareUrl?: string;
}

export interface PCBuild {
  budget: number;
  purpose: string;
  components: PCComponent[];
  notes: string[];
}

export interface BuildInput {
  budget: string;
  purpose: string;
  brands: string[];
}
