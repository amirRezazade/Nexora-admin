"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, FolderTree, Pencil, Trash2, MoreHorizontal, X, CornerDownRight, Package } from "lucide-react";
import { cn, number, slugify, localized } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { useDebouncedValue } from "@/lib/hooks";
import { fetchCategories, setFilter, setSort, setPage, createCategory, updateCategory, deleteCategory } from "@/store/slices/categoriesSlice";
import { toast } from "@/store/slices/uiSlice";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Dropdown, { MenuItem, MenuSeparator } from "@/components/ui/Dropdown";
import Modal, { ConfirmDialog } from "@/components/ui/Modal";
import { Table, TableWrap, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

const STATUS_TONES = { active: "success", draft: "neutral" };

function CategoryDialog({ open, onClose, category, parents }) {
  const dispatch = useDispatch();
  const editing = Boolean(category);
  const { t, locale } = useI18n();
  const [values, setValues] = useState({ name: "", nameFa: "", slug: "", parentId: "", status: "active", description: "", descriptionFa: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        category
          ? {
              name: category.name,
              nameFa: category.nameFa || "",
              slug: category.slug,
              parentId: category.parentId || "",
              status: category.status,
              description: category.description || "",
              descriptionFa: category.descriptionFa || "",
            }
          : { name: "", nameFa: "", slug: "", parentId: "", status: "active", description: "", descriptionFa: "" },
      );
      setErrors({});
      setSlugTouched(Boolean(category));
    }
  }, [open, category]);

  const submit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setErrors({ name: t("categoriesPage.nameRequired") });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateCategory({ id: category.id, ...values })).unwrap();
        dispatch(toast.success(t("toast.categoryUpdated"), t("toast.categorySavedHint", { name: values.name })));
      } else {
        await dispatch(createCategory(values)).unwrap();
        dispatch(toast.success(t("toast.categoryCreated"), t("toast.categoryCreatedHint", { name: values.name })));
      }
      onClose();
    } catch (err) {
      const fieldErrors = err && typeof err === "object" ? err : { name: t("common.tryAgain") };
      setErrors(fieldErrors);
      dispatch(toast.error(t("toast.categorySaveError"), fieldErrors.name || t("common.tryAgain")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t("form.editCategory") : t("form.addCategory")}
      description={editing ? t("form.editCategoryHint") : t("form.addCategoryHint")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="category-dialog-form" variant="primary" loading={saving}>
            {saving ? t("common.saving") : editing ? t("common.save") : t("form.addCategory")}
          </Button>
        </>
      }
    >
      <form id="category-dialog-form" onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <Input
          label={t("form.name")}
          required
          data-autofocus
          placeholder="e.g. Outerwear"
          value={values.name}
          onChange={(e) => {
            const name = e.target.value;
            setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));
            setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={errors.name}
        />
        <Input label={t("form.nameFa")} placeholder="مثلاً کت و کاپشن" value={values.nameFa} onChange={(e) => setValues((v) => ({ ...v, nameFa: e.target.value }))} dir="rtl" lang="fa" />
        <Input
          label={t("form.slug")}
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setValues((v) => ({ ...v, slug: e.target.value }));
          }}
          hint={`nexora.com/collections/${values.slug || "your-category"}`}
          className="font-mono text-body-sm"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label={t("form.parentCategory")} placeholder={t("form.parentNone")} options={parents.filter((p) => p.id !== category?.id).map((p) => ({ value: p.id, label: localized(p, "name", locale) }))} value={values.parentId} onChange={(e) => setValues((v) => ({ ...v, parentId: e.target.value }))} />
          <Select
            label={t("form.status")}
            options={[
              { value: "active", label: t("status.active") },
              { value: "draft", label: t("status.draft") },
            ]}
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
          />
        </div>
        <Textarea label={t("form.description")} rows={3} placeholder="A short summary shown on the collection page." value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
        <Textarea label={t("form.descriptionFa")} rows={3} placeholder="خلاصهٔ فارسی این دسته" value={values.descriptionFa} onChange={(e) => setValues((v) => ({ ...v, descriptionFa: e.target.value }))} dir="rtl" lang="fa" />
      </form>
    </Modal>
  );
}

export default function CategoriesPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const { items, all, status, filters, sort, page, total, totalPages, pageSize } = useSelector((s) => s.categories);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [dialog, setDialog] = useState({ open: false, category: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debounced !== filters.q) dispatch(setFilter({ key: "q", value: debounced }));
  }, [debounced, filters.q, dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch, filters, sort, page]);

  const parentName = (id) => {
    const c = all.find((x) => x.id === id);
    return c ? localized(c, "name", locale) : "";
  };
  const topLevel = all.filter((c) => !c.parentId);
  const hasFilters = Boolean(filters.q) || filters.status.length > 0;

  const doDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteCategory(confirmDelete.id)).unwrap();
      dispatch(toast.success(t("toast.categoryDeleted"), t("toast.categoryDeletedHint", { name: confirmDelete.name })));
      setConfirmDelete(null);
    } catch (msg) {
      dispatch(toast.error(t("toast.categoryDeleteError"), typeof msg === "string" ? msg : t("common.tryAgain")));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("categoriesPage.title")}
        description={t("categoriesPage.description")}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setDialog({ open: true, category: null })}>
            {t("form.addCategory")}
          </Button>
        }
      />

      <Card className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input type="search" icon={Search} placeholder={t("categoriesPage.search")} aria-label={t("categoriesPage.searchAria")} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-8" />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            size="sm"
            aria-label="Filter by status"
            options={[
              { value: "", label: t("filters.allStatuses") },
              { value: "active", label: t("status.active") },
              { value: "draft", label: t("status.draft") },
            ]}
            value={filters.status[0] || ""}
            onChange={(e) => dispatch(setFilter({ key: "status", value: e.target.value ? [e.target.value] : [] }))}
            className="w-36"
          />
          <Button size="sm" variant="primary" icon={Plus} className="ml-auto hidden! sm:inline-flex!" onClick={() => setDialog({ open: true, category: null })}>
            {t("form.addCategory")}
          </Button>
        </div>

        {status === "failed" ? (
          <ErrorState title={t("categoriesPage.loadError")} description={t("common.tryAgain")} onRetry={() => dispatch(fetchCategories())} />
        ) : status === "loading" && items.length === 0 ? (
          <SkeletonTable rows={6} columns={4} checkbox={false} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title={hasFilters ? t("categoriesPage.noneFound") : t("categoriesPage.empty")}
            description={hasFilters ? t("categoriesPage.noneFoundHint") : t("categoriesPage.emptyHint")}
            action={
              <Button variant="primary" icon={Plus} onClick={() => setDialog({ open: true, category: null })}>
                {t("form.addCategory")}
              </Button>
            }
          />
        ) : (
          <TableWrap className={cn(status === "loading" && "pointer-events-none opacity-60")}>
            <Table>
              <caption className="sr-only">{t("categoriesPage.description")}</caption>
              <THead>
                <tr>
                  <TH sortable sortKey="name" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="sm:min-w-[260px]">
                    {t("categoriesPage.colCategory")}
                  </TH>
                  <TH className="hidden md:table-cell">{t("categoriesPage.colSlug")}</TH>
                  <TH align="right" sortable sortKey="productCount" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                    {t("categoriesPage.colProducts")}
                  </TH>
                  <TH className="hidden sm:table-cell">{t("categoriesPage.colStatus")}</TH>
                  <TH width="60px" align="right">
                    <span className="sr-only">{t("common.actions")}</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {items.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-start gap-2.5">
                        {c.parentId && <CornerDownRight aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-body-sm font-semibold text-ink">{localized(c, "name", locale)}</span>
                            {c.childCount > 0 && (
                              <Badge tone="outline" size="sm">
                                {t("categoriesPage.subCount", { n: c.childCount })}
                              </Badge>
                            )}
                          </div>
                          {c.parentId ? <p className="text-caption text-ink-3">{t("categoriesPage.inParent", { name: parentName(c.parentId) })}</p> : c.description ? <p className="hidden truncate text-caption text-ink-3 sm:block">{c.description}</p> : null}
                        </div>
                      </div>
                    </TD>
                    <TD className="hidden md:table-cell">
                      <span className="font-mono text-caption text-ink-2">{c.slug}</span>
                    </TD>
                    <TD align="right" numeric>
                      <Link href={`/products?category=${c.id}`} className="font-medium text-ink underline-offset-4 hover:text-brand-text hover:underline">
                        {number(c.productCount)}
                      </Link>
                      {c.childCount > 0 && c.descendantCount !== c.productCount && <span className="block text-caption text-ink-3">{t("categoriesPage.withSubs", { n: number(c.descendantCount) })}</span>}
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <Badge tone={STATUS_TONES[c.status] || "neutral"} dot size="sm">
                        {t(`status.${c.status}`)}
                      </Badge>
                    </TD>
                    <TD align="right">
                      <Dropdown menuLabel={`Actions for ${c.name}`} trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for ${c.name}`} />}>
                        {({ close }) => (
                          <>
                            <MenuItem icon={Package} as={Link} href={`/products?category=${c.id}`} onClick={close}>
                              {t("categoriesPage.viewProducts")}
                            </MenuItem>
                            <MenuItem
                              icon={Pencil}
                              onClick={() => {
                                close();
                                setDialog({ open: true, category: c });
                              }}
                            >
                              {t("common.edit")}
                            </MenuItem>
                            <MenuSeparator />
                            <MenuItem
                              icon={Trash2}
                              destructive
                              onClick={() => {
                                close();
                                setConfirmDelete(c);
                              }}
                            >
                              {t("common.delete")}
                            </MenuItem>
                          </>
                        )}
                      </Dropdown>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} itemLabel={t("categoriesPage.itemLabel")} onPageChange={(p) => dispatch(setPage(p))} />
      </Card>

      <CategoryDialog open={dialog.open} category={dialog.category} parents={topLevel} onClose={() => setDialog({ open: false, category: null })} />

      <ConfirmDialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} loading={deleting} title={t("confirm.deleteCategory")} message={confirmDelete ? t("confirm.deleteCategoryMsg", { name: confirmDelete.name }) : ""} confirmLabel={t("common.delete")} />
    </div>
  );
}
