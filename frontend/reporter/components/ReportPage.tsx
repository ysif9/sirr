"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { getReportTypeKeys, getCategoryKeysForReportType, getFormKeysForCategory } from "@/lib/crime-forms-structure"

const ReportPage: React.FC = () => {
  const t = useTranslations("ReportPage");
  const tForms = useTranslations("crimeForms");
  const router = useRouter();

  const [view, setView] = useState<"main" | "categories" | "forms">("main");
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const reportTypeKeys = getReportTypeKeys();

  const handleBack = () => {
    if (view === "forms") {
      setView("categories");
      setSelectedCategory(null);
    } else if (view === "categories") {
      setView("main");
      setSelectedReportType(null);
    } else {
      router.push("/");
    }
  };

  const selectReportType = (typeKey: string) => {
    setSelectedReportType(typeKey);
    setView("categories");
  };

  const selectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setView("forms");
  };

  const selectForm = (formKey: string) => {
    if (selectedReportType && selectedCategory) {
      router.push(`/report/${selectedReportType}/${selectedCategory}/${formKey}`);
    }
  };

  const renderContent = () => {
    if (view === "forms" && selectedReportType && selectedCategory) {
      const formKeys = getFormKeysForCategory(selectedReportType, selectedCategory);
      if (!formKeys.length) return <p>No forms found for this category.</p>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formKeys.map((key) => {
            const title = tForms(`category_structures.${selectedReportType}.categories.${selectedCategory}.forms.${key}.title`);
            return (
              <CategoryCard
                key={key}
                title={title}
                subtitle={t("formCardSubtitle", { title })}
                onClick={() => selectForm(key)}
                size="small"
              />
            );
          })}
        </div>
      );
    }

    if (view === "categories" && selectedReportType) {
      const categoryKeys = getCategoryKeysForReportType(selectedReportType);
      if (!categoryKeys.length) return <p>No categories found.</p>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryKeys.map((key) => (
            <CategoryCard
              key={key}
              title={tForms(`category_structures.${selectedReportType}.categories.${key}.title`)}
              subtitle={tForms(`category_structures.${selectedReportType}.categories.${key}.subtitle`)}
              onClick={() => selectCategory(key)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {reportTypeKeys.map((key) => (
          <CategoryCard
            key={key}
            title={tForms(`category_structures.${key}.title`)}
            subtitle={tForms(`category_structures.${key}.subtitle`)}
            onClick={() => selectReportType(key)} />
        ))}
      </div>
    );
  };

  const getPageTitle = () => {
    if (view === "forms" && selectedReportType && selectedCategory) {
      return tForms(`category_structures.${selectedReportType}.categories.${selectedCategory}.title`);
    }
    if (view === "categories" && selectedReportType) {
      return tForms(`category_structures.${selectedReportType}.title`);
    }
    return t("title");
  };

  const getPageSubtitle = () => {
    if (view === "forms") {
      return t("formsSubtitle");
    }
    if (view === "categories") {
      return t("categoriesSubtitle");
    }
    return t("subtitle");
  };

  return (
    <div className="report-theme min-h-screen flex flex-col animate-fadeIn bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
          <button onClick={handleBack} className="group mr-2 focus:outline-none" aria-label={t("backButton")}>
            <div
              className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors p-2 group-hover:bg-gray-500 group-hover:bg-opacity-20 rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t("backButton")}</span>
            </div>
          </button>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">{getPageTitle()}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{getPageSubtitle()}</p>
          </div>
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  )
}

export default ReportPage
