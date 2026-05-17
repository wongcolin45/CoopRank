export interface Role {
  company: string;
  role: string;
  role_type: "Co-op" | "Internship";
  duration_months: number;
  prestige_tier: string;
  base_prestige_score: number;
  engineering_bar_score: number;
  resume_signaling_multiplier: number;
  talent_density_tier: string;
  company_color: string;
  technical_focus: string;
  boston_market_presence: string;
  deep_context_note: string;
  domain_tags: string[];
  industry: string;
  company_size: string;
  employee_count_approx: number;
  funding_stage: string;
  glassdoor_engineering_rating: number;
  primary_tech_stack: string[];
  hq_location: string;
  known_for: string;
  intern_coop_compensation: string;
  selectivity: string;
}
