import type React from "react";
import {cn} from "@/utils";
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,"size"> {
 ref?:React.Ref<HTMLButtonElement>;size?:"sm"|"md";variant?:"primary"|"outline";startIcon?:React.ReactNode;endIcon?:React.ReactNode;
}
export function buttonClasses(size:"sm"|"md"="md",variant:"primary"|"outline"="primary",disabled=false){return cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition",size==="sm"?"px-4 py-3 text-sm":"px-5 py-3.5 text-sm",variant==="primary"?"bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300":"bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3 dark:hover:text-gray-300",disabled&&"cursor-not-allowed opacity-50");}
export default function Button({children,size="md",variant="primary",startIcon,endIcon,className,disabled=false,type="button",...props}:ButtonProps){return <button {...props} type={type} disabled={disabled} className={cn(buttonClasses(size,variant,disabled),className)}>{startIcon&&<span className="flex items-center">{startIcon}</span>}{children}{endIcon&&<span className="flex items-center">{endIcon}</span>}</button>}
