"use client";
import React from "react";
import TailButton,{buttonClasses} from "@/components/ui/button/Button";
import {cn} from "@/utils";
export type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>&{asChild?:boolean;variant?:"default"|"primary"|"outline"|"secondary"|"ghost"|"destructive"|"link";size?:"default"|"sm"|"icon"};
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(function Button({asChild,children,variant="default",size,className,...props},ref){
 const tailSize=size==="sm"?"sm":"md";const tailVariant=variant==="default"||variant==="primary"?"primary":"outline";
 const extra=cn("focus-visible:outline-2 focus-visible:outline-brand-500",size==="icon"&&"size-10 p-2",variant==="destructive"&&"bg-error-500 text-white hover:bg-error-600 dark:bg-error-500 dark:text-white",className);
 if(asChild&&React.isValidElement<{className?:string}>(children))return React.cloneElement(children,{...props,className:cn(buttonClasses(tailSize,tailVariant,props.disabled),extra,children.props.className)});
 return <TailButton {...props} ref={ref} variant={tailVariant} size={tailSize} className={extra}>{children}</TailButton>;
});
