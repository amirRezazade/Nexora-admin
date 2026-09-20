"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Search, Star, Check, EyeOff, Trash2, MoreHorizontal, X, Eye, MessageSquare } from "lucide-react";
import { api, qs } from "@/lib/api";
import { cn, dateShort, number, relativeTime } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import { toast } from "@/store/slices/uiSlice";
import { useI18n } from "@/i18n/I18nProvider";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Avatar from "@/components/ui/Avatar";
import Rating from "@/components/ui/Rating";
import Tabs from "@/components/ui/Tabs";
import Badge, { StatusBadge, REVIEW_STATUS } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Dropdown, { MenuItem, MenuSeparator } from "@/components/ui/Dropdown";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Table, TableWrap, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

export default function ReviewsPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [state, setState] = useState({ status: "loading", data: [], total: 0, totalPages: 1, counts: {}, average: 0 });
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebouncedValue(query, 300);

  const load = async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await api(`/api/reviews${qs({ q: debounced, status: tab === "all" ? "" : tab, rating: ratingFilter, page, pageSize: 10 })}`);
      setState({ status: "succeeded", ...res });
    } catch {
      setState((s) => ({ ...s, status: "failed" }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, tab, ratingFilter, page]);

  const moderate = async (review, status) => {
    try {
      await api(`/api/reviews/${review.id}`, { method: "PATCH", body: { status } });
      dispatch(toast.success(status === "published" ? t("toast.reviewPublished") : status === "hidden" ? t("toast.reviewHidden") : t("toast.reviewUpdated"), t("toast.reviewHint", { name: review.customerName, product: review.productName })));
      load();
    } catch {
      dispatch(toast.error(t("toast.reviewUpdateError"), t("common.tryAgain")));
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/reviews/${confirmDelete.id}`, { method: "DELETE" });
      dispatch(toast.success(t("toast.reviewDeleted"), t("toast.reviewDeletedHint")));
      setConfirmDelete(null);
      load();
    } catch {
      dispatch(toast.error(t("toast.reviewDeleteError"), t("common.tryAgain")));
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { value: "all", label: t("common.all"), count: state.counts?.all },
    { value: "published", label: t("status.published"), count: state.counts?.published },
    { value: "pending", label: t("status.pending"), count: state.counts?.pending },
    { value: "hidden", label: t("status.hidden"), count: state.counts?.hidden },
  ];

  const hasFilters = Boolean(query || ratingFilter);
  const loading = state.status === "loading";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("reviewsPage.title")} description={t("reviewsPage.description")}>
        <div className="mt-3 flex items-center gap-3">
          <Rating value={state.average || 0} size="md" />
          <span className="text-body-sm text-ink-2">{t("reviewsPage.average", { n: number(state.counts?.all || 0) })}</span>
        </div>
      </PageHeader>

      <Card className="flex flex-col">
        <div className="px-4 sm:px-5">
          <Tabs
            tabs={tabs}
            value={tab}
            ariaLabel="Filter reviews by moderation status"
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input
              type="search"
              icon={Search}
              placeholder={t("reviewsPage.search")}
              aria-label={t("reviewsPage.search")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="h-8"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            size="sm"
            aria-label="Filter by rating"
            options={[
              { value: "", label: t("reviewsPage.allRatings") },
              { value: "5", label: t("reviewsPage.stars", { n: 5 }) },
              { value: "4", label: t("reviewsPage.stars", { n: 4 }) },
              { value: "3", label: t("reviewsPage.stars", { n: 3 }) },
              { value: "2", label: t("reviewsPage.stars", { n: 2 }) },
              { value: "1", label: t("reviewsPage.star") },
            ]}
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="w-36"
          />
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery("");
                setRatingFilter("");
              }}
            >
              {t("common.clear")}
            </Button>
          )}
        </div>

        {state.status === "failed" ? (
          <ErrorState title={t("reviewsPage.loadError")} description={t("common.tryAgain")} onRetry={load} />
        ) : loading && state.data.length === 0 ? (
          <SkeletonTable rows={6} columns={5} checkbox={false} />
        ) : state.data.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={hasFilters || tab !== "all" ? t("reviewsPage.noneFound") : t("reviewsPage.empty")}
            description={hasFilters || tab !== "all" ? t("reviewsPage.noneFoundHint") : t("reviewsPage.emptyHint")}
            action={
              (hasFilters || tab !== "all") && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setRatingFilter("");
                    setTab("all");
                  }}
                >
                  {t("common.clearFilters")}
                </Button>
              )
            }
          />
        ) : (
          <TableWrap className={cn(loading && "pointer-events-none opacity-60")}>
            <Table>
              <caption className="sr-only">Customer reviews awaiting or completed moderation.</caption>
              <THead>
                <tr>
                  <TH className="w-[84px] sm:w-[120px]">{t("reviewsPage.colRating")}</TH>
                  <TH className="hidden sm:table-cell sm:min-w-[160px]">{t("reviewsPage.colCustomer")}</TH>
                  <TH className="hidden md:table-cell">{t("reviewsPage.colProduct")}</TH>
                  <TH className="sm:min-w-[260px]">{t("reviewsPage.colReview")}</TH>
                  <TH className="hidden xl:table-cell">{t("reviewsPage.colDate")}</TH>
                  <TH className="hidden lg:table-cell">{t("reviewsPage.colStatus")}</TH>
                  <TH width="60px" align="right">
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {state.data.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      <Rating value={r.rating} showValue={false} />
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.customerName} size="sm" tone="neutral" />
                        <div className="min-w-0">
                          <Link href={`/customers/${r.customerId}`} className="block truncate text-body-sm font-medium text-ink underline-offset-4 hover:text-brand-text hover:underline">
                            {r.customerName}
                          </Link>
                          {r.verified && (
                            <Badge tone="success" size="sm">
                              {t("reviewsPage.verified")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TD>
                    <TD className="hidden md:table-cell">
                      <Link href={`/products/${r.productId}`} className="block max-w-[180px] truncate text-body-sm text-ink-2 underline-offset-4 hover:text-brand-text hover:underline">
                        {r.productName}
                      </Link>
                    </TD>
                    <TD>
                      <p className="text-body-sm font-medium text-ink">{r.title}</p>
                      <p className="line-clamp-2 max-w-md text-caption leading-relaxed text-ink-2">{r.body}</p>
                    </TD>
                    <TD numeric muted className="hidden xl:table-cell">
                      {dateShort(r.createdAt)}
                      <span className="block text-caption text-ink-3">{relativeTime(r.createdAt)}</span>
                    </TD>
                    <TD className="hidden lg:table-cell">
                      <StatusBadge map={REVIEW_STATUS} value={r.status} size="sm" />
                    </TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === "pending" && <IconButton icon={Check} size="sm" label={`Publish review from ${r.customerName}`} className="hidden text-success-text hover:bg-success-soft sm:inline-flex" onClick={() => moderate(r, "published")} />}
                        <Dropdown menuLabel={`Actions for review from ${r.customerName}`} trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for review from ${r.customerName}`} />}>
                          {({ close }) => (
                            <>
                              <MenuItem icon={Eye} as={Link} href={`/products/${r.productId}`} onClick={close}>
                                {t("reviewsPage.colProduct")}
                              </MenuItem>
                              <MenuSeparator />
                              {r.status !== "published" && (
                                <MenuItem
                                  icon={Check}
                                  onClick={() => {
                                    close();
                                    moderate(r, "published");
                                  }}
                                >
                                  {t("reviewsPage.publish")}
                                </MenuItem>
                              )}
                              {r.status !== "hidden" && (
                                <MenuItem
                                  icon={EyeOff}
                                  onClick={() => {
                                    close();
                                    moderate(r, "hidden");
                                  }}
                                >
                                  {t("reviewsPage.hide")}
                                </MenuItem>
                              )}
                              <MenuSeparator />
                              <MenuItem
                                icon={Trash2}
                                destructive
                                onClick={() => {
                                  close();
                                  setConfirmDelete(r);
                                }}
                              >
                                {t("common.delete")}
                              </MenuItem>
                            </>
                          )}
                        </Dropdown>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        <Pagination page={page} totalPages={state.totalPages} total={state.total} pageSize={10} itemLabel={t("reviewsPage.itemLabel")} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} loading={deleting} title={t("reviewsPage.deleteTitle")} message={confirmDelete ? t("confirm.deleteReviewMsg", { name: confirmDelete.customerName, product: confirmDelete.productName }) : ""} confirmLabel={t("reviewsPage.deleteConfirm")} cancelLabel={t("common.cancel")} />
    </div>
  );
}
