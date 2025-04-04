import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  )
}

