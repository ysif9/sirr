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

interface RenderFieldProps {
  control: Control<any>
  field: Field
  watch: UseFormWatch<any>
}

const RenderField: React.FC<RenderFieldProps> = ({ control, field, watch }) => {
  if (field.conditional) {
    const watchedValue = watch(field.conditional.field)
    if (watchedValue !== field.conditional.value) {
      return null
    }
  }

  const renderInput = (rhfProps: any) => {
    switch (field.type) {
      case "text":
      case "number":
      case "date":
      case "time":
      case "location": // Render as text for now
      case "datetime": // Render as text for now
      case "datetime_range": // Render as text for now
      case "date_range": // Render as text for now
        return <Input {...rhfProps} type={field.type} placeholder={field.placeholder} />
      case "textarea":
        return <Textarea {...rhfProps} placeholder={field.placeholder} />
      case "radio_group":
        return (
          <RadioGroup onValueChange={rhfProps.onChange} defaultValue={rhfProps.value} className="flex gap-4">
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
          <Select onValueChange={rhfProps.onChange} defaultValue={rhfProps.value}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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
      case "file_upload":
        return <Input {...rhfProps} type="file" />
      case "static_text":
        return (
          <p className="text-gray-300 bg-slate-700/50 p-4 rounded-md border border-white/10 leading-relaxed">
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

    return (
      <div className="space-y-4 p-4 border border-white/10 rounded-lg">
        <Label className="text-base font-semibold">{field.label}</Label>
        {repeaterFields.map((item, index) => (
          <div key={item.id} className="space-y-2 p-3 border border-white/10 rounded-md relative">
            {field.fields?.map((subField: Field) => (
              <RenderField
                key={subField.id}
                control={control}
                field={{ ...subField, id: `${field.id}.${index}.${subField.id}` }}
                watch={watch}
              />
            ))}
            <Button variant="destructive" size="sm" type="button" onClick={() => remove(index)} className="absolute top-2 right-2">
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => append({})}>
          Add {field.fields?.[0].label || "Item"}
        </Button>
      </div>
    )
  }

  // For static_text, we don't need a controller as it's not an input
  if (field.type === "static_text") {
    return (
      <div className="mb-6">
        <Label className="block mb-2 text-base font-semibold text-white">{field.label}</Label>
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
          <Label htmlFor={field.id} className="block mb-2 text-base font-semibold text-white">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderInput(rhfField)}
          {field.helperText && <p className="mt-2 text-sm text-gray-400">{field.helperText}</p>}
          {fieldState.error && <p className="mt-1 text-sm text-red-500">{field.label} is required.</p>}
        </div>
      )}
    />
  )
}

export default RenderField