// this line applies next-auth to the entire project without a defined matcher
export { default } from 'next-auth/middleware'


// Applies next-auth to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = { matcher: ["/","/settings","/trending", "/profile","/messages"]}