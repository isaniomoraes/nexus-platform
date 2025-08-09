'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  EmptyCta,
} from '@nexus/ui/components'
import { MoreHorizontal, PencilIcon, CirclePlusIcon, TrashIcon, RepeatIcon } from 'lucide-react'
import { usePlans, useUpsertPlan, useDeletePlan } from '@/src/hooks/use-plans'

type PricingModel = 'Fixed' | 'Usage' | 'Tiered'
type BillingCadence = 'Monthly' | 'Quarterly'
type ContractLength = '1 month' | '3 months' | '6 months' | '12 months'
type ProductUsageApi = 'AIR Direct' | 'SDK' | 'Manual Upload'

interface Plan {
  id: string
  name: string
  pricingModel: PricingModel
  contractLength: ContractLength
  billingCadence: BillingCadence
  setupFee: number
  prepaymentPercent: number
  capAmount: number
  overageCost: number
  productUsageApi: ProductUsageApi
  creditsPerPeriod?: number | null
  pricePerCredit?: number | null
  clientCount: number
}

// Schema for the FORM (strings from inputs)
const formSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  pricingModel: z.enum(['Fixed', 'Usage', 'Tiered']),
  creditsPerPeriod: z.string().optional(),
  pricePerCredit: z.string().optional(),
  productUsageApi: z.enum(['AIR Direct', 'SDK', 'Manual Upload']),
  contractLength: z.enum(['1 month', '3 months', '6 months', '12 months']),
  billingCadence: z.enum(['Monthly', 'Quarterly']),
  setupFee: z.string().min(1, 'Required'),
  prepaymentPercent: z.string().min(1, 'Required'),
  capAmount: z.string().min(1, 'Required'),
  overageCost: z.string().min(1, 'Required'),
})

// Domain schema (numbers) used after coercion
const planSchema = z.object({
  name: z.string().min(1),
  pricingModel: z.enum(['Fixed', 'Usage', 'Tiered']),
  creditsPerPeriod: z.number().nonnegative().optional(),
  pricePerCredit: z.number().nonnegative().optional(),
  productUsageApi: z.enum(['AIR Direct', 'SDK', 'Manual Upload']),
  contractLength: z.enum(['1 month', '3 months', '6 months', '12 months']),
  billingCadence: z.enum(['Monthly', 'Quarterly']),
  setupFee: z.number().nonnegative(),
  prepaymentPercent: z.number().min(0).max(100),
  capAmount: z.number().nonnegative(),
  overageCost: z.number().nonnegative(),
})

type PlanFormValues = z.infer<typeof formSchema>

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SubscriptionsClient() {
  const plansQuery = usePlans()
  const upsertPlan = useUpsertPlan()
  const deletePlan = useDeletePlan()
  const plans = plansQuery.data ?? []

  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const [editing, setEditing] = React.useState<Plan | null>(null)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      pricingModel: 'Fixed',
      creditsPerPeriod: '',
      pricePerCredit: '',
      productUsageApi: 'AIR Direct',
      contractLength: '1 month',
      billingCadence: 'Monthly',
      setupFee: '0',
      prepaymentPercent: '0',
      capAmount: '0',
      overageCost: '0',
    },
  })

  function openCreate() {
    setEditing(null)
    form.reset({
      name: '',
      pricingModel: 'Fixed',
      creditsPerPeriod: '',
      pricePerCredit: '',
      productUsageApi: 'AIR Direct',
      contractLength: '1 month',
      billingCadence: 'Monthly',
      setupFee: '0',
      prepaymentPercent: '0',
      capAmount: '0',
      overageCost: '0',
    })
    setIsOpen(true)
  }

  function openEdit(plan: Plan) {
    setEditing(plan)
    form.reset({
      name: plan.name,
      pricingModel: plan.pricingModel,
      creditsPerPeriod: plan.creditsPerPeriod?.toString() ?? '',
      pricePerCredit: plan.pricePerCredit?.toString() ?? '',
      productUsageApi: plan.productUsageApi,
      contractLength: plan.contractLength,
      billingCadence: plan.billingCadence,
      setupFee: plan.setupFee.toString(),
      prepaymentPercent: plan.prepaymentPercent.toString(),
      capAmount: plan.capAmount.toString(),
      overageCost: plan.overageCost.toString(),
    })
    setIsOpen(true)
  }

  function onSubmit(values: PlanFormValues) {
    const parsed = planSchema.parse({
      name: values.name,
      pricingModel: values.pricingModel,
      creditsPerPeriod: values.creditsPerPeriod ? Number(values.creditsPerPeriod) : undefined,
      pricePerCredit: values.pricePerCredit ? Number(values.pricePerCredit) : undefined,
      productUsageApi: values.productUsageApi,
      contractLength: values.contractLength,
      billingCadence: values.billingCadence,
      setupFee: Number(values.setupFee),
      prepaymentPercent: Number(values.prepaymentPercent),
      capAmount: Number(values.capAmount),
      overageCost: Number(values.overageCost),
    })
    const normalized = {
      ...parsed,
      creditsPerPeriod: parsed.creditsPerPeriod ?? undefined,
      pricePerCredit: parsed.pricePerCredit ?? undefined,
    }
    upsertPlan.mutate(editing ? { id: editing.id, ...normalized } : normalized)
    setIsOpen(false)
  }

  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  function requestDelete(id: string) {
    setConfirmId(id)
  }
  function confirmDelete() {
    if (!confirmId) return
    deletePlan.mutate(confirmId)
    setConfirmId(null)
  }

  if (plansQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Contract Length</TableHead>
                <TableHead>Billing Cadence</TableHead>
                <TableHead>Setup Fee</TableHead>
                <TableHead>Prepayment %</TableHead>
                <TableHead>$ Cap</TableHead>
                <TableHead>Overage Cost</TableHead>
                <TableHead># Clients</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={10}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plan Manager</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <CirclePlusIcon className="size-4" /> Add Plan
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2">
                <span className="size-6 bg-sidebar rounded-md flex items-center justify-center border">
                  <RepeatIcon className="size-4 text-sidebar-foreground" />
                </span>
                {editing ? 'Edit Plan' : 'Add New Plan'}
              </SheetTitle>
              <SheetDescription>
                Define pricing, contract terms, and limits for this plan.
              </SheetDescription>
            </SheetHeader>
            <form
              className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* Left column inputs */}
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input id="name" placeholder="Enter plan name" {...form.register('name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model</Label>
                <Select
                  value={form.watch('pricingModel')}
                  onValueChange={(v: PricingModel) =>
                    form.setValue('pricingModel', v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Usage">Usage</SelectItem>
                    <SelectItem value="Tiered">Tiered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditsPerPeriod">Credits per Period</Label>
                <Input
                  id="creditsPerPeriod"
                  inputMode="numeric"
                  {...form.register('creditsPerPeriod')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerCredit">Price per Credit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="pricePerCredit"
                    className="pl-7"
                    inputMode="decimal"
                    {...form.register('pricePerCredit')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productUsageApi">Product Usage API</Label>
                <Select
                  value={form.watch('productUsageApi')}
                  onValueChange={(v: ProductUsageApi) =>
                    form.setValue('productUsageApi', v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIR Direct">AIR Direct</SelectItem>
                    <SelectItem value="SDK">SDK</SelectItem>
                    <SelectItem value="Manual Upload">Manual Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractLength">Contract Length</Label>
                <Select
                  value={form.watch('contractLength')}
                  onValueChange={(v: ContractLength) =>
                    form.setValue('contractLength', v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="12 months">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCadence">Payment Cadence</Label>
                <Select
                  value={form.watch('billingCadence')}
                  onValueChange={(v: BillingCadence) =>
                    form.setValue('billingCadence', v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupFee">Setup Fee</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="setupFee"
                    className="pl-7"
                    inputMode="decimal"
                    {...form.register('setupFee')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prepaymentPercent">Prepayment %</Label>
                <div className="relative">
                  <Input
                    id="prepaymentPercent"
                    inputMode="decimal"
                    {...form.register('prepaymentPercent')}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capAmount">Cap Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="capAmount"
                    className="pl-7"
                    inputMode="decimal"
                    {...form.register('capAmount')}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="overageCost">Overage Cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="overageCost"
                    className="pl-7"
                    inputMode="decimal"
                    {...form.register('overageCost')}
                  />
                </div>
              </div>

              <SheetFooter className="sm:col-span-2 mt-2">
                <div className="flex w-full items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? 'Save Changes' : 'Create Plan'}</Button>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-full">
        {plans.length === 0 ? (
          <div className="p-6">
            <EmptyCta
              title="No plans yet"
              description="Create your first subscription plan to get started."
              size="small"
              icon={RepeatIcon}
              footerActionProps={[{ type: 'button', onClick: openCreate, children: 'Add Plan' }]}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Contract Length</TableHead>
                <TableHead>Billing Cadence</TableHead>
                <TableHead>Setup Fee</TableHead>
                <TableHead>Prepayment %</TableHead>
                <TableHead>$ Cap</TableHead>
                <TableHead>Overage Cost</TableHead>
                <TableHead># Clients</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.pricingModel}</TableCell>
                  <TableCell>{plan.contractLength}</TableCell>
                  <TableCell>{plan.billingCadence}</TableCell>
                  <TableCell>{formatCurrency(plan.setupFee)}</TableCell>
                  <TableCell>{plan.prepaymentPercent}%</TableCell>
                  <TableCell>{formatCurrency(plan.capAmount)}</TableCell>
                  <TableCell>{formatCurrency(plan.overageCost)}/hr</TableCell>
                  <TableCell>{plan.clientCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => openEdit(plan as Plan)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <PencilIcon className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => requestDelete(plan.id)}
                          className="flex items-center gap-2 cursor-pointer text-destructive"
                        >
                          <TrashIcon className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(open: boolean) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
