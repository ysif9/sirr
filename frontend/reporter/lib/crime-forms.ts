// lib/crime-forms.ts

import {
  getFormStructure,
  type FieldStructure,
  type FormStepStructure,
} from './crime-forms-structure';

// Final types that include translated strings
export type Field = {
  id: string;
  label: string;
  type: string;
  text?: string;
  helperText?: string;
  placeholder?: string;
  validation?: { required?: boolean };
  options?: string[];
  conditional?: { field: string; value: string };
  fields?: Field[]; // For repeater
  defaultValue?: any;
};

export type FormStep = {
  step: number;
  title: string;
  fields: Field[];
};

export type FormDefinition = {
  title: string;
  steps: FormStep[];
};

/**
 * Hydrates a field structure with translated content from a message object.
 */
function hydrateField(
  fieldStructure: FieldStructure, 
  formTranslations: any, 
  commonTranslations: any
): Field {
  const { id, type, validation, conditional, fields, defaultValue } = fieldStructure;

  const getTranslation = (keySuffix: string) => formTranslations?.[`${id}_${keySuffix}`];

  let options = getTranslation('options');
  if (!options && type === 'radio_group') {
    // Fallback for standard Yes/No/Unsure radio groups
    options = [
      commonTranslations.yes,
      commonTranslations.no,
      commonTranslations.unsure
    ];
  }

  const hydratedField: Field = {
    id,
    label: getTranslation('label') || id,
    type,
    validation,
    conditional,
    defaultValue,
    text: getTranslation('text'),
    helperText: getTranslation('helper'),
    placeholder: getTranslation('placeholder'),
    options: options, // This will now correctly be an array or undefined
    fields: fields ? fields.map(subField => 
      hydrateField(subField, formTranslations?.[`${id}_fields`], commonTranslations)
    ) : undefined,
  };

  return hydratedField;
}


/**
 * Maps a category key to its corresponding translation prefix.
 */
function getTranslationPrefix(categoryKey: string, formKey: string): string {
    switch (categoryKey) {
        case 'violence_threats_against_person': return 'violenceThreats';
        case 'theft_burglary_property_damage': return 'theftBurglary';
        case 'vehicle_related_crime': return 'vehicleCrime';
        case 'fraud_scams_financial_crime': return 'fraudScam';
        case 'cybercrime': return 'cybercrime';
        case 'drugs_weapons_public_order': return 'drugsWeaponsPublicOrder';
        case 'environmental_crimes': return 'environmentalCrimes';
        case 'suspicious_activity': return 'suspiciousActivity';
        case 'traffic_road_safety': return 'trafficRoadSafety';
        case 'public_safety_community_concerns':
            if (formKey === 'missing_person') return 'missingPerson';
            if (formKey === 'welfare_check') return 'welfareCheck';
            return 'publicSafetyCommunityConcerns';
        default: return 'violenceThreats'; // A sensible default
    }
}

/**
 * Hydrates the form structure with translations to create a complete, localized form definition.
 * @param messages - The `crimeForms` message object from next-intl.
 */
export function getLocalizedFormDefinition(
  messages: any, // The crimeForms message object
  reportTypeKey: string,
  categoryKey: string,
  formKey: string
): FormDefinition | undefined {
  const structure = getFormStructure(reportTypeKey, categoryKey, formKey);
  if (!structure) return undefined;

  const formPrefix = getTranslationPrefix(categoryKey, formKey);
  
  // Access translations via object properties instead of a function
  const title = messages?.category_structures?.[reportTypeKey]?.categories?.[categoryKey]?.forms?.[formKey]?.title;
  const formTranslations = messages?.[formPrefix];
  const commonTranslations = { yes: messages.yes, no: messages.no, unsure: messages.unsure };

  if (!title || !formTranslations) {
    console.warn(`Translations not found for form: ${formPrefix}`);
    return undefined;
  }

  const hydratedSteps: FormStep[] = structure.steps.map((stepStructure: FormStepStructure) => {
    return {
      step: stepStructure.step,
      title: formTranslations[`step${stepStructure.step}_title`],
      fields: stepStructure.fields.map((fieldStructure: FieldStructure) => 
        hydrateField(fieldStructure, formTranslations, commonTranslations)
      ),
    };
  });

  return {
    title,
    steps: hydratedSteps,
  };
}