export type FieldStructure = {
  id: string;
  type: string;
  validation?: { required?: boolean };
  conditional?: { field: string; value: string };
  fields?: FieldStructure[]; // For repeater
  defaultValue?: any;
};

export type FormStepStructure = {
  step: number;
  fields: FieldStructure[];
};

export type FormDefinitionStructure = {
  steps: FormStepStructure[];
};

const violenceThreatsFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "incident_date", type: "date", validation: { required: true } },
      { id: "incident_time", type: "time", validation: { required: true } },
      { id: "incident_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "victim_identity", type: "radio_group", validation: { required: true } },
      { id: "victim_name", type: "text", conditional: { field: "victim_identity", value: "Someone else" } },
      { id: "child_involved", type: "radio_group" },
      { id: "anyone_injured", type: "radio_group" },
      { id: "victim_injuries", type: "textarea" }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "suspect_count", type: "number", defaultValue: 1 },
      { id: "suspect_description", type: "textarea", validation: { required: true } },
      { id: "weapon_involved", type: "radio_group", validation: { required: true } },
      { id: "weapon_type", type: "text", conditional: { field: "weapon_involved", value: "Yes" } },
      { id: "vehicle_involved", type: "radio_group", validation: { required: true } },
      { id: "vehicle_description", type: "textarea", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 4,
    fields: [
      { id: "evidence_upload", type: "file_upload" },
      { id: "witness_present", type: "radio_group" },
      {
        id: "witness_details", type: "repeater", conditional: { field: "witness_present", value: "Yes" }, fields: [
          { id: "witness_name", type: "text" },
          { id: "witness_contact", type: "text" }
        ]
      }
    ]
  }
];

const theftBurglaryFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "property_type", type: "select", validation: { required: true } },
      { id: "time_discovered", type: "datetime", validation: { required: true } },
      { id: "time_occurred", type: "datetime_range" }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "was_anything_stolen", type: "radio_group" },
      {
        id: "stolen_items", type: "repeater", conditional: { field: "was_anything_stolen", value: "Yes" }, fields: [
          { id: "item_name", type: "text" },
          { id: "item_value", type: "number" },
          { id: "item_description", type: "text" }]
      },
      { id: "was_anything_damaged", type: "radio_group" },
      { id: "damage_description", type: "textarea", conditional: { field: "was_anything_damaged", value: "Yes" } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "suspect_info", type: "textarea" },
      { id: "vehicle_involved", type: "radio_group", validation: { required: true } },
      { id: "vehicle_description", type: "textarea", conditional: { field: "vehicle_involved", value: "Yes" } },
      { id: "evidence_upload", type: "file_upload" },
      { id: "witness_present", type: "radio_group" }
    ]
  },
];

const vehicleCrimeFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "time_occurred", type: "datetime_range", validation: { required: true } },
      { id: "vehicle_entered", type: "radio_group", validation: { required: true } },
      { id: "vehicle_entry", type: "select", conditional: { field: "vehicle_entered", value: "Yes" } },
      { id: "was_anything_stolen", type: "radio_group" },
      {
        id: "stolen_items", type: "repeater", conditional: { field: "was_anything_stolen", value: "Yes" }, fields: [
          { id: "item_name", type: "text" },
          { id: "item_value", type: "number" },
          { id: "item_description", type: "text" }]
      }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "own_vehicle_make", type: "text", validation: { required: true } },
      { id: "own_vehicle_model", type: "text", validation: { required: true } },
      { id: "own_vehicle_year", type: "number", validation: { required: true } },
      { id: "own_vehicle_color", type: "text", validation: { required: true } },
      { id: "own_license_plate", type: "text", validation: { required: true } },
      { id: "own_vin_number", type: "text" }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "suspect_info", type: "textarea" },
      { id: "vehicle_involved", type: "radio_group", validation: { required: true } },
      { id: "vehicle_description", type: "textarea", conditional: { field: "vehicle_involved", value: "Yes" } },
      { id: "evidence_upload", type: "file_upload" },
      { id: "witness_present", type: "radio_group" }
    ]
  }
];

const fraudScamFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "time_occurred", type: "datetime_range", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "financial_loss", type: "radio_group" },
      { id: "loss_amount", type: "number", conditional: { field: "financial_loss", value: "Yes" } },
      { id: "payment_method", type: "text", conditional: { field: "financial_loss", value: "Yes" } },
      { id: "identity_stolen", type: "radio_group" },
      { id: "identity_used_for", type: "textarea", conditional: { field: "identity_stolen", value: "Yes" } },
      { id: "counterfeit_occurred", type: "radio_group" },
      { id: "counterfeit_details", type: "textarea", conditional: { field: "counterfeit_occurred", value: "Yes" } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "suspect_info", type: "textarea" },
      { id: "evidence_upload", type: "file_upload" },
      { id: "witness_present", type: "radio_group" }
    ]
  }
];

const cybercrimeFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "incident_discovery_date", type: "datetime", validation: { required: true } },
      { id: "platform", type: "text", validation: { required: true } },
      { id: "incident_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "suspect_info", type: "textarea" },
      { id: "financial_loss", type: "radio_group" },
      { id: "loss_amount", type: "number", conditional: { field: "financial_loss", value: "Yes" } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "evidence_upload", type: "file_upload" },
      { id: "additional_info", type: "textarea" }
    ]
  }
];

const drugsWeaponsPublicOrderFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "safety_disclaimer", type: "static_text" },
      { id: "location", type: "location", validation: { required: true } },
      { id: "activity_timing", type: "text" },
      { id: "activity_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "suspect_count", type: "number", defaultValue: 1 },
      { id: "suspect_description", type: "textarea" },
      { id: "vehicle_involved", type: "radio_group" },
      { id: "vehicle_description", type: "textarea", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "weapon_involved", type: "radio_group" },
      { id: "weapon_description", type: "text", conditional: { field: "weapon_involved", value: "Yes" } },
      { id: "evidence_upload", type: "file_upload" }
    ]
  }
];

const environmentalCrimesFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "hazard_disclaimer", type: "static_text" },
      { id: "location", type: "location", validation: { required: true } },
      { id: "incident_datetime", type: "datetime", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "incident_description", type: "textarea", validation: { required: true } },
      { id: "material_description", type: "textarea" },
      { id: "is_hazardous", type: "radio_group" }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "suspect_description", type: "textarea" },
      { id: "vehicle_description", type: "textarea" },
      { id: "evidence_upload", type: "file_upload", validation: { required: true } }
    ]
  }
];

const suspiciousActivityFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "activity_datetime", type: "datetime_range", validation: { required: true } },
      { id: "activity_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "subject_description", type: "textarea", validation: { required: true } },
      { id: "vehicle_involved", type: "radio_group" },
      { id: "vehicle_description", type: "textarea", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "evidence_upload", type: "file_upload" }
    ]
  }
];

const trafficRoadSafetyFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "incident_datetime", type: "datetime", validation: { required: true } },
      { id: "incident_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "vehicle_description", type: "textarea", validation: { required: true } },
      { id: "license_plate", type: "text" },
      { id: "driver_description", type: "textarea" }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "evidence_upload", type: "file_upload" },
      { id: "witness_present", type: "radio_group" },
      {
        id: "witness_details", type: "repeater", conditional: { field: "witness_present", value: "Yes" }, fields: [
          { id: "witness_name", type: "text" },
          { id: "witness_contact", type: "text" }
        ]
      }
    ]
  }
];

const publicSafetyCommunityConcernsFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "location", type: "location", validation: { required: true } },
      { id: "concern_datetime", type: "datetime" },
      { id: "concern_description", type: "textarea", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "person_involved_description", type: "textarea" },
      { id: "vehicle_involved_description", type: "textarea" },
      { id: "evidence_upload", type: "file_upload" }
    ]
  }
];

const missingPersonFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [{ id: "disclaimer", type: "static_text" }]
  },
  {
    step: 2,
    fields: [
      { id: "person_name", type: "text", validation: { required: true } },
      { id: "person_age", type: "number", validation: { required: true } },
      { id: "person_gender", type: "text" },
      { id: "person_description", type: "textarea", validation: { required: true } },
      { id: "person_photo", type: "file_upload", validation: { required: true } }
    ]
  },
  {
    step: 3,
    fields: [
      { id: "last_seen_datetime", type: "datetime", validation: { required: true } },
      { id: "last_seen_location", type: "location", validation: { required: true } },
      { id: "last_seen_clothing", type: "textarea", validation: { required: true } },
      { id: "circumstances", type: "textarea", validation: { required: true } }
    ]
  }
];

const welfareCheckFormSteps: FormStepStructure[] = [
  {
    step: 1,
    fields: [
      { id: "disclaimer", type: "static_text" },
      { id: "subject_name", type: "text" },
      { id: "subject_location", type: "location", validation: { required: true } }
    ]
  },
  {
    step: 2,
    fields: [
      { id: "reason_for_check", type: "textarea", validation: { required: true } },
      { id: "last_contact_date", type: "datetime", validation: { required: true } },
      { id: "your_relationship", type: "text", validation: { required: true } }
    ]
  }
];

const crimeDataStructure = {
  category_structures: {
    report_a_crime: {
      categories: {
        violence_threats_against_person: {
          forms: {
            assault_attack: { steps: violenceThreatsFormSteps },
            robbery_mugging: { steps: violenceThreatsFormSteps },
            threats_harassment_stalking: { steps: violenceThreatsFormSteps },
            extortion_blackmail: { steps: violenceThreatsFormSteps },
            sexual_offense: { steps: violenceThreatsFormSteps },
            kidnapping_abduction: { steps: violenceThreatsFormSteps },
            domestic_family_violence: { steps: violenceThreatsFormSteps },
            human_trafficking: { steps: violenceThreatsFormSteps },
            hate_crime: { steps: violenceThreatsFormSteps }
          }
        },
        theft_burglary_property_damage: {
          forms: {
            burglary_break_in: { steps: theftBurglaryFormSteps },
            theft_personal_property: { steps: theftBurglaryFormSteps },
            mail_theft: { steps: theftBurglaryFormSteps },
            vandalism_property_damage: { steps: theftBurglaryFormSteps },
            arson: { steps: theftBurglaryFormSteps },
            criminal_trespassing: { steps: theftBurglaryFormSteps }
          }
        },
        vehicle_related_crime: {
          forms: {
            motor_vehicle_theft: { steps: vehicleCrimeFormSteps },
            theft_from_vehicle: { steps: vehicleCrimeFormSteps },
            hit_and_run: { steps: vehicleCrimeFormSteps },
            vehicle_vandalism: { steps: vehicleCrimeFormSteps }
          }
        },
        fraud_scams_financial_crime: {
          forms: {
            fraud_scam: { steps: fraudScamFormSteps },
            identity_theft: { steps: fraudScamFormSteps },
            counterfeiting_forgery: { steps: fraudScamFormSteps }
          }
        },
        cybercrime: {
          forms: {
            hacking: { steps: cybercrimeFormSteps },
            online_harassment_cyberstalking: { steps: cybercrimeFormSteps },
            phishing_spoofing: { steps: cybercrimeFormSteps },
            ransomware_attack: { steps: cybercrimeFormSteps },
            distribution_illegal_content: { steps: cybercrimeFormSteps },
            online_impersonation: { steps: cybercrimeFormSteps }
          }
        },
        drugs_weapons_public_order: {
          forms: {
            illegal_drug_activity: { steps: drugsWeaponsPublicOrderFormSteps },
            unlawful_weapon_possession: { steps: drugsWeaponsPublicOrderFormSteps },
            indecent_exposure: { steps: drugsWeaponsPublicOrderFormSteps },
            public_disturbance: { steps: drugsWeaponsPublicOrderFormSteps },
            prostitution_solicitation: { steps: drugsWeaponsPublicOrderFormSteps }
          }
        },
        environmental_crimes: {
          forms: {
            illegal_dumping: { steps: environmentalCrimesFormSteps },
            wildlife_crime: { steps: environmentalCrimesFormSteps }
          }
        }
      }
    },
    report_a_concern: {
      categories: {
        suspicious_activity: {
          forms: {
            prowling_casing: { steps: suspiciousActivityFormSteps },
            suspicious_vehicle: { steps: suspiciousActivityFormSteps },
            suspicious_package: { steps: suspiciousActivityFormSteps },
            unknown_visitor_impersonation: { steps: suspiciousActivityFormSteps }
          }
        },
        traffic_road_safety: {
          forms: {
            dangerous_reckless_driving: { steps: trafficRoadSafetyFormSteps },
            driving_under_influence: { steps: trafficRoadSafetyFormSteps },
            traffic_collision_non_injury: { steps: trafficRoadSafetyFormSteps },
            road_hazard: { steps: trafficRoadSafetyFormSteps },
            illegal_parking: { steps: trafficRoadSafetyFormSteps },
            abandoned_vehicle: { steps: trafficRoadSafetyFormSteps }
          }
        },
        public_safety_community_concerns: {
          forms: {
            public_hazard: { steps: publicSafetyCommunityConcernsFormSteps },
            noise_complaint: { steps: publicSafetyCommunityConcernsFormSteps },
            missing_person: { steps: missingPersonFormSteps },
            animal_related_concern: { steps: publicSafetyCommunityConcernsFormSteps },
            code_violation: { steps: publicSafetyCommunityConcernsFormSteps },
            welfare_check: { steps: welfareCheckFormSteps }
          }
        }
      }
    }
  }
};

export function getReportTypeKeys() {
  return Object.keys(crimeDataStructure.category_structures);
}

export function getCategoryKeysForReportType(reportTypeKey: string) {
  const reportType = (crimeDataStructure.category_structures as any)[reportTypeKey];
  return reportType ? Object.keys(reportType.categories) : [];
}

export function getFormKeysForCategory(reportTypeKey: string, categoryKey: string) {
  const reportType = (crimeDataStructure.category_structures as any)[reportTypeKey];
  const category = reportType?.categories?.[categoryKey];
  return category ? Object.keys(category.forms) : [];
}

export function getFormStructure(reportTypeKey: string, categoryKey: string, formKey: string): FormDefinitionStructure | undefined {
  try {
    return (crimeDataStructure.category_structures as any)[reportTypeKey].categories[categoryKey].forms[formKey];
  } catch (e) {
    return undefined;
  }
}