import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { dark } from "@clerk/themes";
import Header from "@/components/header";
import { Toaster } from "sonner";
const inter=Inter({subsets:["latin"]});

export const metadata={
  title: "Leapskill",
  description:"Leap of Skill"
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      baseTheme:dark
    }}>
    <html lang="en" suppressHydrationWarning>
      <body

        className={`${inter.className}`}
      > <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
          {/* header */}
          <Header />

          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors/>
          {/* footer */}
          <footer className="bg-muted/50 py-12 ">
            <div className="">
              <p className=" contianer mx-auto px-4 text-gray-200 text-center">
                Made with ❤️ by Leapskill team
              </p>
            </div>
          </footer>
        </ThemeProvider>
      
      </body>
        
    </html>
    </ClerkProvider>
  );
}
