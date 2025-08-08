"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { Button, type ButtonProps } from "./button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { cn } from "../../lib/utils"

type FooterAction = ({ type: "button" } & ButtonProps) | ({ type: "link" } & React.ComponentProps<typeof Link>)

// Lightweight Link shim that renders an anchor. Apps can wrap with Next Link if desired.
function Link(props: React.ComponentProps<"a">) {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...props} />
}

export interface EmptyCtaProps {
  title: string
  icon: LucideIcon
  description?: string
  footerActionProps?: FooterAction[]
  size?: "small" | "large"
}

export function EmptyCta({ title, icon, description, footerActionProps = [], size = "large" }: EmptyCtaProps) {
  const Icon = icon
  const isSmall = size === "small"

  return (
    <Card className="bg-muted text-muted-foreground text-center">
      <div className={cn("flex justify-center text-foreground", isSmall ? "p-4 pb-0" : "p-6 pb-0")}>
        <Icon className={cn("stroke-1", !isSmall && "bg-white border border-border rounded-xl p-2")} size={isSmall ? 24 : 70} />
      </div>
      <CardHeader className={cn(isSmall && "p-3 text-xs space-y-1.5")}>
        <CardTitle className="capitalize">{title}</CardTitle>
        {description ? <CardDescription className={cn(isSmall && "text-xs")}>{description}</CardDescription> : null}
      </CardHeader>
      <CardFooter className={cn("flex justify-center gap-3", isSmall && "p-3 pt-0")}>
        {footerActionProps?.map((props, index) =>
          props.type === "button" ? (
            <Button key={index} {...props} size={isSmall ? "sm" : "default"} />
          ) : (
            <Link key={index} {...(props as React.ComponentProps<typeof Link>)} />
          ),
        )}
      </CardFooter>
    </Card>
  )
}


