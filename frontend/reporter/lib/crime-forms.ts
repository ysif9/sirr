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
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "hacked_item", label: "What was hacked?", type: "select", options: ["Email account", "Social Media Account", "Computer/Laptop", "Phone", "Website", "Other"], validation: { required: true } },
                                { id: "incident_datetime", label: "When did you discover the hack?", type: "datetime", validation: { required: true } },
                                { id: "incident_description", label: "Describe what happened.", type: "textarea", placeholder: "How did you know you were hacked? What is the impact?", validation: { required: true } }
                            ]
                        },
                        {
                            step: 2,
                            title: "Evidence",
                            fields: [
                                { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "e.g., suspicious email address, username." },
                                { id: "evidence_upload", label: "Upload evidence", type: "file_upload", helperText: "Screenshots of unauthorized activity, ransom notes, etc." }
                            ]
                        }
                    ]
                },
                online_harassment_cyberstalking: {
                    title: "Report Online Harassment or Cyberstalking",
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "platform", label: "Where is the harassment occurring?", type: "text", placeholder: "e.g., Facebook, Instagram, Twitter, email.", validation: { required: true } },
                                { id: "start_date", label: "When did this start?", type: "date" },
                                { id: "harassment_description", label: "Describe the behavior.", type: "textarea", placeholder: "Include the nature of the harassment, threats, or stalking.", validation: { required: true } }
                            ]
                        },
                        {
                            step: 2,
                            title: "Suspect & Evidence",
                            fields: [
                                { id: "suspect_username", label: "Suspect's username(s) or profile link(s)", type: "text", validation: { required: true } },
                                { id: "evidence_upload", label: "Upload evidence", type: "file_upload", helperText: "Please upload screenshots of the messages, posts, or profiles." }
                            ]
                        }
                    ]
                },
                phishing_spoofing: {
                    title: "Report Phishing / Spoofing",
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "communication_type", label: "How were you contacted?", type: "select", options: ["Email", "Text Message (Smishing)", "Phone Call (Vishing)", "Website"], validation: { required: true } },
                                { id: "sender_info", label: "Sender Information", type: "text", placeholder: "Email address, phone number, or website URL", validation: { required: true } },
                                { id: "company_impersonated", label: "What company/organization was being impersonated?", type: "text", placeholder: "e.g., Your Bank, Apple, IRS" }
                            ]
                        },
                         {
                            step: 2,
                            title: "Description",
                            fields: [
                                 { id: "request_description", label: "What did the message ask you to do?", type: "textarea", placeholder: "e.g., click a link, provide a password, send money.", validation: { required: true } },
                                 { id: "information_lost", label: "Did you provide any sensitive information?", type: "radio_group", options: ["Yes", "No"] }
                            ]
                        }
                    ]
                },
                ransomware_attack: {
                    title: "Report a Ransomware Attack",
                    steps: [
                        {
                            step: 1,
                            title: "Attack Details",
                            fields: [
                                 { id: "device_affected", label: "What device was affected?", type: "text", placeholder: "e.g., Personal Laptop, Company Server", validation: { required: true } },
                                 { id: "attack_datetime", label: "When was the attack discovered?", type: "datetime", validation: { required: true } },
                                 { id: "ransom_demand", label: "What was demanded?", type: "textarea", placeholder: "Describe the ransom note, amount, and payment method (e.g., Bitcoin)." },
                                 { id: "paid_ransom", label: "Did you pay the ransom?", type: "radio_group", options: ["Yes", "No"] }
                            ]
                        },
                         {
                            step: 2,
                            title: "Evidence",
                            fields: [
                                { id: "evidence_upload", label: "Upload evidence", type: "file_upload", helperText: "Screenshot of the ransom note." }
                            ]
                        }
                    ]
                },
                distribution_illegal_content: {
                    title: "Report Distribution of Illegal Online Content",
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "disclaimer", label: "Warning", type: "static_text", text: "You are reporting potentially illegal and harmful content. Do NOT attempt to download or distribute this material yourself." },
                                { id: "content_location", label: "Where was the illegal content found?", type: "textarea", placeholder: "Provide the website URL, social media platform and username, etc.", validation: { required: true } },
                                { id: "content_type", label: "What type of illegal content is it?", type: "select", options: ["Child Sexual Abuse Material (CSAM)", "Terrorist Content", "Promotion of Extreme Violence", "Other"], validation: { required: true } },
                                { id: "content_description", label: "Describe the content and the context.", type: "textarea", validation: { required: true } }
                            ]
                        },
                        {
                            step: 2,
                            title: "Suspect & Evidence",
                            fields: [
                                { id: "suspect_info", label: "Information about the user who posted the content.", type: "textarea", placeholder: "Username, profile link, any known details." },
                                { id: "evidence_upload", label: "Upload Evidence (if safe)", type: "file_upload", helperText: "Please provide screenshots if possible. Do NOT download or save illegal material to your device." }
                            ]
                        }
                    ]
                },
                online_impersonation: {
                    title: "Report Online Impersonation",
                    steps: [
                        {
                            step: 1,
                            title: "Impersonation Details",
                            fields: [
                                { id: "who_is_impersonated", label: "Who is being impersonated?", type: "radio_group", options: ["Me", "Someone else I know", "A public figure/organization"], validation: { required: true } },
                                { id: "victim_name", label: "Full Name of the person/organization being impersonated.", type: "text", validation: { required: true } },
                                { id: "platform", label: "Where is the impersonation happening?", type: "text", placeholder: "e.g., Facebook, Instagram, Gmail account.", validation: { required: true } },
                                { id: "fake_profile_link", label: "Link to the fake profile or username/email.", type: "text", validation: { required: true } }
                            ]
                        },
                        {
                            step: 2,
                            title: "Impact & Evidence",
                            fields: [
                                { id: "impersonation_purpose", label: "How is this fake account being used?", type: "textarea", placeholder: "e.g., sending messages to my friends, posting false information, trying to solicit money.", validation: { required: true } },
                                { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Please upload screenshots of the fake profile and any messages sent from it." }
                            ]
                        }
                    ]
                }
            }
        },
        drugs_weapons_public_order: {
          title: "Drugs, Weapons & Public Order",
          subtitle: "Controlled substances, illegal weapons, etc.",
          forms: {
            illegal_drug_activity: {
              title: "Report Illegal Drug Activity",
              steps: [
                {
                  step: 1,
                  title: "Activity Details",
                  fields: [
                    { id: "location", label: "Where is the activity happening?", type: "location", validation: { required: true } },
                    { id: "activity_type", label: "What kind of activity are you reporting?", type: "checkbox", options: ["Buying/Selling Drugs", "Using Drugs in Public", "Manufacturing/Growing", "Suspicious Activity"], validation: { required: true } },
                    { id: "activity_timing", label: "When does this activity usually occur?", type: "text", placeholder: "e.g., late nights, weekend afternoons." },
                    { id: "activity_description", label: "Describe the activity in detail.", type: "textarea", placeholder: "What have you seen or heard?", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Suspects & Vehicles",
                  fields: [
                    { id: "suspect_description", label: "Describe the people involved.", type: "textarea" },
                    { id: "vehicle_description", label: "Describe any vehicles involved.", type: "textarea", placeholder: "Make, model, color, license plate." }
                  ]
                }
              ]
            },
            unlawful_weapon_possession: {
                title: "Report Unlawful Weapon Possession",
                steps: [
                    {
                        step: 1,
                        title: "Incident Details",
                        fields: [
                            { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If someone is threatening with a weapon, call 911 now." },
                            { id: "location", label: "Where did you see the weapon?", type: "location", validation: { required: true } },
                            { id: "incident_datetime", label: "When did you see this?", type: "datetime", validation: { required: true } },
                            { id: "weapon_type", label: "What kind of weapon was it?", type: "text", placeholder: "e.g., handgun, rifle, knife, illegal firearm.", validation: { required: true } }
                        ]
                    },
                    {
                        step: 2,
                        title: "Person with Weapon",
                        fields: [
                            { id: "suspect_description", label: "Describe the person with the weapon.", type: "textarea", validation: { required: true } },
                            { id: "weapon_context", label: "Describe the context.", type: "textarea", placeholder: "How was the person handling the weapon? Was it concealed? Were threats made?" }
                        ]
                    }
                ]
            },
            indecent_exposure: {
                title: "Report Indecent Exposure",
                steps: [
                     {
                        step: 1,
                        title: "Incident Details",
                        fields: [
                            { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                            { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                            { id: "incident_description", label: "Describe what happened.", type: "textarea", validation: { required: true } }
                        ]
                    },
                     {
                        step: 2,
                        title: "Suspect Information",
                        fields: [
                            { id: "suspect_description", label: "Describe the suspect.", type: "textarea", placeholder: "Gender, age, clothing, etc.", validation: { required: true } },
                            { id: "suspect_vehicle", label: "Was there a vehicle involved?", type: "textarea" }
                        ]
                    }
                ]
            },
            public_disturbance: {
              title: "Report a Public Disturbance",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where is the disturbance happening?", type: "location", validation: { required: true } },
                    { id: "disturbance_type", label: "What type of disturbance is it?", type: "select", options: ["Loud Noise / Party", "Fighting / Arguing", "Intoxicated Person(s)", "Loitering / Panhandling", "Other"], validation: { required: true } },
                    { id: "incident_datetime", label: "When is it happening?", type: "datetime", validation: { required: true } },
                    { id: "incident_description", label: "Describe the disturbance.", type: "textarea", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "People Involved",
                  fields: [
                    { id: "person_count", label: "How many people are involved?", type: "number", defaultValue: 1 },
                    { id: "person_description", label: "Describe the people involved.", type: "textarea" },
                    { id: "weapons_present", label: "Are any weapons visible?", type: "radio_group", options: ["Yes", "No", "Unsure"] }
                  ]
                }
              ]
            },
            prostitution_solicitation: {
                title: "Report Prostitution / Solicitation",
                steps: [
                     {
                        step: 1,
                        title: "Activity Details",
                        fields: [
                            { id: "location", label: "Where is this occurring?", type: "location", validation: { required: true } },
                            { id: "activity_timing", label: "When does this typically occur?", type: "text", placeholder: "e.g., late evenings, weekends." },
                            { id: "activity_description", label: "Describe the activity you have observed.", type: "textarea", placeholder: "e.g., seeing people soliciting cars, observing suspected transactions.", validation: { required: true } }
                        ]
                    },
                    {
                        step: 2,
                        title: "People & Vehicles",
                        fields: [
                            { id: "person_description", label: "Description of people involved.", type: "textarea" },
                            { id: "vehicle_description", label: "Description of vehicles involved.", type: "textarea" }
                        ]
                    }
                ]
            }
          }
        },
        environmental_crimes: {
            title: "Environmental Crimes",
            subtitle: "Offenses that harm the natural environment.",
            forms: {
                illegal_dumping: {
                    title: "Report Illegal Dumping / Pollution",
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "location", label: "Where is the dumping site?", type: "location", validation: { required: true } },
                                { id: "material_type", label: "What materials were dumped?", type: "textarea", placeholder: "e.g., construction debris, household trash, chemical drums, tires.", validation: { required: true } },
                                { id: "is_hazardous", label: "Does the material appear to be hazardous?", type: "radio_group", options: ["Yes", "No", "Unsure"], helperText: "If it poses an immediate health risk, call 911 or your local fire department." }
                            ]
                        },
                        {
                            step: 2,
                            title: "Evidence",
                            fields: [
                                { id: "suspect_info", label: "Do you have any suspect or vehicle info?", type: "textarea", placeholder: "License plate, company name on a truck, etc." },
                                { id: "evidence_upload", label: "Upload Photos", type: "file_upload", validation: { required: true } }
                            ]
                        }
                    ]
                },
                wildlife_crime: {
                    title: "Report a Wildlife Crime",
                    steps: [
                        {
                            step: 1,
                            title: "Incident Details",
                            fields: [
                                { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                                { id: "crime_type", label: "What type of wildlife crime?", type: "select", options: ["Poaching / Illegal Hunting", "Illegal Trapping", "Harming an Endangered Species", "Illegal Trade/Sale", "Other"], validation: { required: true } },
                                { id: "incident_description", label: "Describe what you saw or found.", type: "textarea", validation: { required: true } }
                            ]
                        },
                         {
                            step: 2,
                            title: "Suspect & Evidence",
                            fields: [
                                { id: "suspect_description", label: "Describe any suspects or vehicles.", type: "textarea" },
                                { id: "evidence_upload", label: "Upload photos, if safe to do so.", type: "file_upload" }
                            ]
                        }
                    ]
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
              steps: [
                  {
                    step: 1,
                    title: "Location and Behavior",
                    fields: [
                        { id: "location", label: "Where is this happening?", type: "location", validation: { required: true } },
                        { id: "activity_datetime", label: "When is this happening?", type: "datetime", validation: { required: true } },
                        { id: "reason_for_suspicion", label: "Describe the suspicious behavior.", type: "textarea", placeholder: "e.g., someone looking into car windows, testing doors, observing a house for a long time.", validation: { required: true } }
                    ]
                  },
                   {
                      step: 2,
                      title: "Description",
                      fields: [
                           { id: "suspect_description", label: "Describe the person(s).", type: "textarea", validation: { required: true } },
                           { id: "vehicle_description", label: "Describe any associated vehicle.", type: "textarea" }
                      ]
                  }
              ]
            },
            suspicious_vehicle: {
              title: "Report a Suspicious Vehicle",
              steps: [
                {
                  step: 1,
                  title: "Vehicle and Location",
                  fields: [
                    { id: "location", label: "Where is the vehicle located?", type: "location", validation: { required: true } },
                    { id: "vehicle_description", label: "Describe the vehicle.", type: "textarea", placeholder: "Include Make, Model, Color, License Plate, and any visible damage or unique features.", validation: { required: true } },
                    { id: "reason_for_suspicion", label: "Why do you find this vehicle suspicious?", type: "textarea", placeholder: "e.g., parked for several days, running but unoccupied, seen circling the block repeatedly.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Timing and Evidence",
                  fields: [
                    { id: "duration", label: "How long has the vehicle been there?", type: "text", placeholder: "e.g., 3 hours, 2 days", validation: { required: true } },
                    { id: "last_seen_time", label: "When did you last observe the vehicle?", type: "datetime" },
                    { id: "evidence_upload", label: "Upload Photos", type: "file_upload", helperText: "Please upload photos if it is possible and safe to do so." }
                  ]
                }
              ]
            },
            suspicious_package: {
                title: "Report a Suspicious Package or Item",
                steps: [
                    {
                      step: 1,
                      title: "Critical Safety Warning",
                      fields: [
                          { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If you believe this item is an immediate threat (e.g., ticking, has wires, or you suspect it's a bomb), DO NOT USE THIS FORM. Move to a safe location and CALL 911 immediately." }
                      ]
                    },
                    {
                      step: 2,
                      title: "Item and Location",
                      fields: [
                          { id: "location", label: "Where is the item located?", type: "location", validation: { required: true } },
                          { id: "item_description", label: "Describe the package or item.", type: "textarea", validation: { required: true } },
                          { id: "reason_for_suspicion", label: "Why does it seem suspicious?", type: "textarea", placeholder: "e.g., unattended in a high-traffic area, seems out of place.", validation: { required: true } }
                      ]
                    }
                ]
            },
            unknown_visitor_impersonation: {
                title: "Report an Unknown Visitor / Possible Impersonation",
                steps: [
                    {
                      step: 1,
                      title: "Incident Details",
                      fields: [
                          { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                          { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                          { id: "impersonation_type", label: "Who did they claim to be?", type: "text", placeholder: "e.g., utility worker, city official, police officer, salesperson.", validation: { required: true } }
                      ]
                    },
                     {
                        step: 2,
                        title: "Description",
                        fields: [
                            { id: "reason_for_suspicion", label: "Why was their visit suspicious?", type: "textarea", placeholder: "e.g., they had no ID, the company had no record of the visit, their request was unusual.", validation: { required: true } },
                            { id: "person_description", label: "Describe the person(s).", type: "textarea" },
                            { id: "vehicle_description", label: "Describe their vehicle, if any.", type: "textarea" }
                        ]
                     }
                ]
            }
          }
        },
        traffic_road_safety: {
          title: "Traffic & Road Safety",
          subtitle: "Driving issues that do not involve a crime against a person.",
          forms: {
            dangerous_reckless_driving: {
              title: "Report Dangerous / Reckless Driving",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where did the dangerous driving occur?", type: "text", helperText: "Provide street name, cross streets, or a highway section.", validation: { required: true } },
                    { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                    { id: "driving_behavior", label: "What was the driving behavior?", type: "checkbox", validation: { required: true }, options: ["Excessive Speeding", "Swerving / Weaving in traffic", "Tailgating", "Running stop signs/lights", "Aggressive behavior / Road rage", "Distracted driving (e.g., on phone)"] },
                    { id: "behavior_description", label: "Please describe the incident in more detail.", type: "textarea" }
                  ]
                },
                {
                  step: 2,
                  title: "Vehicle Information",
                  fields: [
                    { id: "vehicle_description", label: "Describe the vehicle (make, model, color).", type: "textarea", validation: { required: true } },
                    { id: "license_plate", label: "License plate number", type: "text", helperText: "Even a partial plate number is helpful." },
                    { id: "driver_description", label: "If you saw the driver, please provide a description.", type: "textarea" },
                    { id: "direction_of_travel", label: "What direction was the vehicle traveling?", type: "text" }
                  ]
                }
              ]
            },
            driving_under_influence: {
              title: "Report a Driver Under the Influence (DUI)",
              steps: [
                  {
                    step: 1,
                    title: "Urgent Warning",
                    fields: [
                      { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If this is happening now and the driver is a danger to others, please CALL 911 immediately. This form should be used for less urgent reporting." }
                    ]
                  },
                  {
                    step: 2,
                    title: "Vehicle and Incident",
                    fields: [
                      { id: "location", label: "Where did you observe the driver?", type: "text", validation: { required: true } },
                      { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                      { id: "direction_of_travel", label: "What direction were they heading?", type: "text" },
                      { id: "reason_for_suspicion", label: "What driving behavior did you observe?", type: "textarea", placeholder: "e.g., unable to stay in lane, erratic speed, smelled alcohol.", validation: { required: true } },
                      { id: "vehicle_description", label: "Describe the vehicle.", type: "textarea", validation: { required: true }, placeholder: "Make, model, color, license plate." }
                    ]
                  }
              ]
            },
            traffic_collision_non_injury: {
                title: "Report a Non-Injury Traffic Collision",
                steps: [
                    {
                      step: 1,
                      title: "Incident Details",
                      fields: [
                          { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If there are any injuries or significant road blockage, please call 911." },
                          { id: "location", label: "Location of the collision", type: "location", validation: { required: true } },
                          { id: "collision_datetime", label: "When did it happen?", type: "datetime", validation: { required: true } },
                          { id: "incident_description", label: "Describe how the collision occurred.", type: "textarea" }
                      ]
                    },
                    {
                      step: 2,
                      title: "Parties Involved",
                      fields: [
                          { id: "your_vehicle", label: "Your Vehicle (Make, Model, Plate)", type: "text" },
                          { id: "other_vehicle", label: "Other Vehicle (Make, Model, Plate)", type: "text" },
                          { id: "evidence_upload", label: "Upload photos of the scene and damage.", type: "file_upload" }
                      ]
                    }
                ]
            },
            road_hazard: {
              title: "Report a Road Hazard",
              steps: [
                  {
                    step: 1,
                    title: "Hazard Details",
                    fields: [
                      { id: "location", label: "Where is the hazard located?", type: "location", validation: { required: true } },
                      { id: "hazard_type", label: "What kind of hazard is it?", type: "textarea", placeholder: "e.g., large debris in road, malfunctioning traffic light, large pothole, dead animal.", validation: { required: true } },
                      { id: "hazard_description", label: "Provide more details.", type: "textarea" },
                      { id: "evidence_upload", label: "Upload a photo of the hazard.", type: "file_upload" }
                    ]
                  }
              ]
            },
            illegal_parking: {
                title: "Report Illegal Parking",
                steps: [
                  {
                      step: 1,
                      title: "Vehicle and Location",
                      fields: [
                        { id: "location", label: "Location of the vehicle", type: "location", validation: { required: true } },
                        { id: "vehicle_description", label: "Vehicle Description (color, make, model)", type: "text", validation: { required: true } },
                        { id: "license_plate", label: "License Plate Number", type: "text", validation: { required: true } },
                        { id: "violation_type", label: "What is the parking violation?", type: "textarea", placeholder: "e.g., blocking a fire hydrant, parked in a crosswalk, blocking a driveway.", validation: { required: true } }
                      ]
                  }
                ]
            },
            abandoned_vehicle: {
              title: "Report an Abandoned Vehicle",
              steps: [
                {
                  step: 1,
                  title: "Vehicle Location & Timing",
                  fields: [
                    { id: "location", label: "Where is the vehicle located?", type: "location", validation: { required: true } },
                    { id: "duration", label: "How long has the vehicle been at this location?", type: "text", placeholder: "e.g., 4 days, 2 weeks", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Vehicle Details",
                  fields: [
                    { id: "vehicle_make", label: "Vehicle Make", type: "text", placeholder: "e.g., Ford" },
                    { id: "vehicle_model", label: "Vehicle Model", type: "text", placeholder: "e.g., Explorer" },
                    { id: "vehicle_color", label: "Color", type: "text" },
                    { id: "license_plate", label: "License Plate Number", type: "text" },
                    { id: "vehicle_condition", label: "Describe the condition of the vehicle.", type: "textarea", placeholder: "e.g., flat tires, broken windows, looks operable." }
                  ]
                }
              ]
            }
          }
        },
        public_safety_community_concerns: {
          title: "Public Safety & Community Concerns",
          subtitle: "General hazards or non-criminal neighborhood issues.",
          forms: {
            public_hazard: {
              title: "Report a Public Hazard",
              steps: [
                  {
                      step: 1,
                      title: "Hazard Details",
                      fields: [
                        { id: "location", label: "Where is the hazard?", type: "location", validation: { required: true } },
                        { id: "hazard_description", label: "Describe the hazard.", type: "textarea", placeholder: "e.g., downed power line, open manhole cover, unsafe building condition.", validation: { required: true } },
                        { id: "evidence_upload", label: "Upload a photo.", type: "file_upload" }
                      ]
                  }
              ]
            },
            noise_complaint: {
              title: "Report a Noise Complaint",
              steps: [
                  {
                    step: 1,
                    title: "Complaint Details",
                    fields: [
                      { id: "location", label: "Location of the noise source", type: "location", validation: { required: true } },
                      { id: "noise_type", label: "What type of noise is it?", type: "text", placeholder: "e.g., loud music, construction, party, barking dog.", validation: { required: true } },
                      { id: "duration", label: "How long has it been happening?", type: "text", placeholder: "e.g., for the last 2 hours." }
                    ]
                  }
              ]
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
              steps: [
                {
                  step: 1,
                  title: "Type of Concern",
                  fields: [
                    { id: "concern_type", label: "What is the concern?", type: "select", options: ["Lost Pet", "Found Pet", "Animal Neglect or Cruelty", "Dangerous / Aggressive Animal"], validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Details",
                  fields: [
                    { id: "location", label: "Location of Animal/Incident", type: "location", validation: { required: true } },
                    { id: "animal_description", label: "Describe the animal(s)", type: "textarea", placeholder: "Type, breed, color, size, any distinguishing marks.", validation: { required: true } },
                    { id: "concern_details", label: "Please describe the situation in detail", type: "textarea", validation: { required: true } },
                    { id: "animal_photo", label: "Upload a photo", type: "file_upload", helperText: "If possible and safe to do so." }
                  ]
                }
              ]
            },
            code_violation: {
                title: "Report a Code Violation",
                steps: [
                    {
                      step: 1,
                      title: "Violation Details",
                      fields: [
                        { id: "location", label: "Address of the violation", type: "location", validation: { required: true } },
                        { id: "violation_type", label: "What is the code violation?", type: "textarea", placeholder: "e.g., overgrown lawn, trash and debris in yard, illegal sign, unpermitted construction.", validation: { required: true } },
                        { id: "evidence_upload", label: "Upload photo(s)", type: "file_upload" }
                      ]
                    }
                ]
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