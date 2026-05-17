const MONTH_DAYS = 30; // Always normalize to 30 days

function calculatePayroll(employee, attendanceSummary, leaveBalance, nsaAmount = 0) {
  const {
    wfh_days, onsite_days, al_taken, hd_taken,
    ph_days, comp_off_days, sick_leave_days
  } = attendanceSummary;

  // Step 1: Total leaves taken (AL + 0.5 per HD)
  const totalLeavesTaken = Number(al_taken || 0) + (Number(hd_taken || 0) * 0.5);

  // Step 2: Approved/Scheduled leaves (exclude PH, SL)
  const approvedLeaves = totalLeavesTaken;

  // Step 3: LWP = max(0, approvedLeaves - balance)
  const lwpDays = Math.max(0, approvedLeaves - Number(leaveBalance?.al_balance || 0));

  // Step 4: Paid days
  const paidDays = MONTH_DAYS - lwpDays;

  // Step 5: Daily salary
  const dailySalary = Number(employee.base_salary) / MONTH_DAYS;

  // Step 6: Calculated salary (prorated)
  const calculatedSalary = dailySalary * paidDays;

  // Step 7: Meal allowance (WFH days × ₹40)
  const mealAllowance = Number(wfh_days || 0) * 40;

  // Step 8: Net pay
  const netPay = calculatedSalary + Number(nsaAmount) + mealAllowance;

  // Step 9: Leave balance carry-forward
  const newLeaveBalance = Math.max(0, Number(leaveBalance?.al_balance || 0) - approvedLeaves);

  return {
    lwp_days: lwpDays,
    paid_days: paidDays,
    calculated_salary: Math.round(calculatedSalary * 100) / 100,
    meal_allowance: mealAllowance,
    nsa_amount: Number(nsaAmount),
    net_pay: Math.round(netPay * 100) / 100,
    leave_balance_next_month: newLeaveBalance,
    approved_leaves: approvedLeaves
  };
}

// Mid-month salary change
function calculateMidMonthSalary(oldSalary, newSalary, changeDay, paidDays, totalDays = 30) {
  const oldDays = Math.min(changeDay - 1, paidDays);
  const newDays = Math.max(0, paidDays - oldDays);
  return (oldSalary / totalDays) * oldDays + (newSalary / totalDays) * newDays;
}

module.exports = { calculatePayroll, calculateMidMonthSalary };
