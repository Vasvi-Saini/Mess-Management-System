import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  date: Date;
  mealType: string | null;
}

export function CreditLedger({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground">No transactions</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
              <TableCell>{t.reason}</TableCell>
              <TableCell>{t.mealType || "N/A"}</TableCell>
              <TableCell className="text-right font-medium">
                +{t.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
