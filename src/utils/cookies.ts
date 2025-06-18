import { cookies } from "next/headers";

export const cookiesHelper = {
  getAll() {
    return cookies().getAll();
  },
  setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
    try {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookies().set(name, value, options);
      });
    } catch (error) {
      console.error("Error setting cookies:", error);
    }
  },
  removeAll(){
    const cookieStore = cookies();
    return cookies().getAll().forEach((cookie)=> {
      if(cookie.name !== "cookie-consent"){
        cookieStore.delete(cookie.name)
      }
    })
  }
};
