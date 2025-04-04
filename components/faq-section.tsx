import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the zero-cost model work?",
      answer:
        "Our platform leverages YouTube as the video hosting backend, which allows us to provide the service without charging fees. Instructors upload their videos to YouTube as unlisted videos, and our platform organizes and presents them in a structured learning environment.",
    },
    {
      question: "Can I become an instructor?",
      answer:
        "Yes! Anyone can apply to become an instructor. You'll need to sign up, request instructor access, and wait for admin approval. Once approved, you can start creating courses and hosting live sessions.",
    },
    {
      question: "How do I create a course?",
      answer:
        "After being approved as an instructor, you can create courses through your dashboard. You'll need to provide course details, upload videos to YouTube, and then link them to your course on our platform.",
    },
    {
      question: "How do live classes work?",
      answer:
        "Live classes are powered by YouTube Live. Instructors can schedule and host live sessions, and students can join, watch, and interact through the chat feature.",
    },
    {
      question: "Is there a limit to how many courses I can take?",
      answer: "No, there's no limit to the number of courses you can enroll in as a student.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-slate-400">
              Find answers to common questions about our platform.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

