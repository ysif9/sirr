/**
 * A template for all crimes involving violence against a person.
 */
const violenceThreatsFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "location", label: "Where did this happen?", type: "location", helperText: "Provide an address or mark on the map.", validation: { required: true } },
      { id: "incident_date", label: "Date of Incident", type: "date", validation: { required: true } },
      { id: "incident_time", label: "Time of Incident", type: "time", validation: { required: true } },
      { id: "incident_description", label: "Please describe what happened in detail.", type: "textarea", placeholder: "Describe the events in the order they occurred...", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Victim Information",
    fields: [
      { id: "victim_identity", label: "Who was the victim?", type: "radio_group", options: ["I was", "Someone else"], validation: { required: true } },
      { id: "victim_name", label: "Victim's Full Name", type: "text", conditional: { field: "victim_identity", value: "Someone else" } },
      { id: "child_involved", label: "Was a child endangered?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "anyone_injured", label: "Was any one injured?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "victim_injuries", label: "What injuries, if any, were sustained?", type: "textarea", placeholder: "e.g., cuts, bruises, broken bones." }
    ]
  },
  {
    step: 3,
    title: "Suspect Information",
    fields: [
      { id: "suspect_count", label: "How many suspects were there?", type: "number", defaultValue: 1 },
      { id: "suspect_description", label: "Please describe the suspect(s).", type: "textarea", placeholder: "Include details like gender, age, height, build, clothing, and any distinguishing features.", validation: { required: true } },
      { id: "weapon_involved", label: "Was a weapon used?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
      { id: "weapon_type", label: "What kind of weapon?", type: "text", placeholder: "e.g., knife, bat, firearm.", conditional: { field: "weapon_involved", value: "Yes" } },
      { id: "vehicle_involved", label: "Was a vehilce used or sighted?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
      { id: "vehicle_description", label: "Description of any involved vehicles.", type: "textarea", placeholder: "Make, model, license plate.", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 4,
    title: "Evidence & Witnesses",
    fields: [
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "Please upload any visual evidence related to the incident." },
      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "witness_details", label: "Witness Information", type: "repeater", conditional: { field: "witness_present", value: "Yes" }, fields: [
        { id: "witness_name", label: "Witness Name", type: "text" },
        { id: "witness_contact", label: "Witness Contact Info", type: "text" }
      ]}
    ]
  }
];

/**
 * A template for all theft and property damage crimes.
 */
const theftBurglaryFormSteps = [
  {
    step: 1,
    title: "Location & Timing",
    fields: [
      { id: "location", label: "Where did the burglary happen?", type: "location", validation: { required: true } },
      { id: "property_type", label: "What type of property was entered?", type: "select", options: ["House", "Apartment/Condo", "Business", "Garage", "Storage Unit", "Other"], validation: { required: true } },
      { id: "time_discovered", label: "When did you discover the break-in?", type: "datetime", validation: { required: true } },
      { id: "time_occurred", label: "When do you believe it occurred?", type: "datetime_range", helperText: "Provide the time range when you were away or the property was unoccupied." }
    ]
  },
  {
    step: 2,
    title: "Incident Details",
    fields: [
      { id: "was_anything_stolen", label: "Was anything stolen?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "stolen_items", label: "List of Stolen Items", type: "repeater", conditional: { field: "was_anything_stolen", value: "Yes" }, fields: [
        { id: "item_name", label: "Item", type: "text", placeholder: "e.g., Laptop, Jewelry" },
        { id: "item_value", label: "Estimated Value ($)", type: "number" },
        { id: "item_description", label: "Description / Serial Number", type: "text" }]},
      { id: "was_anything_damaged", label: "Was there any damage to a property or item?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "damage_description", label: "What was damaged?", type: "textarea", placeholder: "Describe any damaged doors, windows, furniture, etc.", conditional: { field: "was_anything_damaged", value: "Yes" } }
    ]
  },
 {
    step: 3,
    title: "Suspect & Evidence",
    fields: [
      { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, etc..." },
      { id: "vehicle_involved", label: "Was a vehilce used or sighted?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
      { id: "vehicle_description", label: "Description of any involved vehicles.", type: "textarea", placeholder: "Make, model, license plate.", conditional: { field: "vehicle_involved", value: "Yes" } },
      { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "e.g., doorbell camera footage, photos." },
      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No"] }
    ]
  },
];

/**
 * A template for all vehicle-related crimes.
 */
const vehicleCrimeFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "location", label: "Where was the vehicle parked?", type: "location", validation: { required: true } },
      { id: "time_occurred", label: "When do you believe the theft occurred?", type: "datetime_range", validation: { required: true } },
      { id: "vehicle_entered", label: "Was your vehicle entered?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
      { id: "vehicle_entry", label: "How did the suspect get into your vehicle?", type: "select", options: ["Window was broken", "Doors were unlocked", "Trunk was forced open", "Unsure", "Other"],
        conditional: { field: "vehicle_entered", value: "Yes" }},
      { id: "was_anything_stolen", label: "Was anything stolen?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "stolen_items", label: "List of Stolen Items", type: "repeater", conditional: { field: "was_anything_stolen", value: "Yes" }, fields: [
        { id: "item_name", label: "Item", type: "text", placeholder: "e.g., Laptop, Jewelry" },
        { id: "item_value", label: "Estimated Value ($)", type: "number" },
        { id: "item_description", label: "Description / Serial Number", type: "text" }]}
    ]
  },
  {
    step: 2,
    title: "Vehicles Information",
    fields: [
      { id: "own_vehicle_make", label: "Vehicle Make", type: "text", placeholder: "e.g., Honda", validation: { required: true } },
      { id: "own_vehicle_model", label: "Vehicle Model", type: "text", placeholder: "e.g., Civic", validation: { required: true } },
      { id: "own_vehicle_year", label: "Year", type: "number", validation: { required: true } },
      { id: "own_vehicle_color", label: "Color", type: "text", validation: { required: true } },
      { id: "own_license_plate", label: "License Plate Number", type: "text", validation: { required: true } },
      { id: "own_vin_number", label: "VIN", type: "text", helperText: "Vehicle Identification Number, found on your dashboard or registration." }
    ]
  },
  {
    step: 3,
    title: "Suspect & Evidence",
    fields: [
      { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, etc..." },
      { id: "vehicle_involved", label: "Was a vehilce used or sighted?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
      { id: "vehicle_description", label: "Description of any involved vehicles.", type: "textarea", placeholder: "Make, model, license plate.", conditional: { field: "vehicle_involved", value: "Yes" } },
      { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "e.g., doorbell camera footage, photos." },
      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No"] }
    ]
  }
];

/**
 * A template for all financial crimes and scams.
 */
const fraudScamFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "location", label: "Where did that happen?", type: "location", validation: { required: true } },
      { id: "time_occurred", label: "When do you believe it occurred?", type: "datetime_range", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Possible Damages",
    fields: [
      { id: "financial_loss", label: "Did you lose any money or property?", type: "radio_group", options: ["Yes", "No"] },
      { id: "loss_amount", label: "Total Estimated Loss ($)", type: "number", conditional: { field: "financial_loss", value: "Yes" } },
      { id: "payment_method", label: "How did you pay?", type: "text", placeholder: "e.g., Credit Card, Bank Transfer, Gift Card, Cryptocurrency", conditional: { field: "financial_loss", value: "Yes" } },
      { id: "identity_stolen", label: "Was your identity stolen?", type: "radio_group", options: ["Yes", "No"] },
      { id: "identity_used_for", label: "If yes, what was it used for?", type: "textarea", placeholder: "e.g., opening accounts, taking loans, online purchases", conditional: { field: "identity_stolen", value: "Yes" } },
      { id: "counterfeit_occurred", label: "Was anything counterfeited or forged?", type: "radio_group", options: ["Yes", "No"] },
      { id: "counterfeit_details", label: "If yes, what was counterfeited?", type: "textarea", placeholder: "e.g., checks, documents, signatures, ID cards", conditional: { field: "counterfeit_occurred", value: "Yes" } }
    ]
  },
  {
    step: 3,
    title: "Suspect & Evidence",
    fields: [
      { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, etc..." },
      { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "e.g., doorbell camera footage, photos." },
      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No"] }
    ]
  }
];

/**
 * A template for all cybercrime incidents.
 */
const cybercrimeFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "incident_discovery_date", label: "When did you discover this incident?", type: "datetime", validation: { required: true } },
      { id: "platform", label: "Where did this happen?", type: "text", placeholder: "e.g., Facebook, Gmail, Company Website, Personal Computer", validation: { required: true } },
      { id: "incident_description", label: "Please describe what happened.", type: "textarea", placeholder: "Provide a detailed account of the events, what was said, done, or compromised.", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Suspect & Financial Impact",
    fields: [
      { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Include usernames, profile links, email addresses, phone numbers, or any other identifiers." },
      { id: "financial_loss", label: "Did this incident result in a financial loss?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "loss_amount", label: "Estimated Financial Loss ($)", type: "number", conditional: { field: "financial_loss", value: "Yes" } }
    ]
  },
  {
    step: 3,
    title: "Evidence",
    fields: [
      { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Upload screenshots, emails, logs, or ransom notes. Do NOT download or save illegal material to your device." },
      { id: "additional_info", label: "Additional Information", type: "textarea", placeholder: "Is there anything else we should know?" }
    ]
  }
];

/**
 * A template for all drug, weapon, and public order offenses.
 */
const drugsWeaponsPublicOrderFormSteps = [
  {
    step: 1,
    title: "Activity Details",
    fields: [
      { id: "safety_disclaimer", label: "Disclaimer", type: "static_text", text: "If this is an active, life-threatening situation (e.g., someone is brandishing a weapon), please CALL 911 immediately." },
      { id: "location", label: "Where is the activity happening?", type: "location", validation: { required: true } },
      { id: "activity_timing", label: "When does this usually occur?", type: "text", placeholder: "e.g., Ongoing, late nights, weekend afternoons." },
      { id: "activity_description", label: "Describe the activity in detail.", type: "textarea", placeholder: "What have you seen or heard that constitutes the offense?", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Suspects & Vehicles",
    fields: [
      { id: "suspect_count", label: "How many people are involved?", type: "number", defaultValue: 1 },
      { id: "suspect_description", label: "Please describe the person or people involved.", type: "textarea", placeholder: "Include details like gender, age, clothing, and any distinguishing features." },
      { id: "vehicle_involved", label: "Was a vehicle involved?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "vehicle_description", label: "Describe any involved vehicles.", type: "textarea", placeholder: "Include make, model, color, license plate, and any unique features.", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 3,
    title: "Evidence",
    fields: [
      { id: "weapon_involved", label: "Did you see a weapon?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "weapon_description", label: "What kind of weapon was it?", type: "text", placeholder: "e.g., Handgun, Rifle, Knife, Bat", conditional: { field: "weapon_involved", value: "Yes" } },
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "Only upload evidence if you can do so safely." }
    ]
  }
];

/**
 * A template for all environmental crime reports.
 */
const environmentalCrimesFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "hazard_disclaimer", label: "Immediate Danger Disclaimer", type: "static_text", text: "If the incident poses an immediate threat to health or life (e.g., chemical spill, fire), call 911 immediately." },
      { id: "location", label: "Where did the incident occur?", type: "location", validation: { required: true } },
      { id: "incident_datetime", label: "When did you discover this?", type: "datetime", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Description & Materials",
    fields: [
      { id: "incident_description", label: "Please describe the incident in detail.", type: "textarea", placeholder: "What did you observe? What kind of animals or environment are affected?", validation: { required: true } },
      { id: "material_description", label: "Describe the materials or substances involved.", type: "textarea", placeholder: "e.g., Construction debris, barrels of liquid, tires, animal carcasses." },
      { id: "is_hazardous", label: "Does the material seem hazardous?", type: "radio_group", options: ["Yes", "No", "Unsure"], helperText: "Look for warning labels, strong odors, or dead vegetation nearby." }
    ]
  },
  {
    step: 3,
    title: "Suspect & Evidence",
    fields: [
      { id: "suspect_description", label: "Do you have any suspect information?", type: "textarea", placeholder: "Describe any people, company names, or logos you saw." },
      { id: "vehicle_description", label: "Describe any vehicles involved.", type: "textarea", placeholder: "Include make, model, license plate, and type (e.g., dump truck, van)." },
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "Please upload any visual evidence if it is safe to do so.", validation: { required: true } }
    ]
  }
];

/**
 * A template for all suspicious activity reports.
 */
const suspiciousActivityFormSteps = [
  {
    step: 1,
    title: "Activity Details",
    fields: [
      { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
      { id: "activity_datetime", label: "When did this happen?", type: "datetime_range", validation: { required: true } },
      { id: "activity_description", label: "Please describe the suspicious behavior in detail.", type: "textarea", placeholder: "e.g., someone looking into car windows, testing doors, observing a house for a long time.", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Subject & Vehicle Information",
    fields: [
      { id: "subject_description", label: "Please describe the person(s) involved.", type: "textarea", placeholder: "Include details like gender, age, build, clothing, and any distinguishing features.", validation: { required: true } },
      { id: "vehicle_involved", label: "Was a vehicle involved?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "vehicle_description", label: "Describe the vehicle, if any.", type: "textarea", placeholder: "Include make, model, color, license plate, and any unique features.", conditional: { field: "vehicle_involved", value: "Yes" } }
    ]
  },
  {
    step: 3,
    title: "Evidence",
    fields: [
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "Only upload evidence if it is safe to do so." }
    ]
  }
];

/**
 * A template for all traffic and road safety concerns.
 */
const trafficRoadSafetyFormSteps = [
  {
    step: 1,
    title: "Incident Details",
    fields: [
      { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
      { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
      { id: "incident_description", label: "Please describe what happened.", type: "textarea", placeholder: "Provide a detailed account of the driving behavior, hazard, or collision.", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Vehicle & Driver Information",
    fields: [
      { id: "vehicle_description", label: "Describe the vehicle(s) involved.", type: "textarea", placeholder: "Include make, model, color, and any distinguishing features.", validation: { required: true } },
      { id: "license_plate", label: "License Plate Number", type: "text", helperText: "Even a partial plate number is helpful." },
      { id: "driver_description", label: "If you saw the driver, please provide a description.", type: "textarea" }
    ]
  },
  {
    step: 3,
    title: "Evidence & Witnesses",
    fields: [
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "e.g., dashcam footage, photos of the scene." },
      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
      { id: "witness_details", label: "Witness Information", type: "repeater", conditional: { field: "witness_present", value: "Yes" }, fields: [
        { id: "witness_name", label: "Witness Name", type: "text" },
        { id: "witness_contact", label: "Witness Contact Info", type: "text" }
      ]}
    ]
  }
];

/**
 * A template for all public safety and community concerns.
 */
const publicSafetyCommunityConcernsFormSteps = [
  {
    step: 1,
    title: "Concern Details",
    fields: [
      { id: "location", label: "Where is the concern located?", type: "location", validation: { required: true } },
      { id: "concern_datetime", label: "When did you observe this?", type: "datetime" },
      { id: "concern_description", label: "Please describe the concern in detail.", type: "textarea", placeholder: "e.g., downed power line, chronic noise issue, animal neglect.", validation: { required: true } }
    ]
  },
  {
    step: 2,
    title: "Additional Information & Evidence",
    fields: [
      { id: "person_involved_description", label: "If a person is involved, please provide a description.", type: "textarea" },
      { id: "vehicle_involved_description", label: "If a vehicle is involved, please provide a description.", type: "textarea" },
      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "Please upload any visual evidence if it is safe to do so." }
    ]
  }
];


// ========================================================================
// Main Crime Data Structure
// ========================================================================

const crimeData = {
  category_structures: {
    report_a_crime: {
      title: "Report a Crime",
      subtitle: "For incidents where you believe a law has been broken.",
      categories: {
        violence_threats_against_person: {
          title: "Violence & Threats Against a Person",
          subtitle: "Physical harm, threats, or offenses against liberty.",
          forms: {
            assault_attack: {
              title: "Report an Assault / Attack",
              steps: violenceThreatsFormSteps
            },
            robbery_mugging: {
              title: "Report a Robbery / Mugging",
              steps: violenceThreatsFormSteps
            },
            threats_harassment_stalking: {
              title: "Report Threats, Harassment, or Stalking",
              steps: violenceThreatsFormSteps
            },
            extortion_blackmail: {
                title: "Report Extortion or Blackmail",
                steps: violenceThreatsFormSteps
            },
            sexual_offense: {
                title: "Report a Sexual Offense",
                steps: violenceThreatsFormSteps
            },
            kidnapping_abduction: {
                title: "Report a Kidnapping or Abduction",
                steps: violenceThreatsFormSteps
            },
            domestic_family_violence: {
                title: "Report Domestic & Family Violence",
                steps: violenceThreatsFormSteps
            },
            human_trafficking: {
                title: "Report Suspected Human Trafficking",
                steps: violenceThreatsFormSteps
            },
            hate_crime: {
              title: "Report a Hate Crime or Bias Incident",
              steps: violenceThreatsFormSteps
            }
          }
        },
        theft_burglary_property_damage: {
          title: "Theft, Burglary & Property Damage",
          subtitle: "Stolen property or damage where no force was used.",
          forms: {
            burglary_break_in: {
              title: "Report a Burglary / Break-in",
              steps: theftBurglaryFormSteps
            },
            theft_personal_property: {
              title: "Report Theft of Personal Property",
              steps: theftBurglaryFormSteps
            },
            mail_theft: {
              title: "Report Mail Theft",
              steps: theftBurglaryFormSteps
            },
            vandalism_property_damage: {
              title: "Report Vandalism / Property Damage",
              steps: theftBurglaryFormSteps
            },
            arson: {
              title: "Report Arson (Deliberate Fire)",
              steps: theftBurglaryFormSteps
            },
            criminal_trespassing: {
              title: "Report Criminal Trespassing",
              steps: theftBurglaryFormSteps
            }
          }
        },
        vehicle_related_crime: {
          title: "Vehicle-Related Crime",
          subtitle: "Crimes specifically involving motor vehicles.",
          forms: {
            motor_vehicle_theft: {
              title: "Report Motor Vehicle Theft",
              steps: vehicleCrimeFormSteps
            },
            theft_from_vehicle: {
              title: "Report Theft From a Vehicle",
              steps: vehicleCrimeFormSteps
            },
            hit_and_run: {
              title: "Report a Hit & Run Collision",
              steps: vehicleCrimeFormSteps
            },
            vehicle_vandalism: {
              title: "Report Vehicle Vandalism",
              steps: vehicleCrimeFormSteps
            }
          }
        },
        fraud_scams_financial_crime: {
          title: "Fraud, Scams & Financial Crime",
          subtitle: "Deception for financial gain or to compromise info.",
          forms: {
            fraud_scam: {
              title: "Report a Fraud / Scam",
              steps: fraudScamFormSteps
            },
            identity_theft: {
              title: "Report Identity Theft",
              steps: fraudScamFormSteps
            },
            counterfeiting_forgery: {
                title: "Report Counterfeiting or Forgery",
                steps: fraudScamFormSteps
            }
          }
        },
        cybercrime: {
            title: "Cybercrime",
            subtitle: "Criminal activity involving a computer or network.",
            forms: {
                hacking: {
                    title: "Report Hacking",
                    steps: cybercrimeFormSteps
                },
                online_harassment_cyberstalking: {
                    title: "Report Online Harassment or Cyberstalking",
                    steps: cybercrimeFormSteps
                },
                phishing_spoofing: {
                    title: "Report Phishing / Spoofing",
                    steps: cybercrimeFormSteps
                },
                ransomware_attack: {
                    title: "Report a Ransomware Attack",
                    steps: cybercrimeFormSteps
                },
                distribution_illegal_content: {
                    title: "Report Distribution of Illegal Online Content",
                    steps: cybercrimeFormSteps
                },
                online_impersonation: {
                    title: "Report Online Impersonation",
                    steps: cybercrimeFormSteps
                }
            }
        },
        drugs_weapons_public_order: {
          title: "Drugs, Weapons & Public Order",
          subtitle: "Controlled substances, illegal weapons, etc.",
          forms: {
            illegal_drug_activity: {
              title: "Report Illegal Drug Activity",
              steps: drugsWeaponsPublicOrderFormSteps
            },
            unlawful_weapon_possession: {
                title: "Report Unlawful Weapon Possession",
                steps: drugsWeaponsPublicOrderFormSteps
            },
            indecent_exposure: {
                title: "Report Indecent Exposure",
                steps: drugsWeaponsPublicOrderFormSteps
            },
            public_disturbance: {
              title: "Report a Public Disturbance",
              steps: drugsWeaponsPublicOrderFormSteps
            },
            prostitution_solicitation: {
                title: "Report Prostitution / Solicitation",
                steps: drugsWeaponsPublicOrderFormSteps
            }
          }
        },
        environmental_crimes: {
            title: "Environmental Crimes",
            subtitle: "Offenses that harm the natural environment.",
            forms: {
                illegal_dumping: {
                    title: "Report Illegal Dumping / Pollution",
                    steps: environmentalCrimesFormSteps
                },
                wildlife_crime: {
                    title: "Report a Wildlife Crime",
                    steps: environmentalCrimesFormSteps
                }
            }
        }
      }
    },
    report_a_concern: {
      title: "Report a Concern",
      subtitle: "For public safety issues, suspicious activity, or community alerts.",
      categories: {
        suspicious_activity: {
          title: "Suspicious Activity",
          subtitle: "Behavior that may be a precursor to a crime.",
          forms: {
            prowling_casing: {
              title: "Report Prowling / Casing",
              steps: suspiciousActivityFormSteps
            },
            suspicious_vehicle: {
              title: "Report a Suspicious Vehicle",
              steps: suspiciousActivityFormSteps
            },
            suspicious_package: {
                title: "Report a Suspicious Package or Item",
                steps: suspiciousActivityFormSteps
            },
            unknown_visitor_impersonation: {
                title: "Report an Unknown Visitor / Possible Impersonation",
                steps: suspiciousActivityFormSteps
            }
          }
        },
        traffic_road_safety: {
          title: "Traffic & Road Safety",
          subtitle: "Driving issues that do not involve a crime against a person.",
          forms: {
            dangerous_reckless_driving: {
              title: "Report Dangerous / Reckless Driving",
              steps: trafficRoadSafetyFormSteps
            },
            driving_under_influence: {
              title: "Report a Driver Under the Influence (DUI)",
              steps: trafficRoadSafetyFormSteps
            },
            traffic_collision_non_injury: {
                title: "Report a Non-Injury Traffic Collision",
                steps: trafficRoadSafetyFormSteps
            },
            road_hazard: {
              title: "Report a Road Hazard",
              steps: trafficRoadSafetyFormSteps
            },
            illegal_parking: {
                title: "Report Illegal Parking",
                steps: trafficRoadSafetyFormSteps
            },
            abandoned_vehicle: {
              title: "Report an Abandoned Vehicle",
              steps: trafficRoadSafetyFormSteps
            }
          }
        },
        public_safety_community_concerns: {
          title: "Public Safety & Community Concerns",
          subtitle: "General hazards or non-criminal neighborhood issues.",
          forms: {
            public_hazard: {
              title: "Report a Public Hazard",
              steps: publicSafetyCommunityConcernsFormSteps
            },
            noise_complaint: {
              title: "Report a Noise Complaint",
              steps: publicSafetyCommunityConcernsFormSteps
            },
            missing_person: {
              title: "Report a Missing Person",
              steps: [
                {
                  step: 1,
                  title: "Important Information",
                  fields: [
                    { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If this person is in immediate danger, is a young child, or has a condition that places them at high risk, please call 911 immediately instead of using this form." }
                  ]
                },
                {
                  step: 2,
                  title: "Missing Person's Details",
                  fields: [
                    { id: "person_name", label: "Full Name of Missing Person", type: "text", validation: { required: true } },
                    { id: "person_age", label: "Age", type: "number", validation: { required: true } },
                    { id: "person_gender", label: "Gender", type: "text" },
                    { id: "person_description", label: "Physical Description", type: "textarea", placeholder: "Include height, weight, hair color, eye color, and distinguishing features like scars or tattoos.", validation: { required: true } },
                    { id: "person_photo", label: "Upload a recent photo", type: "file_upload", validation: { required: true }, helperText: "A clear, recent photo is extremely helpful." }
                  ]
                },
                {
                  step: 3,
                  title: "Last Known Information",
                  fields: [
                    { id: "last_seen_datetime", label: "Date and Time Last Seen", type: "datetime", validation: { required: true } },
                    { id: "last_seen_location", label: "Location Last Seen", type: "location", placeholder: "Provide the address or area where they were last seen.", validation: { required: true } },
                    { id: "last_seen_clothing", label: "What were they last seen wearing?", type: "textarea", validation: { required: true } },
                    { id: "circumstances", label: "Describe the circumstances surrounding their disappearance.", type: "textarea", validation: { required: true } }
                  ]
                }
              ]
            },
            animal_related_concern: {
              title: "Report an Animal-Related Concern",
              steps: publicSafetyCommunityConcernsFormSteps
            },
            code_violation: {
                title: "Report a Code Violation",
                steps: publicSafetyCommunityConcernsFormSteps
            },
            welfare_check: {
              title: "Request a Welfare Check",
              steps: [
                {
                  step: 1,
                  title: "Subject Information",
                  fields: [
                    { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If you believe someone is in immediate, life-threatening danger, please call 911." },
                    { id: "subject_name", label: "Name of the person you are concerned about.", type: "text" },
                    { id: "subject_location", label: "Where can authorities find this person?", type: "location", helperText: "A full, exact address is critical for this request.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Reason for Concern",
                  fields: [
                    { id: "reason_for_check", label: "Why are you requesting a welfare check? Be specific.", type: "textarea", placeholder: "e.g., haven't heard from them in an unusual amount of time, they made concerning statements, missed an important appointment.", validation: { required: true } },
                    { id: "last_contact_date", label: "When was your last contact with them?", type: "datetime", validation: { required: true } },
                    { id: "your_relationship", label: "What is your relationship to this person?", type: "text", placeholder: "e.g., family, friend, neighbor, coworker.", validation: { required: true } }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  }
}


export type Field = {
  id: string
  label: string
  type: string
  text?: string // For static_text type
  helperText?: string
  placeholder?: string
  validation?: { required?: boolean }
  options?: string[]
  conditional?: { field: string; value: string }
  fields?: Field[] // For repeater
  defaultValue?: any
}

export type FormStep = {
  step: number
  title: string
  fields: Field[]
}

export type FormDefinition = {
  title: string
  steps: FormStep[]
}

// Accessor functions
const structures = crimeData.category_structures

export function getReportTypes() {
  return structures
}

export function getCategoriesForReportType(reportTypeKey: string) {
  const reportType = structures[reportTypeKey as keyof typeof structures]
  return reportType ? reportType.categories : null
}

export function getFormsForCategory(reportTypeKey: string, categoryKey: string) {
  const categories = getCategoriesForReportType(reportTypeKey)
  if (!categories) return null
  const category = categories[categoryKey as keyof typeof categories] as any // Type assertion to 'any'
  return category ? category.forms : null // Access 'forms' property
}

export function getFormDefinition(
  reportTypeKey: string,
  categoryKey: string,
  formKey: string
): FormDefinition | undefined {
  const forms = getFormsForCategory(reportTypeKey, categoryKey)
  if (!forms) return undefined
  return forms[formKey as keyof typeof forms]
}