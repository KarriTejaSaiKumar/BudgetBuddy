import { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2, MoreHorizontal, Pencil,
} from "lucide-react";
import {
  ActivityList, ActivityRow, Alert, BalanceHero, Badge, BudgetMeter, Button, Card,
  CardContent, CardHeader, CardTitle, CardDescription,
  ConfirmDialog, DataTable, Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  EmptyState, Field, Input, PageHeader, Progress, SearchInput, SectionHeader, Select,
  Separator, StatCard, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea,
  Tooltip, TooltipProvider,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

const rows = [
  { id: 1, title: "Campus canteen", category: "Food", date: "2026-08-02", amount: 240 },
  { id: 2, title: "Metro pass", category: "Transport", date: "2026-08-01", amount: 1100 },
  { id: 3, title: "Spotify Student", category: "Subscriptions", date: "2026-07-28", amount: 59 },
];

export default function DesignSystem() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(false);

  const toggleDark = (next) => {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="BudgetBuddy Design System"
          description="Tokens, primitives and patterns shared by every page."
          eyebrow="Aurora Glass"
          actions={
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">Dark</span>
              <Switch checked={dark} onCheckedChange={toggleDark} aria-label="Toggle dark mode" />
              <Button size="sm"><Plus />Add</Button>
            </div>
          }
        />

        <section>
          <SectionHeader title="Balance hero" description="The one number that matters" />
          <BalanceHero
            value={formatCurrency(18420)}
            delta={{ direction: "up", value: "4.2%" }}
            message="Your balance grew by ₹512 this month. At this pace you'll clear your savings goal before August ends."
            actions={<Button><Plus />New transaction</Button>}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader title="Recent activity" action={<Button variant="link" size="sm">View all</Button>} />
            <ActivityList>
              <ActivityRow icon={Wallet} title="Campus canteen" meta="Food • 02 Aug" amount="-₹240.00" onClick={() => {}} />
              <ActivityRow icon={TrendingDown} title="Metro pass" meta="Transport • 01 Aug" amount="-₹1,100.00" onClick={() => {}} />
              <ActivityRow icon={TrendingUp} title="Internship stipend" meta="Income • 30 Jul" amount="+₹18,000.00" positive onClick={() => {}} />
            </ActivityList>
          </div>
          <div>
            <SectionHeader title="Category budgets" />
            <Card className="space-y-6 p-6">
              <BudgetMeter name="Food" spent={4360} limit={5000} formatted="₹4,360 / ₹5,000" />
              <BudgetMeter name="Transport" spent={1100} limit={3000} formatted="₹1,100 / ₹3,000" />
              <BudgetMeter name="Subscriptions" spent={640} limit={600} formatted="₹640 / ₹600" />
            </Card>
          </div>
        </section>

        <section>
          <SectionHeader title="Stat cards" description="Dashboard KPI tiles" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Spent this month" value={formatCurrency(6580)} icon={Wallet} progress={72} />
            <StatCard label="Income" value={formatCurrency(25000)} icon={TrendingUp} tone="success" trend={{ direction: "up", value: "12%" }} />
            <StatCard label="Expenses" value={formatCurrency(6580)} icon={TrendingDown} tone="destructive" trend={{ direction: "down", value: "4%" }} />
            <StatCard label="Saved" value={formatCurrency(3200)} icon={PiggyBank} tone="info" hint="Goal ₹5,000" />
          </div>
        </section>

        <section>
          <SectionHeader title="Buttons" />
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              {["default", "secondary", "outline", "ghost", "destructive", "success", "link"].map((v) => (
                <Button key={v} variant={v}>{v}</Button>
              ))}
              <Button loading>Saving</Button>
              <Tooltip label="Delete transaction">
                <Button variant="ghost" size="icon" aria-label="Delete transaction"><Trash2 /></Button>
              </Tooltip>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>Labels, hints and errors are wired automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Title" required hint="Short description of the spend">
                <Input placeholder="Campus canteen" />
              </Field>
              <Field label="Amount" error="Amount must be greater than 0">
                <Input type="number" placeholder="0.00" />
              </Field>
              <Field label="Category">
                <Select defaultValue="food">
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="rent">Rent</option>
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea placeholder="Optional" />
              </Field>
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} placeholder="Search transactions…" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="success" title="Budget saved">Your August food budget is live.</Alert>
                <Alert variant="warning" title="88% of budget used">₹640 left for 9 days.</Alert>
                <Alert variant="error" title="Couldn't reach the server">Check your connection and retry.</Alert>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Food</span><span className="tabular text-muted-foreground">₹4,360 / ₹5,000</span></div>
                  <Progress value={88} tone="warning" label="Food budget used" />
                  <Progress value={42} tone="success" label="Transport budget used" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["default", "primary", "success", "destructive", "warning", "info", "outline"].map((v) => (
                    <Badge key={v} variant={v}>{v}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Overlays</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add expense</DialogTitle>
                      <DialogDescription>Log what you just spent.</DialogDescription>
                    </DialogHeader>
                    <Field label="Amount"><Input type="number" placeholder="0.00" /></Field>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => setConfirm(true)}>Delete…</Button>
                <ConfirmDialog
                  open={confirm}
                  onOpenChange={setConfirm}
                  title="Delete this expense?"
                  description="This permanently removes the record from your history."
                  confirmLabel="Delete"
                  onConfirm={() => setConfirm(false)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Row actions"><MoreHorizontal /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem><Pencil />Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive><Trash2 />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeader title="Data table" description="Loading and empty states included" />
          <Tabs defaultValue="data">
            <TabsList>
              <TabsTrigger value="data">With data</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="empty">Empty</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
              <DataTable
                caption="Recent expenses"
                rows={rows}
                columns={[
                  { key: "title", header: "Title" },
                  { key: "category", header: "Category", cell: (r) => <Badge variant="outline">{r.category}</Badge> },
                  { key: "date", header: "Date", cell: (r) => formatDate(r.date) },
                  { key: "amount", header: "Amount", numeric: true, cell: (r) => formatCurrency(r.amount) },
                ]}
              />
            </TabsContent>
            <TabsContent value="loading">
              <DataTable loading columns={[]} rows={[]} />
            </TabsContent>
            <TabsContent value="empty">
              <DataTable
                columns={[]}
                rows={[]}
                empty={
                  <EmptyState
                    title="No expenses yet"
                    description="Add your first expense to start tracking where your money goes."
                    action={<Button size="sm"><Plus />Add expense</Button>}
                  />
                }
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </TooltipProvider>
  );
}
