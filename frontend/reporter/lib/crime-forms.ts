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
            extortion_blackmail: {
                title: "Report Extortion or Blackmail",
                steps: [
                    {
                        step: 1,
                        title: "Incident Details",
                        fields: [
                            { id: "incident_start_date", label: "When did this begin?", type: "date", validation: { required: true } },
                            { id: "what_is_demanded", label: "What is being demanded?", type: "textarea", placeholder: "e.g., money, property, services.", validation: { required: true } },
                            { id: "what_is_threatened", label: "What is being used as leverage?", type: "textarea", placeholder: "e.g., threat to release private photos, reveal a secret, cause harm.", validation: { required: true } },
                            { id: "demand_description", label: "Describe the full situation.", type: "textarea", placeholder: "Explain the demands and threats in detail.", validation: { required: true } }
                        ]
                    },
                    {
                        step: 2,
                        title: "Suspect Information",
                        fields: [
                            { id: "suspect_known", label: "Do you know the suspect?", type: "radio_group", options: ["Yes", "No"] },
                            { id: "suspect_info", label: "Suspect Information", type: "textarea", placeholder: "Provide their name, username, phone number, email, or any other identifying information." }
                        ]
                    },
                    {
                        step: 3,
                        title: "Evidence",
                        fields: [
                            { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "Upload screenshots of messages, emails, or any other proof of the demands." }
                        ]
                    }
                ]
            },
            sexual_offense: {
                title: "Report a Sexual Offense",
                steps: [
                    {
                        step: 1,
                        title: "Important Resources",
                        fields: [
                             { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If you are in immediate danger, please call 911. Reporting can be a difficult process. We encourage you to seek support from a local sexual assault resource center." }
                        ]
                    },
                    {
                        step: 2,
                        title: "Incident Details",
                        fields: [
                            { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                            { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                            { id: "incident_description", label: "Please describe what happened.", type: "textarea", helperText: "Share as much or as little detail as you are comfortable with at this time.", validation: { required: true } }
                        ]
                    },
                    {
                        step: 3,
                        title: "Suspect Information",
                        fields: [
                             { id: "suspect_description", label: "Can you provide a description of the person(s) involved?", type: "textarea", placeholder: "Include any details you remember, like gender, age, height, clothing, or other features." }
                        ]
                    }
                ]
            },
            kidnapping_abduction: {
                title: "Report a Kidnapping or Abduction",
                steps: [
                    {
                        step: 1,
                        title: "Urgent Action",
                        fields: [
                            { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If this is happening now or the victim is in immediate danger, CALL 911 immediately. This form is for reporting an incident that has already occurred or where the immediate danger has passed." }
                        ]
                    },
                    {
                        step: 2,
                        title: "Victim's Details",
                        fields: [
                            { id: "victim_name", label: "Full Name of the Victim", type: "text", validation: { required: true } },
                            { id: "victim_age", label: "Victim's Age", type: "number", validation: { required: true } },
                            { id: "victim_description", label: "Physical Description of Victim", type: "textarea", placeholder: "Height, weight, hair color, clothing last seen wearing, and any distinguishing features.", validation: { required: true } },
                             { id: "victim_photo", label: "Upload a recent photo of the victim", type: "file_upload" }
                        ]
                    },
                    {
                        step: 3,
                        title: "Incident Information",
                        fields: [
                            { id: "last_seen_datetime", label: "Date and Time Last Seen", type: "datetime", validation: { required: true } },
                            { id: "last_seen_location", label: "Location Last Seen", type: "location", validation: { required: true } },
                            { id: "incident_description", label: "Describe the circumstances of the disappearance.", type: "textarea", placeholder: "What led you to believe they were taken against their will?", validation: { required: true } },
                            { id: "suspect_description", label: "Suspect Description", type: "textarea", placeholder: "Describe any person(s) or vehicle(s) involved." }
                        ]
                    }
                ]
            },
            domestic_family_violence: {
                title: "Report Domestic & Family Violence",
                steps: [
                    {
                        step: 1,
                        title: "Safety Warning",
                        fields: [
                            { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If you or someone else is in immediate danger, please call 911. Consider your safety when filling out this form. It may be helpful to use a safe computer and to clear your browser history afterward." }
                        ]
                    },
                    {
                        step: 2,
                        title: "Incident Details",
                        fields: [
                            { id: "relationship", label: "What is the relationship between the victim and the abuser?", type: "text", placeholder: "e.g., spouse, parent, child, partner.", validation: { required: true } },
                            { id: "violence_type", label: "What type of abuse occurred? (Select all that apply)", type: "checkbox", options: ["Physical Violence", "Verbal Threats", "Property Damage", "Financial Control", "Other"] },
                            { id: "incident_datetime", label: "Date & Time of Most Recent Incident", type: "datetime", validation: { required: true } },
                            { id: "incident_location", label: "Location of Incident", type: "location", validation: { required: true } },
                            { id: "incident_description", label: "Describe the most recent incident.", type: "textarea", validation: { required: true } }
                        ]
                    },
                    {
                        step: 3,
                        title: "Parties Involved",
                        fields: [
                            { id: "victim_name", label: "Victim's Name", type: "text" },
                            { id: "abuser_name", label: "Abuser's Name", type: "text" },
                            { id: "children_present", label: "Were children present or involved?", type: "radio_group", options: ["Yes", "No"] },
                            { id: "elderly_present", label: "Was an elderly person involved?", type: "radio_group", options: ["Yes", "No"] }
                        ]
                    }
                ]
            },
            human_trafficking: {
                title: "Report Suspected Human Trafficking",
                 steps: [
                    {
                        step: 1,
                        title: "Observation Details",
                        fields: [
                            { id: "location", label: "Where did you observe this activity?", type: "location", validation: { required: true } },
                            { id: "observation_datetime", label: "When did you observe this?", type: "datetime" },
                            { id: "trafficking_type", label: "What type of trafficking do you suspect?", type: "select", options: ["Labor Trafficking", "Sex Trafficking", "Unsure"] },
                            { id: "reason_for_suspicion", label: "Why do you suspect human trafficking? (Indicators)", type: "textarea", placeholder: "e.g., person seemed controlled, wasn't free to leave, showed signs of abuse, lived in poor conditions, story was inconsistent.", validation: { required: true } }
                        ]
                    },
                    {
                        step: 2,
                        title: "People & Vehicles Involved",
                        fields: [
                             { id: "victim_description", label: "Description of the potential victim(s).", type: "textarea" },
                             { id: "suspect_description", label: "Description of the potential trafficker(s).", type: "textarea" },
                             { id: "vehicle_description", label: "Description of any involved vehicles.", type: "textarea", placeholder: "Make, model, license plate." }
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
            mail_theft: {
              title: "Report Mail Theft",
              steps: [
                  {
                    step: 1,
                    title: "Incident Details",
                    fields: [
                      { id: "location", label: "Address where the theft occurred.", type: "location", validation: { required: true } },
                      { id: "theft_datetime", label: "When did you notice the mail was stolen?", type: "datetime", validation: { required: true } },
                      { id: "mailbox_type", label: "Type of mailbox", type: "select", options: ["Residential Mailbox", "Apartment Mail Panel", "Porch/Doorstep", "Other"] }
                    ]
                  },
                  {
                      step: 2,
                      title: "Stolen Items & Evidence",
                      fields: [
                           { id: "stolen_mail_description", label: "What mail/packages do you know are missing?", type: "textarea", placeholder: "e.g., bank statements, packages with tracking numbers, birthday cards.", validation: { required: true } },
                           { id: "evidence_upload", label: "Upload Evidence", type: "file_upload", helperText: "e.g., video footage from a security camera." }
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
            },
            arson: {
              title: "Report Arson (Deliberate Fire)",
              steps: [
                  {
                      step: 1,
                      title: "Incident Details",
                      fields: [
                          { id: "disclaimer", label: "Disclaimer", type: "static_text", text: "If there is an active fire, CALL 911 immediately. Only use this form for fires that are no longer active." },
                          { id: "location", label: "Location of the fire", type: "location", validation: { required: true } },
                          { id: "fire_datetime", label: "When did the fire start?", type: "datetime", validation: { required: true } },
                          { id: "damage_description", label: "Describe the damage caused by the fire.", type: "textarea" },
                          { id: "reason_for_suspicion", label: "Why do you suspect this was arson?", type: "textarea", placeholder: "e.g., saw someone start the fire, smell of accelerants, no accidental cause.", validation: { required: true } }
                      ]
                  },
                  {
                      step: 2,
                      title: "Suspect & Witnesses",
                      fields: [
                          { id: "suspect_info", label: "Suspect Information", type: "textarea", placeholder: "Provide any descriptions of people or vehicles you saw." },
                          { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No"] }
                      ]
                  }
              ]
            },
            criminal_trespassing: {
              title: "Report Criminal Trespassing",
              steps: [
                  {
                      step: 1,
                      title: "Incident Details",
                       fields: [
                          { id: "location", label: "Location of the trespassing", type: "location", validation: { required: true } },
                          { id: "trespass_datetime", label: "When did this occur?", type: "datetime", validation: { required: true } },
                          { id: "incident_description", label: "Describe the incident.", type: "textarea", placeholder: "e.g., person was found in a locked yard, entered a building with 'No Trespassing' signs.", validation: { required: true } }
                      ]
                  },
                  {
                      step: 2,
                      title: "Suspect Information",
                      fields: [
                          { id: "suspect_description", label: "Describe the person(s) who trespassed.", type: "textarea", validation: { required: true } },
                          { id: "action_taken", label: "Was the person asked to leave?", type: "radio_group", options: ["Yes", "No"] },
                          { id: "damage_caused", label: "Did they cause any damage?", type: "radio_group", options: ["Yes", "No"] }
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
                    { id: "injuries", label: "Were there any injuries?", type: "radio_group", options: ["Yes", "No"], helperText: "If there were injuries, please call 911." },
                    { id: "witness_present", label: "Were there any witnesses?", type: "radio_group", options: ["Yes", "No", "Unsure"] },
                    { id: "evidence_upload", label: "Upload photos of the scene or damage.", type: "file_upload" }
                  ]
                }
              ]
            },
            vehicle_vandalism: {
              title: "Report Vehicle Vandalism",
              steps: [
                  {
                      step: 1,
                      title: "Incident Details",
                      fields: [
                          { id: "location", label: "Where was the vehicle parked?", type: "location", validation: { required: true } },
                          { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                          { id: "damage_description", label: "Describe the damage to the vehicle.", type: "textarea", placeholder: "e.g., tires slashed, windows broken, key scratches.", validation: { required: true } }
                      ]
                  },
                  {
                      step: 2,
                      title: "Vehicle & Suspect",
                      fields: [
                          { id: "vehicle_description", label: "Your Vehicle (Make, Model, Plate)", type: "text", validation: { required: true } },
                          { id: "suspect_info", label: "Suspect information, if any", type: "textarea" },
                          { id: "evidence_upload", label: "Upload photos of the damage", type: "file_upload", validation: { required: true } }
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
            },
            counterfeiting_forgery: {
                title: "Report Counterfeiting or Forgery",
                steps: [
                    {
                        step: 1,
                        title: "Incident Details",
                        fields: [
                            { id: "location", label: "Where did this happen?", type: "location", validation: { required: true } },
                            { id: "incident_datetime", label: "When did this happen?", type: "datetime", validation: { required: true } },
                            { id: "item_type", label: "What type of item was fake or forged?", type: "select", options: ["Money (currency)", "Document (ID, check, etc.)", "Branded Goods", "Other"], validation: { required: true } }
                        ]
                    },
                    {
                        step: 2,
                        title: "Description",
                        fields: [
                            { id: "incident_description", label: "Please describe the incident.", type: "textarea", placeholder: "e.g., received fake bills as change, discovered a signature was forged on a check.", validation: { required: true } },
                            { id: "suspect_info", label: "Information about who provided the item.", type: "textarea", placeholder: "Description of the person or business." },
                            { id: "evidence_upload", label: "Upload photos of the item, if possible.", type: "file_upload", helperText: "Do not put yourself at risk. Handle counterfeit money as little as possible." }
                        ]
                    }
                ]
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