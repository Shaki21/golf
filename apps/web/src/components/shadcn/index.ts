/**
 * shadcn/ui Components
 *
 * NOW POWERED BY CATALYST UI (Tailwind CSS UI Kit)
 *
 * Pre-built, accessible components integrated with TIER Golf design tokens.
 * These components use Tailwind CSS, Headless UI, and are fully customizable.
 *
 * Many of these components are wrappers around Catalyst UI components,
 * providing backward compatibility with the shadcn API while using
 * Catalyst's implementation under the hood.
 *
 * Usage:
 * import { Button, Card, Badge } from 'components/shadcn'
 * import { PlayerStatCard, SkillRadar } from 'components/shadcn/golf'
 */

// Core UI Components
export { Button, buttonVariants } from "./button"
export type { ButtonProps } from "./button"
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants } from "./card"
export type { CardProps } from "./card"
export { Badge, badgeVariants } from "./badge"
export type { BadgeProps } from "./badge"
export { Avatar, AvatarImage, AvatarFallback } from "./avatar"
export { Input } from "./input"
export { Separator } from "./separator"
export { Skeleton } from "./skeleton"

// Dialog & Overlays
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  // Catalyst Direct exports
  CatalystDialog,
  CatalystDialogTitle,
  CatalystDialogDescription,
  CatalystDialogBody,
  CatalystDialogActions,
} from "./dialog"
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet"
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog"
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./drawer"

// Navigation & Menus
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command"

// Form Components
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select"
export { Switch } from "./switch"
export { Slider } from "./slider"
export { Checkbox } from "./checkbox"
export { RadioGroup, RadioGroupItem, RadioField } from "./radio-group"
export { Label } from "./label"
export { Textarea } from "./textarea"
export { Toggle, toggleVariants } from "./toggle"
export { ToggleGroup, ToggleGroupItem } from "./toggle-group"

// Data Display
export { Calendar } from "./calendar"
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table"
export { Progress } from "./progress"
export {
  ChartTooltip,
  GolfLineChart,
  GolfAreaChart,
  GolfBarChart,
  GolfPieChart,
  GolfRadarChart,
  chartColors,
  categoryColorArray,
  statusColorArray,
} from "./chart"

// Feedback & Info
export { Popover, PopoverTrigger, PopoverContent } from "./popover"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card"
export { Toaster } from "./sonner"
export { useToast } from "./use-toast"
export type { ToastOptions } from "./use-toast"
export { Alert, AlertTitle, AlertDescription } from "./alert"

// Layout & Structure
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion"
export { ScrollArea, ScrollBar } from "./scroll-area"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination"
export { AspectRatio } from "./aspect-ratio"

// Golf-specific Premium Components
export * from "./golf"
