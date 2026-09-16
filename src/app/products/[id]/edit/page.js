'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { api } from '@/lib/api';
import ProductForm from '@/components/products/ProductForm';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function EditProductPage() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', data: null });

  const load = () => {
    setState({ status: 'loading', data: null });
    api(`/api/products/${id}`)
      .then((res) => setState({ status: 'succeeded', data: res.data }))
      .catch((e) => setState({ status: e.status === 404 ? 'notfound' : 'failed', data: null }));
  };

  useEffect(load, [id]);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-56" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="card space-y-4 p-6">
            <SkeletonText lines={8} />
          </div>
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (state.status === 'notfound') {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may have been deleted."
          action={<Button as={Link} href="/products" variant="primary">Back to Products</Button>}
        />
      </Card>
    );
  }

  if (state.status === 'failed') {
    return (
      <Card>
        <ErrorState title="We couldn’t load this product." description="Please try again." onRetry={load} />
      </Card>
    );
  }

  return <ProductForm mode="edit" productId={id} initial={state.data} />;
}
