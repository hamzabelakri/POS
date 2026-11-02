import { Building2, CalendarCheck, Calculator, ShoppingBag, Ticket } from "lucide-react"
import { type Article } from "./types"

// Sample data: replace with real data
export const ARTICLES: Article[] = [
  { id: "lost-ticket", title: "Lost Ticket", icon: Ticket },
  { id: "lost-ticket-calc", title: "Lost Ticket With Calculation", icon: Calculator },
  { id: "season-parker", title: "Season Parker", icon: CalendarCheck },
]

export const VALIDATIONS: Article[] = [
  { id: "mall", title: "Mall Validation", icon: ShoppingBag },
  { id: "hotel", title: "Hotel Validation", icon: Building2 },
]