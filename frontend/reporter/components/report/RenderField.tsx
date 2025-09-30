"use client"

import React from "react"
import { Controller, useFieldArray, Control, UseFormWatch } from "react-hook-form"
import { Field } from "@/lib/crime-forms"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "../ui/button"
import { useTranslations } from "next-intl"
import FileUpload from "../FileUpload"

interface RenderFieldProps {
  control: Control<any>
  field: Field
  watch: UseFormWatch<any>
}

const RenderField: React.FC<RenderFieldProps> = ({ control, field, watch }) => {
  const t = useTranslations("RenderField");

  if (field.conditional) {
    const watchedValue = watch(field.conditional.field)
    if (watchedValue !== field.conditional.value) {
      return null
    }
  }

  if (field.type === "file_upload") {
    return (
      <div className="mb-6">
        <Label htmlFor={field.id} className="block mb-2 text-base font-semibold text-card-foreground">
          {field.label}
          {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Controller
          name={field.id}
          control={control}
          defaultValue={[]}
          render={({ field: { onChange } }) => (
            <FileUpload
              onChange={onChange}
            />
          )}
        />
        {field.helperText && <p className="mt-2 text-sm text-muted-foreground">{field.helperText}</p>}
      </div>
    )
  }

  const renderInput = (rhfProps: any) => {
    switch (field.type) {
      case "text":
      case "number":
      case "date":
      case "time":
      case "location":
      case "datetime":
      case "datetime_range":
      case "date_range":
        return <Input {...rhfProps} value={rhfProps.value ?? ""} type={field.type} placeholder={field.placeholder} />
      case "textarea":
        return <Textarea {...rhfProps} value={rhfProps.value ?? ""} placeholder={field.placeholder} />
      case "radio_group":
        return (
          <RadioGroup onValueChange={rhfProps.onChange} value={rhfProps.value} className="flex gap-4">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "select":
        return (
          <Select onValueChange={rhfProps.onChange} value={rhfProps.value}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectPlaceholder', { label: field.label.toLowerCase() })} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  onCheckedChange={(checked) => {
                    const currentVal = rhfProps.value || []
                    const newVal = checked ? [...currentVal, option] : currentVal.filter((v: string) => v !== option)
                    rhfProps.onChange(newVal)
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )
      case "static_text":
        return (
          <p className="text-foreground bg-muted p-4 rounded-md border border-border leading-relaxed">
            {field.text}
          </p>
        )
      default:
        return <div className="text-red-500">Unsupported field type: {field.type}</div>
    }
  }

  if (field.type === "repeater") {
    const { fields: repeaterFields, append, remove } = useFieldArray({
      control,
      name: field.id,
    })

    const addItemLabel = field.fields?.[0].label || t('defaultItem');

    return (
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <Label className="text-base font-semibold text-card-foreground">{field.label}</Label>
        {repeaterFields.map((item, index) => (
          <div key={item.id} className="space-y-2 p-3 border border-border rounded-md relative">
            {field.fields?.map((subField: Field) => (
              <RenderField
                key={subField.id}
                control={control}
                field={{ ...subField, id: `${field.id}.${index}.${subField.id}` }}
                watch={watch}
              />
            ))}
            <Button variant="destructive" size="sm" type="button" onClick={() => remove(index)} className="absolute top-2 right-2">
              {t('remove')}
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => append({})}>
          {t('addItem', { item: addItemLabel })}
        </Button>
      </div>
    )
  }

  if (field.type === "static_text") {
    return (
      <div className="mb-6">
        <Label className="block mb-2 text-base font-semibold text-card-foreground">{field.label}</Label>
        {renderInput(null)}
      </div>
    )
  }

  return (
    <Controller
      name={field.id}
      control={control}
      rules={{ required: field.validation?.required }}
      defaultValue={field.defaultValue}
      render={({ field: rhfField, fieldState }) => (
        <div className="mb-6">
          <Label htmlFor={field.id} className="block mb-2 text-base font-semibold text-card-foreground">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderInput(rhfField)}
          {field.helperText && <p className="mt-2 text-sm text-muted-foreground">{field.helperText}</p>}
          {fieldState.error && <p className="mt-1 text-sm text-red-500">{t('requiredError', { label: field.label })}</p>}
        </div>
      )}
    />
  )
}

export default RenderField