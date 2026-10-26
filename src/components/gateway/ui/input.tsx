"use client";
import React from "react";
import TailInput from "@/components/form/input/InputField";
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ step, ...props }, ref) {
  return <TailInput {...props} ref={ref} step={step} />;
});
