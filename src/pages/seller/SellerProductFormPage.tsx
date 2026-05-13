import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import ImageUploader from '../../components/Product/ImageUploader';
import {
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useListCategoriesQuery,
  useListBrandsQuery,
} from '../../services/productApi';

const schema = z.object({
  title:              z.string().min(3, 'Title is required'),
  description:        z.string().optional(),
  images:             z.array(z.string()).default([]),
  tags:               z.string().optional(),
  categoryId:         z.string().optional(),
  brandId:            z.string().optional(),
  price:              z.coerce.number().min(0.01, 'Price required'),
  compareAtPrice:     z.coerce.number().optional(),
  stock:              z.coerce.number().int().min(0, 'Stock required'),
  sku:                z.string().optional(),
  lowStockThreshold:  z.coerce.number().int().min(0).optional(),
  status:             z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type FormValues = z.infer<typeof schema>;

export default function SellerProductFormPage() {
  const { id }     = useParams<{ id: string }>();
  const isEdit     = !!id;
  const navigate   = useNavigate();

  const { data: existing } = useGetProductQuery(id ?? '', { skip: !isEdit });
  const { data: catData }  = useListCategoriesQuery();
  const { data: brData }   = useListBrandsQuery();

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const saving = creating || updating;

  const {
    register, handleSubmit, control,
    reset, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  useEffect(() => {
    if (isEdit && existing?.product) {
      const p = existing.product;
      reset({
        title:             p.title,
        description:       p.description,
        images:            p.images,
        tags:              p.tags.join(', '),
        categoryId:        p.category?.id ?? '',
        brandId:           p.brand?.id ?? '',
        price:             p.price,
        compareAtPrice:    p.compareAtPrice,
        stock:             p.stock,
        sku:               p.sku,
        lowStockThreshold: p.lowStockThreshold,
        status:            p.status,
      });
    }
  }, [existing, isEdit, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const tags = values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const body = {
      title:             values.title,
      description:       values.description,
      images:            values.images,
      tags,
      categoryId:        values.categoryId || undefined,
      brandId:           values.brandId    || undefined,
      price:             values.price,
      compareAtPrice:    values.compareAtPrice || undefined,
      stock:             values.stock,
      sku:               values.sku,
      lowStockThreshold: values.lowStockThreshold,
      status:            values.status,
    };

    try {
      if (isEdit && id) {
        await updateProduct({ id, ...body }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct(body).unwrap();
        toast.success('Product created');
      }
      navigate('/seller/products');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg ?? 'Something went wrong');
    }
  };

  const categories = catData?.categories ?? [];
  const brands     = brData?.brands      ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/seller/products')}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800">Product Images</h2>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader images={field.value ?? []} onChange={field.onChange} max={5} />
              )}
            />
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800">Basic Information</h2>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Title *</label>
              <input
                {...register('title')}
                placeholder="Product title"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your product…"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Tags <span className="text-zinc-400 font-normal">(comma separated)</span></label>
              <input
                {...register('tags')}
                placeholder="e.g. electronics, wireless, premium"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Category</label>
                <select
                  {...register('categoryId')}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Brand</label>
                <select
                  {...register('brandId')}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">— None —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800">Pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Price (₹) *</label>
                <input
                  {...register('price')}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Compare-at Price (₹)</label>
                <input
                  {...register('compareAtPrice')}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Original price"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800">Inventory</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Stock *</label>
                <input
                  {...register('stock')}
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">SKU</label>
                <input
                  {...register('sku')}
                  placeholder="SKU-001"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Low Stock Alert</label>
                <input
                  {...register('lowStockThreshold')}
                  type="number"
                  min={0}
                  placeholder="5"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800">Visibility</h2>
            <div className="flex gap-3">
              {(['ACTIVE', 'DRAFT', 'INACTIVE'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={s} {...register('status')} className="accent-violet-600" />
                  <span className="text-sm text-zinc-700">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-6 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
