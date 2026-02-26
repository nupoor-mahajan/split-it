export const calculateSettlements = (members: any[], expenses: any[]) => {
  const balances: Record<string, number> = {};
  members.forEach(m => balances[m.id] = 0);

  expenses.forEach(exp => {
    // Payer gets the full amount back
    balances[exp.payer_id] += Number(exp.amount);
    
    // Each member's balance is reduced by their specific allocation
    Object.entries(exp.allocations).forEach(([mId, owedAmount]) => {
      balances[mId] -= Number(owedAmount);
    });
  });

  const creditors = members.filter(m => balances[m.id] > 0.01).sort((a, b) => balances[b.id] - balances[a.id]);
  const debtors = members.filter(m => balances[m.id] < -0.01).sort((a, b) => balances[a.id] - balances[b.id]);

  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-balances[debtors[i].id], balances[creditors[j].id]);
    transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: amount.toFixed(2) });
    balances[debtors[i].id] += amount;
    balances[creditors[j].id] -= amount;
    if (Math.abs(balances[debtors[i].id]) < 0.01) i++;
    if (Math.abs(balances[creditors[j].id]) < 0.01) j++;
  }
  return transactions;
};