// Run with playwright-cli run-code --filename tests/login-origin.browser.js after opening /login.
// The form is intercepted before it contacts the gateway or Google.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
 const origin=new URL(page.url()).origin;
 await page.goto(origin+"/login");
 let observed;
 const handler=async route=>{const headers=await route.request().allHeaders();observed=headers.origin;await route.fulfill({status:200,contentType:"text/plain",body:"Intercepted native login form"});};
 await page.route("**/auth/google",handler);
 try{
  await page.getByRole("button",{name:"Continue with Google"}).click();
  await page.waitForURL(origin+"/auth/google");
  if(observed!==origin)throw new Error("Native login POST must retain its same-origin Origin header");
 }finally{await page.unroute("**/auth/google",handler);}
 const rejected=[];
 for(const value of ["null","https://attacker.example"]){const response=await page.request.post(origin+"/auth/google",{headers:{Origin:value}});if(response.status()!==403)throw new Error("Untrusted login Origin was not rejected");rejected.push(response.status());}
 const missing=await page.request.post(origin+"/auth/google");if(missing.status()!==403)throw new Error("Missing login Origin was not rejected");
 return {nativeFormOrigin:observed,rejectedOrigins:rejected,missingOriginStatus:missing.status(),gatewayOrGoogleCalls:0};
}
