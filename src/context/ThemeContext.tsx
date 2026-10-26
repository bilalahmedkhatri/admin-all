"use client";
import {createContext,useContext,useEffect,useSyncExternalStore} from "react";
import type React from "react";
type ThemeMode="light"|"dark"|"auto";type ResolvedTheme="light"|"dark";
type ThemeContextType={theme:ResolvedTheme;themeMode:ThemeMode;setThemeMode:(mode:ThemeMode)=>void;toggleTheme:()=>void};
const ThemeContext=createContext<ThemeContextType|undefined>(undefined);
let fallbackMode:ThemeMode="light";
const valid=(value:unknown):value is ThemeMode=>value==="light"||value==="dark"||value==="auto";
function modeSnapshot():ThemeMode{try{const value=localStorage.getItem("theme-mode")||localStorage.getItem("theme");return valid(value)?value:fallbackMode}catch{return fallbackMode}}
function subscribeMode(listener:()=>void){window.addEventListener("storage",listener);window.addEventListener("gateway-theme-change",listener);return()=>{window.removeEventListener("storage",listener);window.removeEventListener("gateway-theme-change",listener)}}
function subscribeSystem(listener:()=>void){const query=window.matchMedia("(prefers-color-scheme: dark)");query.addEventListener("change",listener);return()=>query.removeEventListener("change",listener)}
function setThemeMode(mode:ThemeMode){if(!valid(mode))return;fallbackMode=mode;try{localStorage.setItem("theme-mode",mode)}catch{/* Theme remains usable when browser storage is blocked. */}window.dispatchEvent(new Event("gateway-theme-change"))}
export function ThemeProvider({children}:{children:React.ReactNode}){
 const themeMode=useSyncExternalStore(subscribeMode,modeSnapshot,()=>"light" as ThemeMode);
 const systemDark=useSyncExternalStore(subscribeSystem,()=>window.matchMedia("(prefers-color-scheme: dark)").matches,()=>false);
 const theme:ResolvedTheme=themeMode==="auto"?(systemDark?"dark":"light"):themeMode;
 useEffect(()=>{document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.setAttribute("data-color-scheme",theme);try{localStorage.setItem("theme",theme)}catch{/* Nonessential preference persistence. */}},[theme]);
 return <ThemeContext.Provider value={{theme,themeMode,setThemeMode,toggleTheme:()=>setThemeMode(theme==="light"?"dark":"light")}}>{children}</ThemeContext.Provider>;
}
export function useTheme(){const value=useContext(ThemeContext);if(!value)throw new Error("useTheme must be used within a ThemeProvider");return value;}
