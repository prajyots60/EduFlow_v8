import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-8">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <Link href="/" className="font-bold text-lg">
            LearnAnything
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LearnAnything. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

