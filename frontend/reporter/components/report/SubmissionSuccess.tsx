"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { Button } from "../ui/button"
import { ShieldCheckIcon } from "../icons/ShieldCheckIcon"

interface SubmissionSuccessProps {
  accessKey: string
  onReset: () => void
}

const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ accessKey, onReset }) => {
  const t = useTranslations("SubmissionSuccess");

  return (
    <div className="text-center py-10 animate-fade-in">
      <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-card-foreground mb-4">{t('title')}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {t('subtitle')}
      </p>
      <div className="mb-8">
        <p className="text-muted-foreground mb-2 font-semibold">
          {t('accessKeyInstruction')}
        </p>
        <div className="bg-muted inline-block p-4 rounded-lg border border-border">
          <p className="text-xl font-mono tracking-wider text-primary">{accessKey}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('accessKeyWarning')}
        </p>
      </div>
      <Button size="lg" onClick={onReset}>
        {t('fileAnotherReport')}
      </Button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default SubmissionSuccess