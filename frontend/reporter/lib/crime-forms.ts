// In a real app, you would import the JSON directly.
// For this example, I am embedding the JSON data provided in the prompt.
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
              steps: [
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
                    { id: "victim_injuries", label: "What injuries, if any, were sustained?", type: "textarea", placeholder: "e.g., cuts, bruises, broken bones." },
                    { id: "medical_attention", label: "Was medical attention required?", type: "radio_group", options: ["Yes", "No", "Unsure"] }
                  ]
                },
                {
                  step: 3,
                  title: "Suspect Information",
                  fields: [
                    { id: "suspect_count", label: "How many suspects were there?", type: "number", defaultValue: 1 },
                    { id: "suspect_description", label: "Please describe the suspect(s).", type: "textarea", placeholder: "Include details like gender, age, height, build, clothing, and any distinguishing features.", validation: { required: true } },
                    { id: "weapon_involved", label: "Was a weapon used?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
                    { id: "weapon_type", label: "What kind of weapon?", type: "text", placeholder: "e.g., knife, bat, firearm.", conditional: { field: "weapon_involved", value: "Yes" } }
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
              ]
            },
            robbery_mugging: {
              title: "Report a Robbery / Mugging",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                    { id: "incident_date", label: "Date of Incident", type: "date", validation: { required: true } },
                    { id: "incident_time", label: "Time of Incident", type: "time", validation: { required: true } },
                    { id: "incident_description", label: "Please describe how the robbery occurred.", type: "textarea", placeholder: "Describe the events and any threats or force used...", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Stolen Property",
                  fields: [
                    { id: "stolen_items", label: "List of Stolen Items", type: "repeater", validation: { required: true }, fields: [
                      { id: "item_name", label: "Item", type: "text", placeholder: "e.g., iPhone 13 Pro" },
                      { id: "item_value", label: "Estimated Value ($)", type: "number" },
                      { id: "item_description", label: "Description / Serial Number", type: "text" }
                    ]}
                  ]
                },
                {
                  step: 3,
                  title: "Suspect Information",
                  fields: [
                    { id: "suspect_count", label: "How many suspects were there?", type: "number", defaultValue: 1 },
                    { id: "suspect_description", label: "Please describe the suspect(s).", type: "textarea", placeholder: "Include details like gender, age, height, build, clothing, and any distinguishing features.", validation: { required: true } },
                    { id: "weapon_involved", label: "Was a weapon used or threatened?", type: "radio_group", options: ["Yes", "No", "Unsure"], validation: { required: true } },
                    { id: "weapon_type", label: "What kind of weapon?", type: "text", placeholder: "e.g., knife, handgun.", conditional: { field: "weapon_involved", value: "Yes" } }
                  ]
                },
                {
                  step: 4,
                  title: "Evidence & Witnesses",
                  fields: [
                    { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload" },
                    { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "witness_details", label: "Witness Information", type: "repeater", conditional: { field: "witness_present", value: "Yes" }, fields: [
                      { id: "witness_name", label: "Witness Name", type: "text" },
                      { id: "witness_contact", label: "Witness Contact Info", type: "text" }
                    ]}
                  ]
                }
              ]
            },
            threats_harassment_stalking: {
              title: "Report Threats, Harassment, or Stalking",
              steps: [
                {
                  step: 1,
                  title: "Incident Overview",
                  fields: [
                    { id: "incident_type", label: "What are you reporting?", type: "checkbox", options: ["Verbal Threats", "Written Threats", "Persistent Harassment", "Stalking"] },
                    { id: "date_range", label: "When did this behavior occur?", type: "date_range", helperText: "Provide the start and end date of the incidents.", validation: { required: true } },
                    { id: "incident_description", label: "Describe the threats, harassment, or stalking behavior in detail.", type: "textarea", placeholder: "Include specific dates, times, locations, and what was said or done.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Person(s) Involved",
                  fields: [
                    { id: "suspect_known", label: "Do you know the person involved?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "suspect_name", label: "Suspect's Name", type: "text", conditional: { field: "suspect_known", value: "Yes" } },
                    { id: "suspect_description", label: "Description of the Person", type: "textarea", placeholder: "Provide any identifying information you have, such as physical description, online usernames, or vehicle information." }
                  ]
                },
                {
                  step: 3,
                  title: "Evidence",
                  fields: [
                    { id: "communication_method", label: "How were the communications made?", type: "checkbox", options: ["In Person", "By Phone (Call/Text)", "Email", "Social Media", "Written Note"] },
                    { id: "evidence_text", label: "Provide transcripts of any messages, if possible.", type: "textarea", placeholder: "Copy and paste texts, emails, or messages here." },
                    { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Upload screenshots, photos, audio recordings, or documents." }
                  ]
                }
              ]
            },
            hate_crime: {
              title: "Report a Hate Crime or Bias Incident",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "underlying_crime", label: "What type of incident occurred?", type: "select", options: ["Assault", "Vandalism", "Threats/Harassment", "Other"], validation: { required: true } },
                    { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                    { id: "incident_date", label: "Date of Incident", type: "date", validation: { required: true } },
                    { id: "incident_description", label: "Please describe what happened.", type: "textarea", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Bias Motivation",
                  fields: [
                    { id: "bias_reason", label: "Why do you believe this was a hate or bias-motivated crime?", type: "textarea", helperText: "Describe any words, symbols, or actions that lead you to this belief.", validation: { required: true } },
                    { id: "protected_characteristic", label: "What was the perceived motivation for the incident? (Select all that apply)", type: "checkbox", options: ["Race/Color/Ethnicity", "Religion", "Sexual Orientation", "Gender Identity", "Disability", "National Origin", "Other"] }
                  ]
                },
                {
                  step: 3,
                  title: "Suspect & Evidence",
                  fields: [
                      { id: "suspect_description", label: "Please describe the suspect(s).", type: "textarea", placeholder: "Include details like gender, age, height, build, clothing, and any distinguishing features." },
                      { id: "evidence_upload", label: "Upload Photos or Videos", type: "file_upload", helperText: "e.g., photos of graffiti, video of the incident." },
                      { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] }
                  ]
                }
              ]
            }
          }
        },
        theft_burglary_property_damage: {
          title: "Theft, Burglary & Property Damage",
          subtitle: "Stolen property or damage where no force was used.",
          forms: {
            burglary_break_in: {
              title: "Report a Burglary / Break-in",
              steps: [
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
                    { id: "entry_method", label: "How did the suspect(s) get in?", type: "text", placeholder: "e.g., broke back window, forced front door.", validation: { required: true } },
                    { id: "property_damaged", label: "Was any property damaged during the entry or search?", type: "textarea", placeholder: "Describe any damaged doors, windows, furniture, etc." }
                  ]
                },
                {
                  step: 3,
                  title: "Stolen Property",
                  fields: [
                    { id: "was_anything_stolen", label: "Was anything stolen?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "stolen_items", label: "List of Stolen Items", type: "repeater", conditional: { field: "was_anything_stolen", value: "Yes" }, fields: [
                      { id: "item_name", label: "Item", type: "text", placeholder: "e.g., Laptop, Jewelry" },
                      { id: "item_value", label: "Estimated Value ($)", type: "number" },
                      { id: "item_description", label: "Description / Serial Number", type: "text" }
                    ]}
                  ]
                },
                {
                  step: 4,
                  title: "Evidence",
                  fields: [
                    { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, or vehicle information." },
                    { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Upload security footage or photos of the damage/entry point." }
                  ]
                }
              ]
            },
            theft_personal_property: {
              title: "Report Theft of Personal Property",
              steps: [
                {
                  step: 1,
                  title: "What was stolen?",
                  fields: [
                    { id: "theft_type", label: "What kind of theft was this?", type: "select", options: ["Package Theft", "Shoplifting", "Pickpocketing", "Bicycle Theft", "Theft from Yard/Porch", "Other"], validation: { required: true } },
                    { id: "stolen_items", label: "List of Stolen Items", type: "repeater", validation: { required: true }, fields: [
                      { id: "item_name", label: "Item", type: "text", placeholder: "e.g., Bicycle, Amazon Package" },
                      { id: "item_value", label: "Estimated Value ($)", type: "number" },
                      { id: "item_description", label: "Description / Serial Number", type: "text" }
                    ]}
                  ]
                },
                {
                  step: 2,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where did the theft occur?", type: "location", validation: { required: true } },
                    { id: "incident_datetime", label: "When did the theft occur?", type: "datetime", validation: { required: true } },
                    { id: "incident_description", label: "Please describe what happened.", type: "textarea", placeholder: "Provide any relevant details about the situation." }
                  ]
                },
                {
                  step: 3,
                  title: "Suspect & Evidence",
                  fields: [
                    { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, or vehicle information." },
                    { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "e.g., doorbell camera footage, photos." }
                  ]
                }
              ]
            },
            vandalism_property_damage: {
              title: "Report Vandalism / Property Damage",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where did the vandalism occur?", type: "location", validation: { required: true } },
                    { id: "incident_datetime", label: "When did the vandalism occur?", type: "datetime", helperText: "Provide an exact time or the time you discovered it.", validation: { required: true } },
                    { id: "property_damaged", label: "What property was damaged?", type: "text", placeholder: "e.g., wall, window, fence.", validation: { required: true } },
                    { id: "damage_description", label: "Describe the damage.", type: "textarea", placeholder: "e.g., graffiti spray painted, window broken, tires slashed.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Suspect & Evidence",
                  fields: [
                    { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea", placeholder: "Description, name, or vehicle information." },
                    { id: "evidence_upload", label: "Upload Photos of the Damage", type: "file_upload", validation: { required: true }, helperText: "Please provide clear photos of the damage." }
                  ]
                }
              ]
            }
          }
        },
        vehicle_related_crime: {
          title: "Vehicle-Related Crime",
          subtitle: "Crimes specifically involving motor vehicles.",
          forms: {
            motor_vehicle_theft: {
              title: "Report Motor Vehicle Theft",
              steps: [
                {
                  step: 1,
                  title: "Vehicle Information",
                  fields: [
                    { id: "vehicle_make", label: "Vehicle Make", type: "text", placeholder: "e.g., Honda", validation: { required: true } },
                    { id: "vehicle_model", label: "Vehicle Model", type: "text", placeholder: "e.g., Civic", validation: { required: true } },
                    { id: "vehicle_year", label: "Year", type: "number", validation: { required: true } },
                    { id: "vehicle_color", label: "Color", type: "text", validation: { required: true } },
                    { id: "license_plate", label: "License Plate Number", type: "text", validation: { required: true } },
                    { id: "vin_number", label: "VIN", type: "text", helperText: "Vehicle Identification Number, found on your dashboard or registration." }
                  ]
                },
                {
                  step: 2,
                  title: "Theft Details",
                  fields: [
                    { id: "location", label: "Where was the vehicle parked when it was stolen?", type: "location", validation: { required: true } },
                    { id: "time_occurred", label: "When do you believe it was stolen?", type: "datetime_range", helperText: "Provide the time range when the vehicle was last seen and when it was discovered missing.", validation: { required: true } },
                    { id: "keys_in_vehicle", label: "Were the keys in the vehicle?", type: "radio_group", options: ["Yes", "No", "Unsure"] }
                  ]
                }
              ]
            },
            theft_from_vehicle: {
              title: "Report Theft From a Vehicle",
              steps: [
                {
                  step: 1,
                  title: "Incident Details",
                  fields: [
                    { id: "location", label: "Where was the vehicle parked?", type: "location", validation: { required: true } },
                    { id: "time_occurred", label: "When do you believe the theft occurred?", type: "datetime_range", validation: { required: true } },
                    { id: "vehicle_entry", label: "How did the suspect get into your vehicle?", type: "select", options: ["Window was broken", "Doors were unlocked", "Trunk was forced open", "Unsure", "Other"] }
                  ]
                },
                {
                  step: 2,
                  title: "Stolen Property",
                  fields: [
                    { id: "stolen_items", label: "List of Stolen Items", type: "repeater", validation: { required: true }, fields: [
                      { id: "item_name", label: "Item", type: "text", placeholder: "e.g., Laptop Bag, Stereo" },
                      { id: "item_value", label: "Estimated Value ($)", type: "number" },
                      { id: "item_description", label: "Description / Serial Number", type: "text" }
                    ]}
                  ]
                },
                {
                  step: 3,
                  title: "Vehicle & Suspect Information",
                  fields: [
                    { id: "vehicle_description", label: "Your Vehicle Description", type: "text", placeholder: "e.g., Blue Toyota Camry, License Plate...", validation: { required: true } },
                    { id: "suspect_info", label: "Do you have any suspect information?", type: "textarea" },
                    { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Photos of vehicle damage, security footage, etc." }
                  ]
                }
              ]
            },
            hit_and_run: {
              title: "Report a Hit & Run Collision",
              steps: [
                {
                  step: 1,
                  title: "Collision Details",
                  fields: [
                    { id: "location", label: "Where did the collision occur?", type: "location", validation: { required: true } },
                    { id: "collision_datetime", label: "When did it happen?", type: "datetime", validation: { required: true } },
                    { id: "your_vehicle_damage", label: "Describe the damage to your vehicle/property.", type: "textarea", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Fleeing Vehicle Information",
                  fields: [
                    { id: "suspect_vehicle_description", label: "Describe the vehicle that left the scene.", type: "textarea", placeholder: "Include Make, Model, Color, License Plate (even partial), and any visible damage.", validation: { required: true } },
                    { id: "suspect_driver_description", label: "Describe the driver, if you saw them.", type: "textarea" },
                    { id: "direction_of_travel", label: "Which direction did the vehicle go?", type: "text" }
                  ]
                },
                {
                  step: 3,
                  title: "Evidence & Witnesses",
                  fields: [
                    { id: "injuries", label: "Were there any injuries?", type: "radio_group", options: ["Yes", "No"] },
                    { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "evidence_upload", label: "Upload photos of the scene or damage.", type: "file_upload" }
                  ]
                }
              ]
            }
          }
        },
        fraud_scams_financial_crime: {
          title: "Fraud, Scams & Financial Crime",
          subtitle: "Deception for financial gain or to compromise info.",
          forms: {
            fraud_scam: {
              title: "Report a Fraud / Scam",
              steps: [
                {
                  step: 1,
                  title: "Scam Details",
                  fields: [
                    { id: "scam_type", label: "What type of scam was it?", type: "select", options: ["Phishing (Email/Text)", "Online Shopping Scam", "Tech Support Scam", "Investment Scam", "Credit Card Fraud", "Other"], validation: { required: true } },
                    { id: "contact_method", label: "How did the scammer contact you?", type: "text", placeholder: "e.g., Email, Phone Call, Website, Social Media App", validation: { required: true } },
                    { id: "scammer_details", label: "Scammer Information", type: "textarea", placeholder: "Provide any email addresses, phone numbers, website URLs, or usernames you have.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Transaction Details",
                  fields: [
                    { id: "scam_description", label: "Please describe the scam.", type: "textarea", placeholder: "Explain how the scam worked and what they asked you to do.", validation: { required: true } },
                    { id: "financial_loss", label: "Did you lose any money or property?", type: "radio_group", options: ["Yes", "No"] },
                    { id: "loss_amount", label: "Total Estimated Loss ($)", type: "number", conditional: { field: "financial_loss", value: "Yes" } },
                    { id: "payment_method", label: "How did you pay?", type: "text", placeholder: "e.g., Credit Card, Bank Transfer, Gift Card, Cryptocurrency", conditional: { field: "financial_loss", value: "Yes" } }
                  ]
                },
                {
                  step: 3,
                  title: "Evidence",
                  fields: [
                    { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Screenshots of messages, emails, websites, or transaction records." }
                  ]
                }
              ]
            },
            identity_theft: {
              title: "Report Identity Theft",
              steps: [
                {
                  step: 1,
                  title: "Incident Overview",
                  fields: [
                    { id: "info_stolen", label: "What personal information was compromised? (Select all that apply)", type: "checkbox", options: ["Social Security Number", "Driver's License", "Credit Card Number", "Bank Account Info", "Online Passwords", "Other"] },
                    { id: "how_discovered", label: "How did you find out your identity was stolen?", type: "textarea", placeholder: "e.g., Noticed a strange charge, received a collections call, was denied for a loan.", validation: { required: true } }
                  ]
                },
                {
                  step: 2,
                  title: "Fraudulent Activity",
                  fields: [
                    { id: "fraudulent_use", label: "How was your information used?", type: "textarea", placeholder: "e.g., to open a new credit card, to file for taxes, to get a loan.", validation: { required: true } },
                    { id: "financial_loss", label: "Have you suffered a financial loss?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "loss_amount", label: "Total Estimated Loss ($)", type: "number", conditional: { field: "financial_loss", value: "Yes" } }
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