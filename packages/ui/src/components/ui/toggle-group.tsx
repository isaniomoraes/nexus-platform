import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md',
        segmented:
          'bg-transparent hover:bg-accent hover:text-accent-foreground border-l border-input first:border-l-0 first:rounded-l-lg last:rounded-r-lg data-[state=on]:bg-muted-foreground data-[state=on]:text-primary-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'segmented',
      size: 'default',
    },
  }
)

export type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        'inline-flex overflow-hidden rounded-lg border bg-background text-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
)
ToggleGroup.displayName = 'ToggleGroup'

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {
  children?: React.ReactNode
  className?: string
  value: string
}

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    data-slot="toggle-group-item"
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
))
ToggleGroupItem.displayName = 'ToggleGroupItem'
