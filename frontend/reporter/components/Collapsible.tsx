import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export type CollapsibleItem = {
  title: string;
  content: React.ReactNode;
  value: string;
}

type CollapsibleProps = {
  items: CollapsibleItem[];
  defaultValue?: string;
  className?: string;
}

export default function Collapsible({ items, defaultValue, className }: CollapsibleProps) {
  return (
    <div className={className}>
      <Accordion
        type="single"
        collapsible
        className="w-full -space-y-px"
        defaultValue={defaultValue}
      >
        {items.map((item) => (
          <AccordionItem
            value={item.value}
            key={item.value}
            className="bg-background has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative border outline-none first:rounded-t-md last:rounded-b-md last:border-b has-focus-visible:z-10 has-focus-visible:ring-[3px]"
          >
            <AccordionTrigger className="rounded-md px-4 py-3 text-[15px] leading-6 outline-none hover:no-underline focus-visible:ring-0">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mt-1 overflow-hidden ps-6 text-sm transition-all">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}