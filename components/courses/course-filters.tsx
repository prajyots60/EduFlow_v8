"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useRouter, useSearchParams } from "next/navigation"

export default function CourseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("query", search)
    } else {
      params.delete("query")
    }

    router.push(`/courses?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Search</h3>
        <form onSubmit={handleSearch} className="space-y-2">
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" className="w-full">
            Search
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="web-dev" />
            <Label htmlFor="web-dev">Web Development</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="mobile-dev" />
            <Label htmlFor="mobile-dev">Mobile Development</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="data-science" />
            <Label htmlFor="data-science">Data Science</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="design" />
            <Label htmlFor="design">Design</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="business" />
            <Label htmlFor="business">Business</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Instructor Rating</h3>
        <Slider defaultValue={[4]} max={5} step={1} />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <Button variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  )
}

