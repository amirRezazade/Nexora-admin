"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { BookOpen, MessageSquare, Mail, ExternalLink, ChevronDown, LifeBuoy, Keyboard } from "lucide-react";
import { cn } from "@/lib/format";
import { toast } from "@/store/slices/uiSlice";
import { useI18n } from "@/i18n/I18nProvider";

import PageHeader from "@/components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Accordion from "@/components/ui/Accordion";

const FAQS = [
  {
    q: "How do I add a product with variants?",
    a: "Go to Products → Add Product, fill in the core details, then open the Variants section and add a row for each size and colour combination. Each variant carries its own SKU, price override and stock count.",
  },
  {
    q: "What does the low-stock threshold do?",
    a: "When a product’s available quantity drops to or below its threshold, Nexora flags it as low stock on the dashboard, raises a notification, and surfaces it in the Inventory low-stock filter. It does not stop customers buying.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Products, Orders, Customers and Inventory each have an Export button that downloads the current filtered view as a CSV file. Selecting rows first exports only that selection.",
  },
  {
    q: "How do refunds work?",
    a: "Open the order, choose More → Cancel order for unfulfilled orders, or mark it as refunded once you have processed the return through your payment provider. Nexora records the status change in the order activity log.",
  },
  {
    q: "Why can’t I delete a category?",
    a: "Categories that still contain products can’t be deleted, to avoid orphaning your catalog. Move or reassign those products first, then delete the empty category.",
  },
];

const SHORTCUTS = [
  ["⌘ K", "Open search"],
  ["Esc", "Close dialog or panel"],
  ["↑ ↓", "Move through results"],
  ["Enter", "Open the highlighted result"],
  ["Tab", "Move to the next control"],
];

export default function SupportPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [values, setValues] = useState({ subject: "", topic: "general", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.subject.trim()) errs.subject = t("validation.subjectRequired");
    if (!values.message.trim()) errs.message = t("validation.messageRequired");
    else if (values.message.trim().length < 20) errs.message = t("validation.messageMin");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setValues({ subject: "", topic: "general", message: "" });
    dispatch(toast.success(t("toast.messageSent"), t("toast.messageSentHint")));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("supportPage.title")} description={t("supportPage.description")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: t("supportPage.docs"), body: t("supportPage.docsBody"), cta: t("supportPage.docsCta") },
          { icon: MessageSquare, title: t("supportPage.community"), body: t("supportPage.communityBody"), cta: t("supportPage.communityCta") },
          { icon: Mail, title: t("supportPage.email"), body: t("supportPage.emailBody"), cta: t("supportPage.emailCta") },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} padded className="flex flex-col">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-soft">
                <Icon aria-hidden className="h-4 w-4 text-brand-text" />
              </span>
              <h2 className="mt-3.5 text-h4 text-ink">{c.title}</h2>
              <p className="mt-1 flex-1 text-body-sm leading-relaxed text-ink-2">{c.body}</p>
              <Button variant="link" size="sm" iconRight={ExternalLink} className="mt-3 self-start">
                {c.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="mb-3 text-h2 text-ink">{t("supportPage.faq")}</h2>
            <div className="flex flex-col gap-2.5">
              {FAQS.map((f, i) => (
                <Accordion key={f.q} id={`faq-${i}`} title={f.q} defaultOpen={i === 0}>
                  <p className="text-body-sm leading-relaxed text-ink-2">{f.a}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t("supportPage.contact")} description="We usually reply within one business day." icon={LifeBuoy} />
            <CardBody>
              <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <Input
                  label={t("supportPage.subject")}
                  required
                  placeholder="Briefly, what's happening?"
                  value={values.subject}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, subject: e.target.value }));
                    setErrors((p) => ({ ...p, subject: undefined }));
                  }}
                  error={errors.subject}
                />
                <Select
                  label={t("supportPage.topic")}
                  value={values.topic}
                  onChange={(e) => setValues((v) => ({ ...v, topic: e.target.value }))}
                  options={[
                    { value: "general", label: "General question" },
                    { value: "orders", label: "Orders & fulfilment" },
                    { value: "products", label: "Products & inventory" },
                    { value: "payments", label: "Payments & payouts" },
                    { value: "bug", label: "Something looks broken" },
                  ]}
                />
                <Textarea
                  label={t("supportPage.message")}
                  required
                  rows={5}
                  placeholder="Tell us what you expected to happen and what happened instead."
                  value={values.message}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, message: e.target.value }));
                    setErrors((p) => ({ ...p, message: undefined }));
                  }}
                  error={errors.message}
                />
                <Button type="submit" variant="primary" loading={sending} className="self-start">
                  {sending ? t("supportPage.sending") : t("supportPage.send")}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("supportPage.shortcuts")} icon={Keyboard} />
            <CardBody>
              <dl className="divide-y divide-line">
                {SHORTCUTS.map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2">
                    <dt className="text-body-sm text-ink-2">{label}</dt>
                    <dd>
                      <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-caption font-semibold text-ink">{key}</kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
