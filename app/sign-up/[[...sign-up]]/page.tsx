import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  )
}

